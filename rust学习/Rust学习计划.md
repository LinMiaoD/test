# Rust 学习计划

## 阶段一：基础入门（1-2 周）

### 1.1 Rust 简介与环境搭建
- [ ] 安装 Rust（rustup）
- [ ] 配置 IDE（VS Code + rust-analyzer 或 CLion）
- [ ] 熟悉 Cargo 工具链
- [ ] 编写第一个程序 "Hello, World!"

### 1.2 变量与基本数据类型
- [ ] 变量声明与可变性（let、let mut）
- [ ] 基本类型：整数、浮点数、布尔、字符
- [ ] 类型推导与类型标注
- [ ] 常量（const、static）

### 1.3 控制流
- [ ] 条件判断（if、else if、else）
- [ ] 循环（loop、while、for、while let）
- [ ] match 模式匹配
- [ ] if let、while let

### 1.4 函数
- [ ] 函数定义与调用
- [ ] 参数与返回值
- [ ] 表达式与语句
- [ ] 早期返回与 return

---

## 阶段二：所有权与 Borrowing（2-3 周）★ 核心难点

### 2.1 所有权规则
- [ ] 所有权概念与三个规则
- [ ] 移动语义（Move）
- [ ] 克隆（Clone）与复制（Copy）
- [ ] 堆与栈的区别

### 2.2 引用与借用
- [ ] 引用（&）的概念
- [ ] 不可变引用与可变引用
- [ ] 借用规则
- [ ] 悬垂引用（Dangling References）

### 2.3 生命周期
- [ ] 生命周期标注语法
- [ ] 生命周期省略规则
- [ ] 结构体中的生命周期
- [ ] 生命周期省略

---

## 阶段三：复合数据类型（1 周）

### 3.1 元组（Tuple）
- [ ] 元组创建与访问
- [ ] 元组解构
- [ ] 函数返回值使用元组

### 3.2 结构体（Struct）
- [ ] 结构体定义与实例化
- [ ] 结构体方法
- [ ] 关联函数
- [ ] 结构体更新语法（..）

### 3.3 枚举（Enum）
- [ ] 枚举定义
- [ ] Option 枚举
- [ ] match 匹配枚举
- [ ] if let 简化枚举处理

---

## 阶段四：模式匹配（1 周）

### 4.1 match 表达式
- [ ] 基本 match 用法
- [ ] 匹配多个值
- [ ] 范围匹配
- [ ] 下划线通配符

### 4.2 模式语法
- [ ] 解构赋值
- [ ] 守卫条件（match arms with where）
- [ ] @ 绑定

---

## 阶段五：常用集合（1-2 周）

### 5.1 Vector
- [ ] 创建与操作
- [ ] 遍历与修改
- [ ] 常用方法（push、pop、insert、remove）

### 5.2 String 与 &str
- [ ] String 创建与操作
- [ ] &str 字符串切片
- [ ] 字符串索引与编码
- [ ] 常用字符串方法

### 5.3 HashMap
- [ ] 创建与访问
- [ ] 遍历与修改
- [ ] 所有权问题

---

## 阶段六：错误处理（1-2 周）

### 6.1 Result 枚举
- [ ] Result 类型
- [ ] ? 操作符
- [ ] 传播错误
- [ ] 自定义错误类型

### 6.2 panic! 与不可恢复错误
- [ ] panic! 宏
- [ ] panic 时的栈展开与中止
- [ ] expect 与 unwrap

---

## 阶段七：泛型与 trait（2-3 周）

### 7.1 泛型
- [ ] 函数中的泛型
- [ ] 结构体中的泛型
- [ ] 枚举中的泛型
- [ ] 方法中的泛型

### 7.2 Trait
- [ ] trait 定义与实现
- [ ] 默认实现
- [ ] trait 作为参数
- [ ] trait 约束（trait bound）
- [ ] 常用标准 trait（Display、Debug、Default、Clone、Copy）

### 7.3 高级 trait
- [ ] 关联类型
- [ ] trait 继承
- [ ] 空白协议（Blanket Implementations）

---

## 阶段八：生命周期进阶（1 周）

### 8.1 深入生命周期
- [ ] 生命周期子类型
- [ ] 生命周期强制
- [ ] 箱体多态与生命周期

---

## 阶段九：闭包与迭代器（2 周）

### 9.1 闭包
- [ ] 闭包定义与语法
- [ ] 闭包捕获环境
- [ ] Fn、FnMut、FnOnce
- [ ] 闭包作为返回值

### 9.2 迭代器
- [ ] 迭代器与 Iterator trait
- [ ] 迭代器适配器（map、filter、take、skip）
- [ ] 消费器（collect、fold、sum）
- [ ] 自定义迭代器

---

## 阶段十：智能指针（2-3 周）

### 10.1 Box<T>
- [ ] 堆分配
- [ ] 递归类型
- [ ]  Deref trait

### 10.2 引用计数 Rc<T>
- [ ] Rc<T> 用法
- [ ] 引用计数原理

### 10.3 RefCell<T>
- [ ] 内部可变性
- [ ] RefCell<T> 与 Rc<T> 组合
- [ ] 运行时借用检查

### 10.4 智能指针完整图谱
- [ ] Box、Rc、RefCell、Arc、Mutex、RwLock
- [ ] 选择合适智能指针的策略

---

## 阶段十一：并发编程（2-3 周）

### 11.1 并发基础
- [ ] 线程创建（spawn、join）
- [ ] 线程间传递数据
- [ ] mutex 互斥锁
- [ ] 通道（channel）

### 11.2 Send 与 Sync
- [ ] Send trait
- [ ] Sync trait
- [ ] 扩展为线程安全的设计

### 11.3 异步编程入门
- [ ] async/await 基础
- [ ] Future
- [ ] tokio 运行时

---

## 阶段十二：宏与元编程（1-2 周）

### 12.1 声明宏
- [ ] macro_rules! 基础
- [ ] 重复模式
- [ ] $mtt! 标记

### 12.2 过程宏
- [ ] #[derive] 宏
- [ ] 属性宏
- [ ] 函数式宏

---

## 阶段十三：项目实践（持续）

### 13.1 命令行工具
- [ ] clap / structopt 参数解析
- [ ] 文件操作
- [ ] 错误处理

### 13.2 Web 开发
- [ ] Actix-web / Axum
- [ ] 请求与响应处理
- [ ] 中间件

### 13.3 API 开发
- [ ] RESTful API 设计
- [ ] JSON 处理（serde）
- [ ] 数据库交互

---

## 学习资源

### 官方文档
- [The Rust Programming Language](https://doc.rust-lang.org/book/)（Book）
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)
- [Rust Reference](https://doc.rust-lang.org/reference/)

### 练习平台
- [Rustlings](https://github.com/rust-lang/rustlings/) - 交互式练习
- [Exercism Rust Track](https://exercism.org/tracks/rust)
- [LeetCode Rust](https://leetcode.com/problemset/?lang=RUST)

### 项目建议
1. 命令行 Todo 工具
2. HTTP API 服务
3. 文件批处理工具
4. 简单的 HTTP 爬虫

---

## 里程碑检查点

| 阶段 | 预计时间 | 完成标志 |
|------|----------|----------|
| 阶段一~三 | 4-5 周 | 能编写基础 Rust 程序 |
| 阶段四~六 | 3-4 周 | 理解所有权系统 |
| 阶段七~八 | 3-4 周 | 掌握泛型与 trait |
| 阶段九~十 | 4-5 周 | 熟练使用智能指针 |
| 阶段十一~十二 | 3-4 周 | 具备实际项目能力 |

**预计总学习时间：17-22 周**
