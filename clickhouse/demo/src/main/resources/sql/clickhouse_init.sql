-- ClickHouse 建表脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS default;

-- 用户行为日志表
-- 使用 MergeTree 引擎，按日期分区，按时间和用户ID排序
CREATE TABLE IF NOT EXISTS default.user_behavior_log
(
    id              UInt64 COMMENT '日志ID',
    user_id         UInt64 COMMENT '用户ID',
    username        String COMMENT '用户名',
    behavior_type   String COMMENT '行为类型',
    behavior_desc   String COMMENT '行为描述',
    module_name     String COMMENT '模块名称',
    request_method  String COMMENT '请求方法',
    request_uri     String COMMENT '请求URI',
    request_params  String COMMENT '请求参数',
    response_result String COMMENT '响应结果',
    response_time   UInt64 COMMENT '响应时间（毫秒）',
    ip_address      String COMMENT 'IP地址',
    browser         String COMMENT '浏览器类型',
    os              String COMMENT '操作系统',
    create_time     DateTime COMMENT '创建时间',
    log_date        String COMMENT '日期（用于分区）',
    deleted         UInt8 DEFAULT 0 COMMENT '逻辑删除标识（0:未删除, 1:已删除）'
)
ENGINE = MergeTree()
PARTITION BY log_date
ORDER BY (create_time, user_id, id)
TTL create_time + INTERVAL 6 MONTH
SETTINGS index_granularity = 8192;

-- 说明：
-- 1. PARTITION BY log_date：按日期分区，便于管理和查询
-- 2. ORDER BY (create_time, user_id, id)：排序键，影响查询性能
-- 3. TTL：数据保留6个月，自动清理老数据
-- 4. index_granularity：索引粒度，默认8192

-- 插入测试数据
INSERT INTO default.user_behavior_log 
(id, user_id, username, behavior_type, behavior_desc, module_name, request_method, request_uri, 
 request_params, response_result, response_time, ip_address, browser, os, create_time, log_date, deleted)
VALUES
(1, 1001, 'zhangsan', 'LOGIN', '用户登录', '用户模块', 'POST', '/api/user/login', '{"username":"zhangsan"}', 'SUCCESS', 120, '192.168.1.100', 'Chrome', 'Windows', now(), toString(toDate(now())), 0),
(2, 1001, 'zhangsan', 'QUERY', '查询数据', '用户模块', 'GET', '/api/user/list', '{}', 'SUCCESS', 85, '192.168.1.100', 'Chrome', 'Windows', now(), toString(toDate(now())), 0),
(3, 1002, 'lisi', 'LOGIN', '用户登录', '用户模块', 'POST', '/api/user/login', '{"username":"lisi"}', 'SUCCESS', 110, '192.168.1.101', 'Firefox', 'Linux', now(), toString(toDate(now())), 0),
(4, 1003, 'wangwu', 'UPDATE', '更新数据', '系统模块', 'PUT', '/api/system/config', '{"key":"value"}', 'SUCCESS', 200, '192.168.1.102', 'Safari', 'MacOS', now(), toString(toDate(now())), 0),
(5, 1001, 'zhangsan', 'EXPORT', '导出数据', '报表模块', 'GET', '/api/report/export', '{"type":"excel"}', 'SUCCESS', 1500, '192.168.1.100', 'Chrome', 'Windows', now(), toString(toDate(now())), 0);

-- 查询示例

-- 1. 查询最近的日志
SELECT * FROM default.user_behavior_log
WHERE deleted = 0
ORDER BY create_time DESC
LIMIT 100;

-- 2. 统计用户行为类型分布
SELECT behavior_type, COUNT(*) as count
FROM default.user_behavior_log
WHERE user_id = 1001 AND deleted = 0
GROUP BY behavior_type
ORDER BY count DESC;

-- 3. 按天统计日志数量
SELECT toDate(create_time) as date, COUNT(*) as count
FROM default.user_behavior_log
WHERE create_time >= today() - INTERVAL 7 DAY AND deleted = 0
GROUP BY toDate(create_time)
ORDER BY date;

-- 4. 按小时统计日志数量
SELECT toStartOfHour(create_time) as hour, COUNT(*) as count
FROM default.user_behavior_log
WHERE create_time >= today() - INTERVAL 1 DAY AND deleted = 0
GROUP BY toStartOfHour(create_time)
ORDER BY hour;

-- 5. 查询慢请求（响应时间超过1秒）
SELECT *
FROM default.user_behavior_log
WHERE response_time > 1000 AND deleted = 0
ORDER BY response_time DESC
LIMIT 100;

-- 6. 统计用户活跃度
SELECT toDate(create_time) as date, 
       COUNT(DISTINCT user_id) as active_users,
       COUNT(*) as total_actions
FROM default.user_behavior_log
WHERE create_time >= today() - INTERVAL 7 DAY AND deleted = 0
GROUP BY toDate(create_time)
ORDER BY date;

-- 7. 统计不同模块的访问量
SELECT module_name, COUNT(*) as count
FROM default.user_behavior_log
WHERE deleted = 0
GROUP BY module_name
ORDER BY count DESC;

-- 8. 统计不同浏览器的使用情况
SELECT browser, COUNT(*) as count
FROM default.user_behavior_log
WHERE deleted = 0
GROUP BY browser
ORDER BY count DESC;
