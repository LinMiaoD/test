// 2.3 生命周期

pub fn run() {
    println!("=== 生命周期演示 ===");

    // ----- 结构体中的生命周期 -----
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first = novel.split('.').next().unwrap();
    let excerpt = ImportantExcerpt { part: first };
    println!("摘录: {}", excerpt.part);

    // ----- 函数中的生命周期 -----
    let s1 = String::from("long string");
    let s2 = String::from("xyz");
    let result = longest(&s1, &s2);
    println!("最长的: {}", result);

    // ----- 静态生命周期 -----
    let s: &'static str = "静态生命周期，与程序同寿";
    println!("{}", s);
}

struct ImportantExcerpt<'a> {
    part: &'a str,
}

impl<'a> ImportantExcerpt<'a> {
    fn announce_and_return(&self, announcement: &str) -> &str {
        println!("公告: {}", announcement);
        self.part
    }
}

fn longest<'a>(s1: &'a str, s2: &'a str) -> &'a str {
    if s1.len() > s2.len() {
        s1
    } else {
        s2
    }
}
