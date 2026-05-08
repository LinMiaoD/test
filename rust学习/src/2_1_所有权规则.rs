// 2.1 所有权规则

pub fn run() {
    println!("=== 所有权规则演示 ===");

    // 所有权三个规则：
    // 1. 每个值有一个所有者
    // 2. 每个值同时只能有一个所有者
    // 3. 当所有者离开作用域时，值被丢弃

    // ----- 移动语义 -----
    let s1 = String::from("hello");
    let s2 = s1; // s1 移动到 s2，s1 不再有效
    println!("s2 = {}", s2);
    // println!("{}", s1); // 编译错误！s1 已移动

    // ----- 克隆 -----
    let s3 = String::from("world");
    let s4 = s3.clone(); // 深拷贝
    println!("s3 = {}, s4 = {}", s3, s4);

    // ----- Copy 类型（栈上复制） -----
    let x = 5;
    let y = x;
    println!("x = {}, y = {}（i32 是 Copy）", x, y);

    // ----- 函数中的移动 -----
    let name = String::from("Rust");
    takes_ownership(name);
    // println!("{}", name); // 编译错误！所有权已转移

    let num = 42;
    makes_copy(num);
    println!("num = {} 仍然有效（i32 是 Copy）", num);

    // ----- 返回值与所有权 -----
    let s5 = String::from("hello");
    let s6 = String::from("world");
    let (s7, s8) = take_and_return(s5, s6);
    println!("s7 = {}, s8 = {}", s7, s8);
}

fn takes_ownership(s: String) {
    println!("接管了: {}", s);
} // s 被丢弃

fn makes_copy(x: i32) {
    println!("复制了: {}", x);
} // x 被丢弃（但 i32 是 Copy）

fn take_and_return(a: String, b: String) -> (String, String) {
    (a, b)
}
