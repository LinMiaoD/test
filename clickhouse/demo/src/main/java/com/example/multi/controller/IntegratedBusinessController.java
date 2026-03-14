package com.example.multi.controller;

import com.example.multi.common.Result;
import com.example.multi.entity.mysql.User;
import com.example.multi.service.business.IntegratedBusinessService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * 综合业务控制器
 * 演示如何在业务中同时使用 MySQL 和 ClickHouse
 * 
 * @author system
 * @date 2024-11-13
 */
@Slf4j
@RestController
@RequestMapping("/business")
public class IntegratedBusinessController {

    @Autowired
    private IntegratedBusinessService integratedBusinessService;

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(
            @RequestParam String username,
            @RequestParam String password,
            HttpServletRequest request) {
        
        String ipAddress = getClientIp(request);
        log.info("用户登录请求，用户名: {}, IP: {}", username, ipAddress);
        
        try {
            Map<String, Object> result = integratedBusinessService.userLogin(username, password, ipAddress);
            Boolean success = (Boolean) result.get("success");
            String message = (String) result.get("message");
            
            return success ? Result.success(message, result) : Result.fail(message);
        } catch (Exception e) {
            log.error("用户登录失败", e);
            return Result.fail("登录失败: " + e.getMessage());
        }
    }

    /**
     * 查询用户详情及行为日志
     */
    @GetMapping("/user/{userId}/detail")
    public Result<Map<String, Object>> getUserDetail(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "7") Integer logDays) {
        
        log.info("查询用户详情及行为日志，用户ID: {}, 日志天数: {}", userId, logDays);
        
        try {
            Map<String, Object> result = integratedBusinessService.getUserDetailWithLogs(userId, logDays);
            Boolean success = (Boolean) result.get("success");
            String message = (String) result.get("message");
            
            return success ? Result.success(result) : Result.fail(message);
        } catch (Exception e) {
            log.error("查询用户详情失败", e);
            return Result.fail("查询失败: " + e.getMessage());
        }
    }

    /**
     * 创建用户并记录日志
     */
    @PostMapping("/user/create")
    public Result<Map<String, Object>> createUser(
            @RequestBody User user,
            @RequestParam String operatorUsername,
            HttpServletRequest request) {
        
        String ipAddress = getClientIp(request);
        log.info("创建用户请求，用户名: {}, 操作人: {}, IP: {}", user.getUsername(), operatorUsername, ipAddress);
        
        try {
            Map<String, Object> result = integratedBusinessService.createUserWithLog(user, operatorUsername, ipAddress);
            Boolean success = (Boolean) result.get("success");
            String message = (String) result.get("message");
            
            return success ? Result.success(message, result) : Result.fail(message);
        } catch (Exception e) {
            log.error("创建用户失败", e);
            return Result.fail("创建失败: " + e.getMessage());
        }
    }

    /**
     * 生成用户活跃度报表
     */
    @GetMapping("/report/user-activity")
    public Result<Map<String, Object>> generateReport(
            @RequestParam(defaultValue = "30") Integer days) {
        
        log.info("生成用户活跃度报表，天数: {}", days);
        
        try {
            Map<String, Object> result = integratedBusinessService.generateUserActivityReport(days);
            Boolean success = (Boolean) result.get("success");
            
            return success ? Result.success(result) : Result.fail("生成报表失败");
        } catch (Exception e) {
            log.error("生成用户活跃度报表失败", e);
            return Result.fail("生成报表失败: " + e.getMessage());
        }
    }

    /**
     * 获取客户端 IP 地址
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // 对于多级代理，取第一个非 unknown 的 IP
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
