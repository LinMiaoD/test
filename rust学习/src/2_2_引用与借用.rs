// 2.2 引用与借用

pub fn run() {
    println!("=== 引用与借用演示 ===");

    // ----- 基本引用 -----
    let s1 = String::from("hello");
    let len = calculate_length(&s1);
    println!("\"{}\" 的长度是 {}", s1, len);

    // ----- 可变引用 -----
    let mut s2 = String::from("hello");
    modify(&mut s2);
    println!("修改后: {}", s2);

    // ----- 借用规则 -----
    // 可以有多个不可变引用 OR 一个可变引用
    let s3 = String::from("world");
    let r1 = &s3;
    let r2 = &s3;
    let r3 = &s3;
    println!("多个不可变引用: r1={}, r2={}, r3={}", r1, r2, r3);

    // ----- 可变引用限制 -----
    let mut s4 = String::from("hello");
    let r4 = &s4;
    let r5 = &s4;
    println!("r4={}, r5={}", r4, r5);
    // 此处之后 r4, r5 不再使用

    let r6 = &mut s4; // OK
    r6.push_str(", world");
    println!("可变引用修改: {}", r6);

    // ----- 字符串切片 -----
    let sentence = String::from("hello world");
    let first = first_word(&sentence);
    println!("第一个单词: {}", first);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}

fn modify(s: &mut String) {
    s.push_str(", world");
}

fn first_word(s: &String) -> &str {
    let bytes = s.as_bytes();
    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }
    &s[..]
}
