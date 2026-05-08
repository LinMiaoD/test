// 5.2 String 与 &str

fn main() {
    // ----- 创建 String -----
    let s1 = String::new();
    let s2 = String::from("hello");
    let s3 = "world".to_string();
    let s4 = &s2[0..2];

    println!("s1: '{}'", s1);
    println!("s2: '{}'", s2);
    println!("s3: '{}'", s3);
    println!("s4: '{}'", s4);

    // ----- 更新 String -----
    let mut s5 = String::from("hello");
    s5.push(' ');
    s5.push_str("world");
    println!("push后: '{}'", s5);

    s5 = s5 + "!"; // s5 被移动，不能再使用
    println!("拼接后: '{}'", s5);

    let s6 = String::from("Rust");
    let s7 = format!("{} {}", s6, "is great");
    println!("format: '{}'", s7);

    // ----- 字符串切片 -----
    let hello = "hello world";
    let h = &hello[0..5];
    let w = &hello[6..11];
    println!("h='{}', w='{}'", h, w);

    // ----- 遍历字符串 -----
    for c in "日本語".chars() {
        println!("字符: {}", c);
    }

    for b in "日本語".bytes() {
        println!("字节: {}", b);
    }

    // ----- 常用方法 -----
    let s = String::from("  Hello, World!  ");
    println!("长度: {}", s.len());
    println!("trim: '{}'", s.trim());
    println!("to_uppercase: '{}'", s.to_uppercase());
    println!("contains 'World': {}", s.contains("World"));
    println!("starts_with '  Hello': {}", s.starts_with("  Hello"));
    println!("replace: '{}'", s.replace("World", "Rust"));
}
