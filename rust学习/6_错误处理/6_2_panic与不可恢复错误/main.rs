// 6.2 panic! 与不可恢复错误

use std::panic;

fn main() {
    // ----- panic! 宏 -----
    // panic!("这是一个 panic!");

    // ----- 数组越界访问 -----
    let v = vec![1, 2, 3];
    // v[10]; // panic: 下标越界

    // ----- unwrap 和 expect -----
    let x = Some(42);
    let val = x.unwrap(); // 安全，因为有值
    println!("val = {}", val);

    // let x: Option<i32> = None;
    // x.unwrap(); // panic!

    // expect 更好，提供错误信息
    let x: Option<i32> = Some(10);
    let val = x.expect("这里应该有值");
    println!("val = {}", val);

    // ----- 自定义 panic -----
    let result: Result<i32, &str> = Err("错误信息");
    let val = result.unwrap_or(-1); // 用默认值替代
    println!("unwrap_or: {}", val);

    // ----- 捕获 panic -----
    let result = panic::catch_unwind(|| {
        println!("在 catch_unwind 里面");
        // panic!("故意的 panic");
    });

    match result {
        Ok(_) => println!("没有 panic"),
        Err(_) => println!("捕获到了 panic"),
    }

    // ----- 何时使用 panic vs Result -----
    println!("\n何时使用 panic:");
    println!("1. 真正不可恢复的错误");
    println!("2. 在原型代码中快速处理");
    println!("3. 测试中标记应该 panic 的情况");
    println!("\n何时使用 Result:");
    println!("1. 可以预期的错误（文件不存在等）");
    println!("2. 需要调用者处理错误");
    println!("3. 公开 API");
}
