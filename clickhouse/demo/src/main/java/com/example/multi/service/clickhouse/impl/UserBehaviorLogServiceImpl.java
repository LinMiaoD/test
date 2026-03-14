package com.example.multi.service.clickhouse.impl;

import com.baomidou.dynamic.datasource.annotation.DS;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.multi.constant.DataSourceConstant;
import com.example.multi.entity.clickhouse.UserBehaviorLog;
import com.example.multi.mapper.clickhouse.UserBehaviorLogMapper;
import com.example.multi.service.clickhouse.UserBehaviorLogService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * 用户行为日志 Service 实现类（ClickHouse）
 * 
 * 通过 @DS 注解指定该 Service 默认使用 ClickHouse 数据源
 * 
 * @author system
 * @date 2024-11-13
 */
@Slf4j
@Service
@DS(DataSourceConstant.CLICKHOUSE)
public class UserBehaviorLogServiceImpl extends ServiceImpl<UserBehaviorLogMapper, UserBehaviorLog> 
        implements UserBehaviorLogService {

    @Value("${app.batch.size:1000}")
    private Integer batchSize;

    @Value("${app.clickhouse.enabled:true}")
    private Boolean clickhouseEnabled;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    public boolean batchInsertLogs(List<UserBehaviorLog> logs) {
        if (!clickhouseEnabled) {
            log.warn("ClickHouse 已禁用，跳过日志插入");
            return false;
        }

        if (logs == null || logs.isEmpty()) {
            log.warn("日志列表为空，跳过插入");
            return false;
        }

        log.info("批量插入日志到 ClickHouse，数量: {}", logs.size());

        try {
            // 设置日志日期（用于分区）
            logs.forEach(log -> {
                if (log.getCreateTime() == null) {
                    log.setCreateTime(LocalDateTime.now());
                }
                if (log.getLogDate() == null) {
                    log.setLogDate(log.getCreateTime().format(DATE_FORMATTER));
                }
                if (log.getDeleted() == null) {
                    log.setDeleted(0);
                }
            });

            // 批量插入（ClickHouse 建议批量大小在 1000-10000 之间）
            return this.saveBatch(logs, batchSize);
        } catch (Exception e) {
            log.error("批量插入日志失败", e);
            return false;
        }
    }

    @Override
    public List<UserBehaviorLog> listByTimeRange(LocalDateTime startTime, LocalDateTime endTime, Integer limit) {
        log.info("根据时间范围查询日志，开始时间: {}, 结束时间: {}, 限制数量: {}", startTime, endTime, limit);
        
        if (limit == null || limit <= 0) {
            limit = 100;
        }
        
        return baseMapper.selectByTimeRange(startTime, endTime, limit);
    }

    @Override
    public List<UserBehaviorLog> listByUserIdAndTime(Long userId, LocalDateTime startTime, LocalDateTime endTime) {
        log.info("根据用户ID和时间范围查询日志，用户ID: {}, 开始时间: {}, 结束时间: {}", userId, startTime, endTime);
        return baseMapper.selectByUserIdAndTime(userId, startTime, endTime);
    }

    @Override
    public List<Map<String, Object>> countByBehaviorType(Long userId, LocalDateTime startTime, LocalDateTime endTime) {
        log.info("统计用户行为类型分布，用户ID: {}, 开始时间: {}, 结束时间: {}", userId, startTime, endTime);
        return baseMapper.countByBehaviorType(userId, startTime, endTime);
    }

    @Override
    public List<Map<String, Object>> countByDay(LocalDateTime startTime, LocalDateTime endTime) {
        log.info("按天统计日志数量，开始时间: {}, 结束时间: {}", startTime, endTime);
        return baseMapper.countByDay(startTime, endTime);
    }

    @Override
    public List<Map<String, Object>> countByHour(LocalDateTime startTime, LocalDateTime endTime) {
        log.info("按小时统计日志数量，开始时间: {}, 结束时间: {}", startTime, endTime);
        return baseMapper.countByHour(startTime, endTime);
    }

    @Override
    public List<UserBehaviorLog> listSlowLogs(Long threshold, LocalDateTime startTime, LocalDateTime endTime, Integer limit) {
        log.info("查询慢请求日志，阈值: {}ms, 开始时间: {}, 结束时间: {}, 限制数量: {}", threshold, startTime, endTime, limit);
        
        if (limit == null || limit <= 0) {
            limit = 100;
        }
        
        return baseMapper.selectSlowLogs(threshold, startTime, endTime, limit);
    }

    @Override
    public List<Map<String, Object>> countActiveUsers(LocalDateTime startTime, LocalDateTime endTime) {
        log.info("统计用户活跃度，开始时间: {}, 结束时间: {}", startTime, endTime);
        return baseMapper.countActiveUsers(startTime, endTime);
    }

    @Override
    @Async("asyncExecutor")
    public void asyncBatchInsertLogs(List<UserBehaviorLog> logs) {
        log.info("异步批量插入日志到 ClickHouse，数量: {}", logs.size());
        
        try {
            this.batchInsertLogs(logs);
        } catch (Exception e) {
            log.error("异步批量插入日志失败", e);
        }
    }
}
