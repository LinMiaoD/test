// 变量与基本数据类型

pub fn run() {
    // 变量声明 - 默认不可变
    let x = 5;
    println!("x = {}", x);

    // 可变变量
    let mut y = 10;
    y = y + 5;
    println!("y = {}", y);

    // 基本数据类型
    // 整数类型
    let a: i32 = -42;      // 有符号32位整数
    let b: u32 = 42;       // 无符号32位整数
    let c: isize = 100;    // 有符号指针大小整数
    let d: usize = 100;    // 无符号指针大小整数

    // 浮点数类型
    let f1: f64 = 3.14159; // 64位浮点数
    let f2: f32 = 2.5;     // 32位浮点数

    // 布尔类型
    let is_rust_cool: bool = true;
    let is_fast: bool = false;

    // 字符类型 (Unicode标量值)
    let c1: char = 'A';
    let c2: char = '中';
    let c3: char = '\'';

    println!("整数: a={}, b={}, c={}, d={}", a, b, c, d);
    println!("浮点: f1={}, f2={}", f1, f2);
    println!("布尔: is_rust_cool={}, is_fast={}", is_rust_cool, is_fast);
    println!("字符: c1={}, c2={}, c3={}", c1, c2, c3);

    // 类型推导
    let inferred = 42;        // 推导为 i32
    let inferred_float = 3.14; // 推导为 f64

    // 常量 (必须标注类型)
    const MAX_SCORE: u32 = 100_000;
    static APP_NAME: &str = "Rust Learning";

    println!("常量 MAX_SCORE = {}", MAX_SCORE);
    println!("静态变量 APP_NAME = {}", APP_NAME);
}
