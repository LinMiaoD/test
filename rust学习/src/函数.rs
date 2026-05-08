// 函数

// 基本函数定义
fn say_hello() {
    println!("Hello, Rust!");
}

// 带参数的函数
fn greet(name: &str) {
    println!("Hello, {}!", name);
}

// 带返回值的函数
fn add(a: i32, b: i32) -> i32 {
    a + b // 无分号表示返回值
}

// 早期返回
fn abs(x: i32) -> i32 {
    if x < 0 {
        return -x;
    }
    x
}

// 多返回值 (使用元组)
fn min_max(numbers: &[i32]) -> (i32, i32) {
    let mut min = i32::MAX;
    let mut max = i32::MIN;

    for &num in numbers {
        if num < min {
            min = num;
        }
        if num > max {
            max = num;
        }
    }

    (min, max)
}

// 嵌套函数 (内部函数)
fn outer_function(x: i32) -> i32 {
    fn inner(y: i32) -> i32 {
        y * 2
    }
    inner(x) + 1
}

// 函数作为值 (高阶函数示例)
fn apply<F>(f: F, x: i32) -> i32
where
    F: Fn(i32) -> i32,
{
    f(x)
}

fn square(x: i32) -> i32 {
    x * x
}

// 可变参数函数 (使用切片)
fn sum(numbers: &[i32]) -> i32 {
    let mut total = 0;
    for num in numbers {
        total += num;
    }
    total
}

pub fn run() {
    // 调用基本函数
    say_hello();

    // 调用带参数的函数
    greet("Rust");

    // 调用带返回值的函数
    let result = add(5, 3);
    println!("5 + 3 = {}", result);

    // 调用早期返回函数
    println!("abs(-10) = {}", abs(-10));

    // 调用多返回值函数
    let numbers = [3, 1, 4, 1, 5, 9, 2, 6];
    let (min, max) = min_max(&numbers);
    println!("最小值: {}, 最大值: {}", min, max);

    // 调用嵌套函数
    println!("outer_function(5) = {}", outer_function(5));

    // 调用函数作为值的函数
    let squared = apply(square, 6);
    println!("6 的平方: {}", squared);

    // 调用可变参数函数
    let total = sum(&[1, 2, 3, 4, 5]);
    println!("sum = {}", total);
}
