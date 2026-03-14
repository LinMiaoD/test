package com.example.multi.service.business;

import com.baomidou.dynamic.datasource.annotation.DS;
import com.example.multi.constant.DataSourceConstant;
import com.example.multi.entity.clickhouse.UserBehaviorLog;
import com.example.multi.entity.mysql.User;
import com.example.multi.service.clickhouse.UserBehaviorLogService;
import com.example.multi.service.mysql.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 综合业务 Service
 * 演示如何在一个 Service 中同时操作 MySQL 和 ClickHouse
 * 
 * 说明：
 * 1. 类级别不添加 @DS 注解，默认使用 primary 数据源（MySQL）
 * 2. 方法级别添加 @DS 注解，指定使用的数据源
 * 3. 方法级别的注解优先级高于类级别
 * 
 * @author system
 * @date 2024-11-13
 */
@Slf4j
@Service
public class IntegratedBusinessService {

    @Autowired
    private UserService userService;

    @Autowired
    private UserBehaviorLogService userBehaviorLogService;

    /**
     * 用户登录业务
     * 1. 从 MySQL 查询用户信息（验证用户）
     * 2. 写入登录日志到 ClickHouse（记录行为）
     * 
     * 注意：不同数据源之间的操作不在同一个事务中
     */
    public Map<String, Object> userLogin(String username, String password, String ipAddress) {
        log.info("用户登录，用户名: {}, IP: {}", username, ipAddress);
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 1. 从 MySQL 查询用户（自动使用 MySQL 数据源）
            User user = userService.getByUsername(username);
            
            if (user == null) {
                result.put("success", false);
                result.put("message", "用户不存在");
                return result;
            }
            
            if (user.getStatus() == 0) {
                result.put("success", false);
                result.put("message", "用户已被禁用");
                
                // 记录登录失败日志到 ClickHouse
                recordLoginLog(user.getId(), username, "FAILED", "用户已被禁用", ipAddress);
                return result;
            }
            
            // 2. 验证密码（此处简化，实际应该加密比对）
            // if (!passwordEncoder.matches(password, user.getPassword())) {
            //     result.put("success", false);
            //     result.put("message", "密码错误");
            //     recordLoginLog(user.getId(), username, "FAILED", "密码错误", ipAddress);
            //     return result;
            // }
            
            // 3. 登录成功，记录日志到 ClickHouse
            recordLoginLog(user.getId(), username, "SUCCESS", "登录成功", ipAddress);
            
            result.put("success", true);
            result.put("message", "登录成功");
            result.put("user", user);
            
            return result;
            
        } catch (Exception e) {
            log.error("用户登录失败", e);
            result.put("success", false);
            result.put("message", "登录异常: " + e.getMessage());
            return result;
        }
    }

    /**
     * 记录登录日志到 ClickHouse
     * 使用异步方式，避免阻塞主流程
     */
    private void recordLoginLog(Long userId, String username, String result, String desc, String ipAddress) {
        try {
            UserBehaviorLog log = new UserBehaviorLog();
            log.setUserId(userId);
            log.setUsername(username);
            log.setBehaviorType("LOGIN");
            log.setBehaviorDesc(desc);
            log.setModuleName("用户模块");
            log.setRequestMethod("POST");
            log.setRequestUri("/api/user/login");
            log.setResponseResult(result);
            log.setIpAddress(ipAddress);
            log.setCreateTime(LocalDateTime.now());
            log.setLogDate(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            
            // 异步插入日志
            userBehaviorLogService.asyncBatchInsertLogs(List.of(log));
            
        } catch (Exception e) {
            log.error("记录登录日志失败", e);
        }
    }

    /**
     * 查询用户详情及其行为日志
     * 1. 从 MySQL 查询用户基本信息
     * 2. 从 ClickHouse 查询用户最近的行为日志
     */
    public Map<String, Object> getUserDetailWithLogs(Long userId, Integer logDays) {
        log.info("查询用户详情及行为日志，用户ID: {}, 日志天数: {}", userId, logDays);
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 1. 查询用户基本信息（MySQL）
            User user = userService.getById(userId);
            if (user == null) {
                result.put("success", false);
                result.put("message", "用户不存在");
                return result;
            }
            
            // 2. 查询用户行为日志（ClickHouse）
            LocalDateTime endTime = LocalDateTime.now();
            LocalDateTime startTime = endTime.minusDays(logDays);
            
            List<UserBehaviorLog> logs = userBehaviorLogService.listByUserIdAndTime(userId, startTime, endTime);
            
            // 3. 统计行为类型分布（ClickHouse）
            List<Map<String, Object>> behaviorStats = userBehaviorLogService.countByBehaviorType(userId, startTime, endTime);
            
            result.put("success", true);
            result.put("user", user);
            result.put("logs", logs);
            result.put("behaviorStats", behaviorStats);
            result.put("logCount", logs.size());
            
            return result;
            
        } catch (Exception e) {
            log.error("查询用户详情及行为日志失败", e);
            result.put("success", false);
            result.put("message", "查询失败: " + e.getMessage());
            return result;
        }
    }

    /**
     * 创建用户并记录操作日志
     * 1. 在 MySQL 中创建用户
     * 2. 在 ClickHouse 中记录创建操作日志
     * 
     * 注意：由于使用了不同的数据源，两个操作不在同一个事务中
     * 如果需要保证一致性，需要使用分布式事务或补偿机制
     */
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> createUserWithLog(User user, String operatorUsername, String ipAddress) {
        log.info("创建用户并记录日志，用户名: {}, 操作人: {}", user.getUsername(), operatorUsername);
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 1. 创建用户（MySQL，在事务中）
            boolean createResult = userService.createUser(user);
            
            if (!createResult) {
                result.put("success", false);
                result.put("message", "创建用户失败");
                return result;
            }
            
            // 2. 记录操作日志（ClickHouse，异步，不在事务中）
            UserBehaviorLog log = new UserBehaviorLog();
            log.setUserId(user.getId());
            log.setUsername(operatorUsername);
            log.setBehaviorType("CREATE");
            log.setBehaviorDesc("创建用户: " + user.getUsername());
            log.setModuleName("用户管理");
            log.setRequestMethod("POST");
            log.setRequestUri("/api/user");
            log.setResponseResult("SUCCESS");
            log.setIpAddress(ipAddress);
            log.setCreateTime(LocalDateTime.now());
            log.setLogDate(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            
            userBehaviorLogService.asyncBatchInsertLogs(List.of(log));
            
            result.put("success", true);
            result.put("message", "创建用户成功");
            result.put("userId", user.getId());
            
            return result;
            
        } catch (Exception e) {
            log.error("创建用户失败", e);
            result.put("success", false);
            result.put("message", "创建失败: " + e.getMessage());
            return result;
        }
    }

    /**
     * 生成用户活跃度报表
     * 综合 MySQL 用户信息和 ClickHouse 行为日志
     */
    public Map<String, Object> generateUserActivityReport(Integer days) {
        log.info("生成用户活跃度报表，天数: {}", days);
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            LocalDateTime endTime = LocalDateTime.now();
            LocalDateTime startTime = endTime.minusDays(days);
            
            // 1. 统计总用户数（MySQL）
            Long totalUsers = userService.countUsers();
            
            // 2. 统计活跃用户（ClickHouse）
            List<Map<String, Object>> activeUserStats = userBehaviorLogService.countActiveUsers(startTime, endTime);
            
            // 3. 按天统计日志数量（ClickHouse）
            List<Map<String, Object>> dailyStats = userBehaviorLogService.countByDay(startTime, endTime);
            
            result.put("success", true);
            result.put("totalUsers", totalUsers);
            result.put("activeUserStats", activeUserStats);
            result.put("dailyStats", dailyStats);
            result.put("reportPeriod", days + "天");
            
            return result;
            
        } catch (Exception e) {
            log.error("生成用户活跃度报表失败", e);
            result.put("success", false);
            result.put("message", "生成报表失败: " + e.getMessage());
            return result;
        }
    }

    /**
     * 演示在方法级别显式指定数据源
     * 虽然 userService 默认使用 MySQL，但可以在调用时切换数据源
     */
    @DS(DataSourceConstant.MYSQL)
    public User getUserFromMySQL(Long userId) {
        log.info("显式从 MySQL 查询用户，ID: {}", userId);
        return userService.getById(userId);
    }

    /**
     * 演示在方法级别显式指定 ClickHouse 数据源
     */
    @DS(DataSourceConstant.CLICKHOUSE)
    public List<UserBehaviorLog> getLogsFromClickHouse(Long userId, LocalDateTime startTime, LocalDateTime endTime) {
        log.info("显式从 ClickHouse 查询日志，用户ID: {}", userId);
        return userBehaviorLogService.listByUserIdAndTime(userId, startTime, endTime);
    }
}
