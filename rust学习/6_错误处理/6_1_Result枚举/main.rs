// 6.1 Result 枚举

use std::fs::File;
use std::io::{Read, Error};

fn main() {
    // ----- Result 基本用法 -----
    let result = read_file("test.txt");
    match result {
        Ok(content) => println!("文件内容: {}", content),
        Err(e) => println!("错误: {}", e),
    }

    // ----- ? 操作符 -----
    match read_file_short("test.txt") {
        Ok(s) => println!("简短内容: {}", s),
        Err(e) => println!("错误: {}", e),
    }

    // ----- 自定义错误 -----
    match parse_division(10, 0) {
        Ok(v) => println!("结果: {}", v),
        Err(e) => println!("错误: {}", e),
    }

    // ----- unwrap 和 expect -----
    let file = File::open("Cargo.toml");
    let _file = file.expect("无法打开文件");

    // ----- 链式调用 -----
    let result = read_file("Cargo.toml")
        .map(|content| content.len())
        .map(|len| len * 2);
    println!("长度翻倍: {:?}", result);
}

fn read_file(path: &str) -> Result<String, Error> {
    let mut file = File::open(path)?;
    let mut content = String::new();
    file.read_to_string(&mut content)?;
    Ok(content)
}

fn read_file_short(path: &str) -> Result<String, Error> {
    let mut file = File::open(path)?;
    let mut content = String::new();
    file.read_to_string(&mut content)?;
    Ok(content)
}

fn parse_division(a: i32, b: i32) -> Result<i32, String> {
    if b == 0 {
        Err(String::from("除数不能为零"))
    } else {
        Ok(a / b)
    }
}
