package com.example.multi.annotation;

import com.baomidou.dynamic.datasource.annotation.DS;

import java.lang.annotation.*;

/**
 * 自定义数据源注解（基于 dynamic-datasource 的 @DS 注解）
 * 
 * 使用方式：
 * 1. 在 Mapper 接口上使用：@DataSource(DataSourceType.MYSQL)
 * 2. 在 Service 类上使用：@DataSource(DataSourceType.CLICKHOUSE)
 * 3. 在 Service 方法上使用（优先级最高）：@DataSource(DataSourceType.MYSQL)
 * 
 * 优先级：方法 > 类 > 默认数据源
 * 
 * @author system
 * @date 2024-11-13
 */
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@DS("")
public @interface DataSource {
    
    /**
     * 数据源名称
     * @see com.example.multi.constant.DataSourceConstant
     */
    String value() default "";
}
