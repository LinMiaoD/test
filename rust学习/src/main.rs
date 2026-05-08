#[path = "环境搭建.rs"]
mod 环境搭建;
#[path = "变量与基本数据类型.rs"]
mod 变量与基本数据类型;
#[path = "控制流.rs"]
mod 控制流;
#[path = "函数.rs"]
mod 函数;
#[path = "2_1_所有权规则.rs"]
mod 所有权规则;
#[path = "2_2_引用与借用.rs"]
mod 引用与借用;
#[path = "2_3_生命周期.rs"]
mod 生命周期;
#[path = "3_1_元组.rs"]
mod 元组;
#[path = "3_2_结构体.rs"]
mod 结构体;
#[path = "3_3_枚举.rs"]
mod 枚举;
#[path = "4_1_match表达式.rs"]
mod match表达式;
#[path = "4_2_模式语法.rs"]
mod 模式语法;
#[path = "5_1_Vector.rs"]
mod vector;
#[path = "5_2_String与str.rs"]
mod string与str;
#[path = "5_3_HashMap.rs"]
mod hashmap;
#[path = "6_1_Result枚举.rs"]
mod result枚举;
#[path = "6_2_panic与不可恢复错误.rs"]
mod panic与不可恢复错误;

fn main() {
    println!("=== Rust 基础入门 ===\n");

    println!("【环境搭建】");
    环境搭建::run();

    println!("\n【变量与基本数据类型】");
    变量与基本数据类型::run();

    println!("\n【控制流】");
    控制流::run();

    println!("\n【函数】");
    函数::run();

    println!("\n=== Rust 所有权与借用 ===\n");

    println!("【2.1 所有权规则】");
    所有权规则::run();

    println!("\n【2.2 引用与借用】");
    引用与借用::run();

    println!("\n【2.3 生命周期】");
    生命周期::run();

    println!("\n=== Rust 复合数据类型 ===\n");

    println!("【3.1 元组】");
    元组::run();

    println!("\n【3.2 结构体】");
    结构体::run();

    println!("\n【3.3 枚举】");
    枚举::run();

    println!("\n=== Rust 模式匹配 ===\n");

    println!("【4.1 match表达式】");
    match表达式::run();

    println!("\n【4.2 模式语法】");
    模式语法::run();

    println!("\n=== Rust 常用集合 ===\n");

    println!("【5.1 Vector】");
    vector::run();

    println!("\n【5.2 String与str】");
    string与str::run();

    println!("\n【5.3 HashMap】");
    hashmap::run();

    println!("\n=== Rust 错误处理 ===\n");

    println!("【6.1 Result枚举】");
    result枚举::run();

    println!("\n【6.2 panic与不可恢复错误】");
    panic与不可恢复错误::run();
}
