package com.example.multi.service.clickhouse;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.multi.entity.clickhouse.UserBehaviorLog;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 用户行为日志 Service 接口（ClickHouse）
 * 
 * @author system
 * @date 2024-11-13
 */
public interface UserBehaviorLogService extends IService<UserBehaviorLog> {

    /**
     * 批量插入日志
     * ClickHouse 推荐批量插入以提高性能
     */
    boolean batchInsertLogs(List<UserBehaviorLog> logs);

    /**
     * 根据时间范围查询日志
     */
    List<UserBehaviorLog> listByTimeRange(LocalDateTime startTime, LocalDateTime endTime, Integer limit);

    /**
     * 根据用户ID和时间范围查询日志
     */
    List<UserBehaviorLog> listByUserIdAndTime(Long userId, LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 统计用户行为类型分布
     */
    List<Map<String, Object>> countByBehaviorType(Long userId, LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 按天统计日志数量
     */
    List<Map<String, Object>> countByDay(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 按小时统计日志数量
     */
    List<Map<String, Object>> countByHour(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 查询慢请求日志
     */
    List<UserBehaviorLog> listSlowLogs(Long threshold, LocalDateTime startTime, LocalDateTime endTime, Integer limit);

    /**
     * 统计用户活跃度
     */
    List<Map<String, Object>> countActiveUsers(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 异步批量插入日志（不阻塞主线程）
     */
    void asyncBatchInsertLogs(List<UserBehaviorLog> logs);
}
