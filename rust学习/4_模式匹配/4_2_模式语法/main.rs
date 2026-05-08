// 4.2 模式语法

fn main() {
    // ----- 守卫条件（match guard）-----
    let x = Some(5);
    match x {
        Some(n) if n < 10 => println!("小于10的数: {}", n),
        Some(n) => println!("其他数: {}", n),
        None => println!("没有值"),
    }

    // ----- @ 绑定 -----
    let msg = Message::Hello { id: 5 };
    match msg {
        Message::Hello {
            id: id_variable @ 3..=7,
        } => println!("找到 id 在范围内: {}", id_variable),
        Message::Hello { id: 10..=12 } => println!("id 在另一个范围"),
        Message::Hello { id } => println!("其他 id: {}", id),
    }

    // ----- 解构嵌套 -----
    let ((a, b), Point { x, y }) = ((1, 2), Point { x: 3, y: 4 });
    println!("解构: a={}, b={}, x={}, y={}", a, b, x, y);

    // ----- 下划线通配符 -----
    let secret = 42;
    match secret {
        1..=10 => println!("1-10"),
        _ => println!("其他"),
    }

    // ----- .. 忽略剩余值 -----
    let origin = Point3 { x: 0, y: 0, z: 0 };
    match origin {
        Point3 { x, .. } => println!("x = {}", x),
    }

    // ----- let 模式 -----
    let (x, y, z) = (1, 2, 3);
    println!("let 解构: x={}, y={}, z={}", x, y, z);

    // ----- while let -----
    let mut stack = Vec::new();
    stack.push(1);
    stack.push(2);
    stack.push(3);
    while let Some(top) = stack.pop() {
        println!("pop: {}", top);
    }
}

#[derive(Debug)]
enum Message {
    Hello { id: i32 },
}

#[derive(Debug)]
struct Point3 {
    x: i32,
    y: i32,
    z: i32,
}
