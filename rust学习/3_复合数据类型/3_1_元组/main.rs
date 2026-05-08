// 3.1 元组（Tuple）

fn main() {
    // ----- 创建元组 -----
    let tup: (i32, f64, u8) = (500, 6.4, 1);
    println!("元组: {:?}", tup);

    // ----- 访问元组元素 -----
    let x = tup.0;
    let y = tup.1;
    let z = tup.2;
    println!("x = {}, y = {}, z = {}", x, y, z);

    // ----- 解构 -----
    let (a, b, c) = tup;
    println!("解构: a = {}, b = {}, c = {}", a, b, c);

    // ----- 函数返回元组 -----
    let result = calculate(10, 3);
    println!("calculate 结果: 商={}, 余={}", result.0, result.1);

    // ----- 单元元组 -----
    let unit: () = ();
    println!("单元元组: {:?}", unit);
}

fn calculate(a: i32, b: i32) -> (i32, i32) {
    (a / b, a % b)
}
