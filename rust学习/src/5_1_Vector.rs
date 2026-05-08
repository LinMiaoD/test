// 5.1 Vector

pub fn run() {
    println!("=== Vector 演示 ===");

    // ----- 创建 -----
    let v1: Vec<i32> = Vec::new();
    let v2 = vec![1, 2, 3];
    let v3: Vec<i32> = vec![0; 5]; // 5个0

    println!("v1: {:?}", v1);
    println!("v2: {:?}", v2);
    println!("v3: {:?}", v3);

    // ----- 添加元素 -----
    let mut v = Vec::new();
    v.push(1);
    v.push(2);
    v.push(3);
    println!("push后: {:?}", v);

    // ----- 读取元素 -----
    let third = v[2];
    println!("第三个元素: {}", third);

    let third = v.get(2);
    match third {
        Some(val) => println!("第三个元素: {}", val),
        None => println!("没有第三个元素"),
    }

    // ----- 遍历 -----
    for i in &v {
        println!("元素: {}", i);
    }

    for i in &mut v {
        *i *= 2;
    }
    println!("修改后: {:?}", v);

    // ----- 常用方法 -----
    let mut v4 = vec![1, 2, 3, 4, 5];
    let popped = v4.pop();
    println!("pop: {:?}", popped);
    println!("pop后: {:?}", v4);

    v4.insert(0, 0);
    println!("insert后: {:?}", v4);

    v4.remove(1);
    println!("remove后: {:?}", v4);

    // ----- 使用枚举存储不同类型 -----
    let row = vec![
        SpreadsheetCell::Int(3),
        SpreadsheetCell::Float(3.14),
        SpreadsheetCell::Text(String::from("hello")),
    ];
    println!("枚举向量: {:?}", row);
}

#[derive(Debug)]
enum SpreadsheetCell {
    Int(i32),
    Float(f64),
    Text(String),
}
