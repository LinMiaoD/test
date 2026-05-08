// 3.2 结构体（Struct）

fn main() {
    // ----- 定义与实例化 -----
    let user1 = User {
        username: String::from("alice"),
        email: String::from("alice@example.com"),
        active: true,
        sign_in_count: 1,
    };
    println!("用户: {} - {}", user1.username, user1.email);

    // ----- 可变实例 -----
    let mut user2 = User {
        username: String::from("bob"),
        email: String::from("bob@example.com"),
        active: false,
        sign_in_count: 0,
    };
    user2.email = String::from("new@bobby.com");
    println!("用户2: {}", user2.email);

    // ----- 结构体更新语法 -----
    let user3 = User {
        username: String::from("charlie"),
        ..user1.clone()
    };
    println!("用户3: {} - {}", user3.username, user3.email);

    // ----- 元组结构体 -----
    let color = Color(255, 0, 0);
    let point = Point(0, 4, -2);
    println!("颜色: R={}, G={}, B={}", color.0, color.1, color.2);
    println!("点: x={}, y={}, z={}", point.0, point.1, point.2);

    // ----- 方法 -----
    let rect = Rectangle {
        width: 30,
        height: 50,
    };
    println!("矩形面积: {}", rect.area());
    println!("矩形能容下方形吗? {}", rect.can_hold(&Rectangle { width: 10, height: 40 }));

    // ----- 关联函数 -----
    let square = Rectangle::square(10);
    println!("方形: {}x{}", square.width, square.height);
}

#[derive(Debug, Clone)]
struct User {
    username: String,
    email: String,
    active: bool,
    sign_in_count: u64,
}

struct Color(i32, i32, i32);
struct Point(i32, i32, i32);

#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    // 方法
    fn area(&self) -> u32 {
        self.width * self.height
    }

    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }

    // 关联函数（构造器）
    fn square(size: u32) -> Rectangle {
        Rectangle { width: size, height: size }
    }
}
