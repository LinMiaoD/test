package com.example.multi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring Boot 主启动类
 * 
 * @author system
 * @date 2024-11-13
 */
@SpringBootApplication
public class MultiDatasourceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MultiDatasourceApplication.class, args);
        System.out.println("\n========================================");
        System.out.println("多数据源应用启动成功！");
        System.out.println("MySQL 数据源：用于用户信息管理");
        System.out.println("ClickHouse 数据源：用于用户行为日志");
        System.out.println("========================================\n");
    }
}
