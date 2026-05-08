// 3.3 枚举（Enum）

fn main() {
    // ----- 枚举定义 -----
    let ip1 = IpAddr::V4(String::from("127.0.0.1"));
    let ip2 = IpAddr::V6(String::from("::1"));

    // ----- Option 枚举 -----
    let some_number = Some(5);
    let some_string = Some("a string");
    let absent_number: Option<i32> = None;

    println!("some_number: {:?}", some_number);
    println!("some_string: {:?}", some_string);
    println!("absent_number: {:?}", absent_number);

    // ----- match 匹配 -----
    print_ip(&ip1);
    print_ip(&ip2);

    // ----- if let 简化 -----
    let some_u8 = Some(3u8);
    if let Some(3) = some_u8 {
        println!("是 3！");
    }

    // ----- 硬币分类 -----
    let coin = Coin::Quarter(UsState::Alaska);
    println!("硬币价值: {} cents", value_in_cents(&coin));

    // ----- 嵌套枚举 -----
    let msg = Message::ChangeColor(0, 160, 255);
    msg.call();
}

#[derive(Debug)]
enum IpAddr {
    V4(String),
    V6(String),
}

fn print_ip(ip: &IpAddr) {
    match ip {
        IpAddr::V4(addr) => println!("IPv4: {}", addr),
        IpAddr::V6(addr) => println!("IPv6: {}", addr),
    }
}

#[derive(Debug)]
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

impl Message {
    fn call(&self) {
        match self {
            Message::Quit => println!("Quit 消息"),
            Message::Move { x, y } => println!("Move 到 ({}, {})", x, y),
            Message::Write(s) => println!("Write: {}", s),
            Message::ChangeColor(r, g, b) => println!("ChangeColor: RGB({}, {}, {})", r, g, b),
        }
    }
}

#[derive(Debug)]
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter(UsState),
}

#[derive(Debug)]
enum UsState {
    Alabama,
    Alaska,
    // ...
}

fn value_in_cents(coin: &Coin) -> u32 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter(state) => {
            println!("来自 {:?} 的 25 美分!", state);
            25
        }
    }
}
