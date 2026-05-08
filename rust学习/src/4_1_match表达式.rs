// 4.1 match 表达式

pub fn run() {
    println!("=== match 表达式演示 ===");

    // ----- 基本 match -----
    let x = 1;
    match x {
        1 => println!("one"),
        2 => println!("two"),
        3 => println!("three"),
        _ => println!("其他"),
    }

    // ----- match 绑定值 -----
    let msg = match x {
        1 => "one",
        2 => "two",
        3 => "three",
        _ => "其他",
    };
    println!("msg = {}", msg);

    // ----- 匹配多个值 -----
    let y = 2;
    match y {
        1 | 2 => println!("是一或二"),
        3..=5 => println!("在三到五之间"),
        _ => println!("其他"),
    }

    // ----- 范围匹配 -----
    let c = 'k';
    match c {
        'a'..='z' => println!("小写字母"),
        'A'..='Z' => println!("大写字母"),
        '0'..='9' => println!("数字"),
        _ => println!("其他字符"),
    }

    // ----- 解构元组 -----
    let point = (3, 7);
    match point {
        (0, 0) => println!("原点"),
        (x, 0) => println!("x轴上的点: x={}", x),
        (0, y) => println!("y轴上的点: y={}", y),
        (x, y) => println!("其他点: ({}, {})", x, y),
    }

    // ----- 解构结构体 -----
    let p = Point { x: 1, y: 7 };
    match p {
        Point { x: 0, y: 0 } => println!("原点"),
        Point { x: a, y: b } if a == b => println!("对角线点: {}, {}", a, b),
        Point { x, y } if x > 0 && y > 0 => println!("第一象限: ({}, {})", x, y),
        Point { x, .. } => println!("x = {}", x),
    }
}

struct Point {
    x: i32,
    y: i32,
}
