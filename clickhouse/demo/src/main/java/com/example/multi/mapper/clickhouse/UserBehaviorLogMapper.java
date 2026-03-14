package com.example.multi.mapper.clickhouse;

import com.baomidou.dynamic.datasource.annotation.DS;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.multi.constant.DataSourceConstant;
import com.example.multi.entity.clickhouse.UserBehaviorLog;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 用户行为日志 Mapper（ClickHouse）
 * 
 * 通过 @DS 注解指定数据源为 ClickHouse
 * 
 * @author system
 * @date 2024-11-13
 */
@Repository
@DS(DataSourceConstant.CLICKHOUSE)
public interface UserBehaviorLogMapper extends BaseMapper<UserBehaviorLog> {

    /**
     * 根据时间范围查询日志
     * ClickHouse 适合时间范围查询
     */
    @Select("SELECT * FROM user_behavior_log " +
            "WHERE create_time >= #{startTime} AND create_time <= #{endTime} " +
            "AND deleted = 0 " +
            "ORDER BY create_time DESC LIMIT #{limit}")
    List<UserBehaviorLog> selectByTimeRange(@Param("startTime") LocalDateTime startTime,
                                            @Param("endTime") LocalDateTime endTime,
                                            @Param("limit") Integer limit);

    /**
     * 根据用户ID和时间范围查询日志
     */
    @Select("SELECT * FROM user_behavior_log " +
            "WHERE user_id = #{userId} " +
            "AND create_time >= #{startTime} AND create_time <= #{endTime} " +
            "AND deleted = 0 " +
            "ORDER BY create_time DESC")
    List<UserBehaviorLog> selectByUserIdAndTime(@Param("userId") Long userId,
                                                 @Param("startTime") LocalDateTime startTime,
                                                 @Param("endTime") LocalDateTime endTime);

    /**
     * 统计用户行为类型分布
     */
    @Select("SELECT behavior_type, COUNT(*) as count " +
            "FROM user_behavior_log " +
            "WHERE user_id = #{userId} " +
            "AND create_time >= #{startTime} AND create_time <= #{endTime} " +
            "AND deleted = 0 " +
            "GROUP BY behavior_type " +
            "ORDER BY count DESC")
    List<Map<String, Object>> countByBehaviorType(@Param("userId") Long userId,
                                                   @Param("startTime") LocalDateTime startTime,
                                                   @Param("endTime") LocalDateTime endTime);

    /**
     * 按天统计日志数量
     */
    @Select("SELECT toDate(create_time) as date, COUNT(*) as count " +
            "FROM user_behavior_log " +
            "WHERE create_time >= #{startTime} AND create_time <= #{endTime} " +
            "AND deleted = 0 " +
            "GROUP BY toDate(create_time) " +
            "ORDER BY date")
    List<Map<String, Object>> countByDay(@Param("startTime") LocalDateTime startTime,
                                         @Param("endTime") LocalDateTime endTime);

    /**
     * 按小时统计日志数量
     */
    @Select("SELECT toStartOfHour(create_time) as hour, COUNT(*) as count " +
            "FROM user_behavior_log " +
            "WHERE create_time >= #{startTime} AND create_time <= #{endTime} " +
            "AND deleted = 0 " +
            "GROUP BY toStartOfHour(create_time) " +
            "ORDER BY hour")
    List<Map<String, Object>> countByHour(@Param("startTime") LocalDateTime startTime,
                                          @Param("endTime") LocalDateTime endTime);

    /**
     * 查询慢请求日志（响应时间超过阈值）
     */
    @Select("SELECT * FROM user_behavior_log " +
            "WHERE response_time > #{threshold} " +
            "AND create_time >= #{startTime} AND create_time <= #{endTime} " +
            "AND deleted = 0 " +
            "ORDER BY response_time DESC LIMIT #{limit}")
    List<UserBehaviorLog> selectSlowLogs(@Param("threshold") Long threshold,
                                         @Param("startTime") LocalDateTime startTime,
                                         @Param("endTime") LocalDateTime endTime,
                                         @Param("limit") Integer limit);

    /**
     * 统计用户活跃度（按天）
     */
    @Select("SELECT toDate(create_time) as date, " +
            "COUNT(DISTINCT user_id) as active_users, " +
            "COUNT(*) as total_actions " +
            "FROM user_behavior_log " +
            "WHERE create_time >= #{startTime} AND create_time <= #{endTime} " +
            "AND deleted = 0 " +
            "GROUP BY toDate(create_time) " +
            "ORDER BY date")
    List<Map<String, Object>> countActiveUsers(@Param("startTime") LocalDateTime startTime,
                                                @Param("endTime") LocalDateTime endTime);
}
