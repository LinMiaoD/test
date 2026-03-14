package com.example.multi.controller;

import com.example.multi.common.Result;
import com.example.multi.entity.clickhouse.UserBehaviorLog;
import com.example.multi.service.clickhouse.UserBehaviorLogService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 用户行为日志控制器（ClickHouse）
 * 
 * @author system
 * @date 2024-11-13
 */
@Slf4j
@RestController
@RequestMapping("/behavior-log")
public class UserBehaviorLogController {

    @Autowired
    private UserBehaviorLogService userBehaviorLogService;

    /**
     * 批量插入日志（同步）
     */
    @PostMapping("/batch")
    public Result<String> batchInsert(@RequestBody List<UserBehaviorLog> logs) {
        log.info("批量插入日志，数量: {}", logs.size());
        
        try {
            boolean result = userBehaviorLogService.batchInsertLogs(logs);
            return result ? Result.success("批量插入成功") : Result.fail("批量插入失败");
        } catch (Exception e) {
            log.error("批量插入日志失败", e);
            return Result.fail("批量插入失败: " + e.getMessage());
        }
    }

    /**
     * 批量插入日志（异步）
     */
    @PostMapping("/batch/async")
    public Result<String> batchInsertAsync(@RequestBody List<UserBehaviorLog> logs) {
        log.info("异步批量插入日志，数量: {}", logs.size());
        
        try {
            userBehaviorLogService.asyncBatchInsertLogs(logs);
            return Result.success("已提交异步插入任务");
        } catch (Exception e) {
            log.error("异步批量插入日志失败", e);
            return Result.fail("异步插入失败: " + e.getMessage());
        }
    }

    /**
     * 根据时间范围查询日志
     */
    @GetMapping("/time-range")
    public Result<List<UserBehaviorLog>> listByTimeRange(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime,
            @RequestParam(defaultValue = "100") Integer limit) {
        
        log.info("根据时间范围查询日志，开始时间: {}, 结束时间: {}, 限制数量: {}", startTime, endTime, limit);
        
        try {
            List<UserBehaviorLog> logs = userBehaviorLogService.listByTimeRange(startTime, endTime, limit);
            return Result.success(logs);
        } catch (Exception e) {
            log.error("查询日志失败", e);
            return Result.fail("查询失败: " + e.getMessage());
        }
    }

    /**
     * 根据用户ID和时间范围查询日志
     */
    @GetMapping("/user/{userId}")
    public Result<List<UserBehaviorLog>> listByUserIdAndTime(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        
        log.info("根据用户ID和时间范围查询日志，用户ID: {}, 开始时间: {}, 结束时间: {}", userId, startTime, endTime);
        
        try {
            List<UserBehaviorLog> logs = userBehaviorLogService.listByUserIdAndTime(userId, startTime, endTime);
            return Result.success(logs);
        } catch (Exception e) {
            log.error("查询用户日志失败", e);
            return Result.fail("查询失败: " + e.getMessage());
        }
    }

    /**
     * 统计用户行为类型分布
     */
    @GetMapping("/statistics/behavior-type/{userId}")
    public Result<List<Map<String, Object>>> countByBehaviorType(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        
        log.info("统计用户行为类型分布，用户ID: {}, 开始时间: {}, 结束时间: {}", userId, startTime, endTime);
        
        try {
            List<Map<String, Object>> result = userBehaviorLogService.countByBehaviorType(userId, startTime, endTime);
            return Result.success(result);
        } catch (Exception e) {
            log.error("统计用户行为类型失败", e);
            return Result.fail("统计失败: " + e.getMessage());
        }
    }

    /**
     * 按天统计日志数量
     */
    @GetMapping("/statistics/day")
    public Result<List<Map<String, Object>>> countByDay(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        
        log.info("按天统计日志数量，开始时间: {}, 结束时间: {}", startTime, endTime);
        
        try {
            List<Map<String, Object>> result = userBehaviorLogService.countByDay(startTime, endTime);
            return Result.success(result);
        } catch (Exception e) {
            log.error("按天统计日志失败", e);
            return Result.fail("统计失败: " + e.getMessage());
        }
    }

    /**
     * 按小时统计日志数量
     */
    @GetMapping("/statistics/hour")
    public Result<List<Map<String, Object>>> countByHour(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        
        log.info("按小时统计日志数量，开始时间: {}, 结束时间: {}", startTime, endTime);
        
        try {
            List<Map<String, Object>> result = userBehaviorLogService.countByHour(startTime, endTime);
            return Result.success(result);
        } catch (Exception e) {
            log.error("按小时统计日志失败", e);
            return Result.fail("统计失败: " + e.getMessage());
        }
    }

    /**
     * 查询慢请求日志
     */
    @GetMapping("/slow-logs")
    public Result<List<UserBehaviorLog>> listSlowLogs(
            @RequestParam(defaultValue = "1000") Long threshold,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime,
            @RequestParam(defaultValue = "100") Integer limit) {
        
        log.info("查询慢请求日志，阈值: {}ms, 开始时间: {}, 结束时间: {}, 限制数量: {}", threshold, startTime, endTime, limit);
        
        try {
            List<UserBehaviorLog> logs = userBehaviorLogService.listSlowLogs(threshold, startTime, endTime, limit);
            return Result.success(logs);
        } catch (Exception e) {
            log.error("查询慢请求日志失败", e);
            return Result.fail("查询失败: " + e.getMessage());
        }
    }

    /**
     * 统计用户活跃度
     */
    @GetMapping("/statistics/active-users")
    public Result<List<Map<String, Object>>> countActiveUsers(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        
        log.info("统计用户活跃度，开始时间: {}, 结束时间: {}", startTime, endTime);
        
        try {
            List<Map<String, Object>> result = userBehaviorLogService.countActiveUsers(startTime, endTime);
            return Result.success(result);
        } catch (Exception e) {
            log.error("统计用户活跃度失败", e);
            return Result.fail("统计失败: " + e.getMessage());
        }
    }
}
