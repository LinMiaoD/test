package com.example.multi.entity.clickhouse;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 用户行为日志实体类（ClickHouse）
 * 
 * @author system
 * @date 2024-11-13
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("user_behavior_log")
public class UserBehaviorLog implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 日志ID（ClickHouse 不使用自增，使用雪花算法生成）
     */
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 用户ID
     */
    @TableField("user_id")
    private Long userId;

    /**
     * 用户名
     */
    @TableField("username")
    private String username;

    /**
     * 行为类型（LOGIN, LOGOUT, QUERY, UPDATE, DELETE, EXPORT 等）
     */
    @TableField("behavior_type")
    private String behaviorType;

    /**
     * 行为描述
     */
    @TableField("behavior_desc")
    private String behaviorDesc;

    /**
     * 模块名称
     */
    @TableField("module_name")
    private String moduleName;

    /**
     * 请求方法
     */
    @TableField("request_method")
    private String requestMethod;

    /**
     * 请求URI
     */
    @TableField("request_uri")
    private String requestUri;

    /**
     * 请求参数
     */
    @TableField("request_params")
    private String requestParams;

    /**
     * 响应结果（成功/失败）
     */
    @TableField("response_result")
    private String responseResult;

    /**
     * 响应时间（毫秒）
     */
    @TableField("response_time")
    private Long responseTime;

    /**
     * IP地址
     */
    @TableField("ip_address")
    private String ipAddress;

    /**
     * 浏览器类型
     */
    @TableField("browser")
    private String browser;

    /**
     * 操作系统
     */
    @TableField("os")
    private String os;

    /**
     * 创建时间
     */
    @TableField("create_time")
    private LocalDateTime createTime;

    /**
     * 日期（用于分区）
     */
    @TableField("log_date")
    private String logDate;

    /**
     * 逻辑删除标识（ClickHouse 不支持真正的删除，仅作标记）
     */
    @TableField("deleted")
    private Integer deleted;
}
