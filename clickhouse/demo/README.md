# Spring Boot + MyBatis-Plus 多数据源（MySQL + ClickHouse）企业级集成方案

## 项目概述

本项目实现了 Spring Boot + MyBatis-Plus 集成 MySQL 和 ClickHouse 双数据源的企业级解决方案。

### 核心特性

- ✅ **动态数据源切换**：使用 `@DS` 注解灵活切换数据源
- ✅ **自动填充**：创建时间、更新时间自动填充
- ✅ **逻辑删除**：支持软删除功能
- ✅ **分页查询**：集成 MyBatis-Plus 分页插件
- ✅ **异步日志**：ClickHouse 日志异步批量写入，不阻塞主线程
- ✅ **连接池管理**：使用 Druid 连接池，提供监控功能
- ✅ **统一返回**：标准化的 API 响应格式
- ✅ **企业级实践**：完整的分层架构和异常处理

## 技术栈

| 技术 | 版本 | 说明 |
|-----|------|-----|
| Spring Boot | 2.7.14 | 基础框架 |
| MyBatis-Plus | 3.5.3.1 | ORM 框架 |
| Dynamic DataSource | 3.6.1 | 动态数据源 |
| MySQL | 8.0+ | 关系型数据库 |
| ClickHouse | 22.x+ | 列式数据库 |
| Druid | 1.2.18 | 数据库连接池 |
| Lombok | - | 简化代码 |

## 项目结构

```
multi-datasource/
├── pom.xml                                         # Maven 依赖
├── src/main/
│   ├── java/com/example/multi/
│   │   ├── MultiDatasourceApplication.java        # 启动类
│   │   ├── annotation/
│   │   │   └── DataSource.java                    # 自定义数据源注解
│   │   ├── common/
│   │   │   └── Result.java                        # 统一返回结果
│   │   ├── config/
│   │   │   ├── AsyncConfig.java                   # 异步配置
│   │   │   └── MybatisPlusConfig.java            # MyBatis-Plus 配置
│   │   ├── constant/
│   │   │   └── DataSourceConstant.java           # 数据源常量
│   │   ├── controller/
│   │   │   ├── UserController.java               # MySQL 控制器
│   │   │   ├── UserBehaviorLogController.java    # ClickHouse 控制器
│   │   │   └── IntegratedBusinessController.java # 综合业务控制器
│   │   ├── entity/
│   │   │   ├── mysql/
│   │   │   │   └── User.java                     # MySQL 实体
│   │   │   └── clickhouse/
│   │   │       └── UserBehaviorLog.java          # ClickHouse 实体
│   │   ├── mapper/
│   │   │   ├── mysql/
│   │   │   │   └── UserMapper.java               # MySQL Mapper
│   │   │   └── clickhouse/
│   │   │       └── UserBehaviorLogMapper.java    # ClickHouse Mapper
│   │   └── service/
│   │       ├── mysql/
│   │       │   ├── UserService.java              # MySQL Service 接口
│   │       │   └── impl/
│   │       │       └── UserServiceImpl.java      # MySQL Service 实现
│   │       ├── clickhouse/
│   │       │   ├── UserBehaviorLogService.java   # ClickHouse Service 接口
│   │       │   └── impl/
│   │       │       └── UserBehaviorLogServiceImpl.java
│   │       └── business/
│   │           └── IntegratedBusinessService.java # 综合业务 Service
│   └── resources/
│       ├── application.yml                        # 配置文件
│       └── sql/
│           ├── mysql_init.sql                     # MySQL 建表脚本
│           └── clickhouse_init.sql                # ClickHouse 建表脚本
└── README.md
```

## 核心配置

### 1. 数据源配置（application.yml）

```yaml
spring:
  datasource:
    dynamic:
      # 默认数据源
      primary: mysql
      # 严格模式
      strict: false
      datasource:
        # MySQL 数据源
        mysql:
          driver-class-name: com.mysql.cj.jdbc.Driver
          url: jdbc:mysql://localhost:3306/test_db
          username: root
          password: root123456
        
        # ClickHouse 数据源
        clickhouse:
          driver-class-name: com.clickhouse.jdbc.ClickHouseDriver
          url: jdbc:clickhouse://localhost:8123/default
          username: default
          password: 
```

### 2. 数据源切换方式

#### 方式一：在 Mapper 接口上使用 @DS 注解（推荐）

```java
@Repository
@DS(DataSourceConstant.MYSQL)
public interface UserMapper extends BaseMapper<User> {
    // MySQL 数据操作
}

@Repository
@DS(DataSourceConstant.CLICKHOUSE)
public interface UserBehaviorLogMapper extends BaseMapper<UserBehaviorLog> {
    // ClickHouse 数据操作
}
```

#### 方式二：在 Service 类上使用 @DS 注解

```java
@Service
@DS(DataSourceConstant.MYSQL)
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    // 该类的所有方法默认使用 MySQL
}
```

#### 方式三：在 Service 方法上使用 @DS 注解（优先级最高）

```java
@Service
public class IntegratedBusinessService {
    
    // 显式指定使用 MySQL
    @DS(DataSourceConstant.MYSQL)
    public User getUserFromMySQL(Long userId) {
        return userService.getById(userId);
    }
    
    // 显式指定使用 ClickHouse
    @DS(DataSourceConstant.CLICKHOUSE)
    public List<UserBehaviorLog> getLogsFromClickHouse(...) {
        return logService.listByUserIdAndTime(...);
    }
}
```

### 3. 数据源切换优先级

```
方法级别 @DS > 类级别 @DS > Mapper 接口 @DS > 默认数据源（primary）
```

## 快速开始

### 1. 环境准备

#### 安装 MySQL

```bash
# Docker 方式
docker run -d \
  --name mysql \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root123456 \
  mysql:8.0
```

#### 安装 ClickHouse

```bash
# Docker 方式
docker run -d \
  --name clickhouse \
  -p 8123:8123 \
  -p 9000:9000 \
  --ulimit nofile=262144:262144 \
  clickhouse/clickhouse-server
```

### 2. 初始化数据库

```bash
# 初始化 MySQL
mysql -h localhost -P 3306 -u root -p < src/main/resources/sql/mysql_init.sql

# 初始化 ClickHouse
clickhouse-client --host localhost --port 9000 < src/main/resources/sql/clickhouse_init.sql
```

### 3. 修改配置

根据实际环境修改 `application.yml` 中的数据库连接信息。

### 4. 启动项目

```bash
mvn clean package
java -jar target/multi-datasource-integration-1.0.0.jar

# 或者直接运行
mvn spring-boot:run
```

## API 接口文档

### MySQL 用户管理接口

#### 1. 分页查询用户

```
GET /api/user/page?current=1&size=10&username=zhang
```

#### 2. 查询用户详情

```
GET /api/user/{id}
```

#### 3. 创建用户

```
POST /api/user
Content-Type: application/json

{
  "username": "testuser",
  "realName": "测试用户",
  "email": "test@example.com",
  "phone": "13800138000",
  "status": 1
}
```

#### 4. 更新用户

```
PUT /api/user
Content-Type: application/json

{
  "id": 1,
  "realName": "新名字",
  "status": 0
}
```

#### 5. 删除用户

```
DELETE /api/user/{id}
```

### ClickHouse 日志查询接口

#### 1. 批量插入日志

```
POST /api/behavior-log/batch
Content-Type: application/json

[
  {
    "userId": 1001,
    "username": "zhangsan",
    "behaviorType": "LOGIN",
    "behaviorDesc": "用户登录",
    "ipAddress": "192.168.1.100"
  }
]
```

#### 2. 时间范围查询

```
GET /api/behavior-log/time-range?startTime=2024-01-01 00:00:00&endTime=2024-12-31 23:59:59&limit=100
```

#### 3. 按天统计

```
GET /api/behavior-log/statistics/day?startTime=2024-01-01 00:00:00&endTime=2024-12-31 23:59:59
```

#### 4. 查询慢请求

```
GET /api/behavior-log/slow-logs?threshold=1000&startTime=2024-01-01 00:00:00&endTime=2024-12-31 23:59:59&limit=100
```

### 综合业务接口

#### 1. 用户登录（同时操作 MySQL 和 ClickHouse）

```
POST /api/business/login?username=zhangsan&password=123456
```

#### 2. 查询用户详情及行为日志

```
GET /api/business/user/{userId}/detail?logDays=7
```

#### 3. 创建用户并记录日志

```
POST /api/business/user/create?operatorUsername=admin
Content-Type: application/json

{
  "username": "newuser",
  "realName": "新用户",
  "email": "newuser@example.com"
}
```

#### 4. 生成用户活跃度报表

```
GET /api/business/report/user-activity?days=30
```

## 核心实现细节

### 1. 如何确保写入正确的数据源？

**答案**：通过 `@DS` 注解指定数据源

```java
// 在 Mapper 接口上标注（推荐）
@DS(DataSourceConstant.MYSQL)
public interface UserMapper extends BaseMapper<User> {}

@DS(DataSourceConstant.CLICKHOUSE)
public interface UserBehaviorLogMapper extends BaseMapper<UserBehaviorLog> {}

// 在 Service 类上标注
@DS(DataSourceConstant.MYSQL)
public class UserServiceImpl implements UserService {}

// 在 Service 方法上标注（优先级最高）
@DS(DataSourceConstant.CLICKHOUSE)
public void saveLog() {}
```

### 2. 不同数据源的事务处理

**重要提示**：不同数据源之间的操作**不在同一个事务中**！

```java
@Service
public class IntegratedBusinessService {
    
    @Transactional  // 只对 MySQL 生效
    public void createUserWithLog(User user) {
        // MySQL 操作（在事务中）
        userService.createUser(user);
        
        // ClickHouse 操作（不在事务中，异步执行）
        logService.asyncBatchInsertLogs(logs);
    }
}
```

**解决方案**：
- 使用分布式事务（Seata）
- 使用补偿机制
- 使用消息队列（Kafka、RabbitMQ）保证最终一致性

### 3. ClickHouse 异步写入

为避免阻塞主线程，日志写入采用异步方式：

```java
@Service
@DS(DataSourceConstant.CLICKHOUSE)
public class UserBehaviorLogServiceImpl implements UserBehaviorLogService {
    
    @Async("asyncExecutor")
    public void asyncBatchInsertLogs(List<UserBehaviorLog> logs) {
        this.saveBatch(logs, 1000);
    }
}
```

### 4. MyBatis-Plus 自动填充

```java
@Bean
public MetaObjectHandler metaObjectHandler() {
    return new MetaObjectHandler() {
        @Override
        public void insertFill(MetaObject metaObject) {
            this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
            this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
            this.strictInsertFill(metaObject, "deleted", Integer.class, 0);
        }
        
        @Override
        public void updateFill(MetaObject metaObject) {
            this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
        }
    };
}
```

## 最佳实践

### 1. 数据源选择原则

| 场景 | 推荐数据源 | 原因 |
|-----|-----------|-----|
| 用户信息、订单、交易 | MySQL | 支持事务、强一致性 |
| 日志、监控、报表 | ClickHouse | 写入快、查询快、压缩率高 |
| 实时统计分析 | ClickHouse | OLAP 场景优势明显 |
| 频繁更新 | MySQL | ClickHouse 不适合高频更新 |

### 2. 批量写入优化

```java
// ClickHouse 批量写入建议大小：1000-10000
userBehaviorLogService.saveBatch(logs, 1000);

// 异步批量写入，不阻塞主线程
userBehaviorLogService.asyncBatchInsertLogs(logs);
```

### 3. 查询优化

```java
// ClickHouse 适合时间范围查询
SELECT * FROM user_behavior_log
WHERE create_time >= '2024-01-01' AND create_time <= '2024-12-31'
ORDER BY create_time DESC;

// 利用分区查询
WHERE log_date = '2024-11-13';

// 只查询需要的字段（列式存储优势）
SELECT user_id, behavior_type, create_time FROM user_behavior_log;
```

### 4. 连接池配置

```yaml
druid:
  initial-size: 5      # 初始连接数
  min-idle: 5          # 最小空闲连接数
  max-active: 20       # 最大活跃连接数
  max-wait: 60000      # 最大等待时间（毫秒）
```

## 常见问题

### Q1: 如何切换默认数据源？

修改 `application.yml`：

```yaml
spring:
  datasource:
    dynamic:
      primary: clickhouse  # 修改为 clickhouse
```

### Q2: 如何禁用某个数据源？

修改配置文件，注释掉对应数据源配置，或在代码中判断：

```yaml
app:
  clickhouse:
    enabled: false  # 禁用 ClickHouse
```

### Q3: 如何监控数据源？

访问 Druid 监控页面：

```
http://localhost:8080/api/druid/index.html
用户名：admin
密码：admin123
```

### Q4: 如何处理数据源切换失败？

检查以下几点：
1. `@DS` 注解的值是否正确
2. 数据源配置是否正确
3. 日志中是否有连接异常
4. 检查 `dynamic-datasource` 依赖是否正确引入

## 性能优化建议

### MySQL 优化

1. 合理使用索引
2. 避免 SELECT *
3. 使用批量操作
4. 合理使用分页

### ClickHouse 优化

1. 选择合适的表引擎（MergeTree）
2. 合理设计分区键
3. 优化排序键（ORDER BY）
4. 批量写入（1000-10000条）
5. 使用物化视图预聚合
6. 设置 TTL 自动清理老数据

## License

MIT License

---

**作者**：System  
**日期**：2024-11-13  
**版本**：1.0.0
