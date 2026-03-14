-- MySQL 建表脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS test_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE test_db;

-- 用户表
DROP TABLE IF EXISTS t_user;
CREATE TABLE t_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    real_name VARCHAR(50) COMMENT '真实姓名',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    status TINYINT DEFAULT 1 COMMENT '状态（0:禁用, 1:启用）',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标识（0:未删除, 1:已删除）',
    INDEX idx_username (username),
    INDEX idx_phone (phone),
    INDEX idx_create_time (create_time),
    INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 插入测试数据
INSERT INTO t_user (username, real_name, email, phone, status) VALUES
('zhangsan', '张三', 'zhangsan@example.com', '13800138001', 1),
('lisi', '李四', 'lisi@example.com', '13800138002', 1),
('wangwu', '王五', 'wangwu@example.com', '13800138003', 1),
('zhaoliu', '赵六', 'zhaoliu@example.com', '13800138004', 0),
('sunqi', '孙七', 'sunqi@example.com', '13800138005', 1);

-- 查询验证
SELECT * FROM t_user WHERE deleted = 0;
