// 控制流

pub fn run() {
    // if 表达式
    let number = 7;

    if number < 5 {
        println!("number 小于 5");
    } else if number < 10 {
        println!("number 在 5 到 10 之间");
    } else {
        println!("number 大于等于 10");
    }

    // if let 简化匹配
    let some_value: Option<i32> = Some(42);
    if let Some(val) = some_value {
        println!("值为: {}", val);
    }

    // loop 循环
    let mut counter = 0;
    let result = loop {
        counter += 1;
        if counter == 10 {
            break counter * 2; // 返回值
        }
    };
    println!("loop 结果: {}", result);

    // while 循环
    let mut n = 3;
    while n > 0 {
        println!("倒计时: {}", n);
        n -= 1;
    }

    // for 循环 (遍历区间)
    for i in 1..=5 {
        print!("{} ", i);
    }
    println!();

    // for 循环 (遍历集合)
    let array = [10, 20, 30, 40, 50];
    for (index, value) in array.iter().enumerate() {
        println!("索引 {} 的值: {}", index, value);
    }

    // match 表达式
    let grade = 'B';
    match grade {
        'A' => println!("优秀"),
        'B' => println!("良好"),
        'C' => println!("及格"),
        _ => println!("其他"),
    }

    // match 绑定值
    let msg = match grade {
        'A' => "优秀",
        'B' => "良好",
        'C' => "及格",
        _ => "其他",
    };
    println!("等级: {}", msg);
}
