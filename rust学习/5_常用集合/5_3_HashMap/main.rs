// 5.3 HashMap

use std::collections::HashMap;

fn main() {
    // ----- 创建 -----
    let mut scores: HashMap<String, i32> = HashMap::new();
    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Yellow"), 50);
    println!("scores: {:?}", scores);

    // ----- from 迭代器创建 -----
    let teams = vec![String::from("Blue"), String::from("Yellow")];
    let initial_scores = vec![10, 50];
    let scores2: HashMap<_, _> = teams.into_iter().zip(initial_scores.into_iter()).collect();
    println!("scores2: {:?}", scores2);

    // ----- 访问 -----
    let team_name = String::from("Blue");
    let score = scores.get(&team_name);
    match score {
        Some(s) => println!("{} 队的分数: {}", team_name, s),
        None => println!("队不存在"),
    }

    // ----- 遍历 -----
    for (key, value) in &scores {
        println!("{}: {}", key, value);
    }

    // ----- 更新 -----
    // 覆盖
    scores.insert(String::from("Blue"), 25);
    println!("覆盖后 Blue: {:?}", scores.get("Blue"));

    // 只在键不存在时插入
    scores.entry(String::from("Green")).or_insert(30);
    scores.entry(String::from("Blue")).or_insert(100);
    println!("entry后: {:?}", scores);

    // 基于旧值更新
    let text = "hello world wonderful world";
    let mut word_count = HashMap::new();
    for word in text.split_whitespace() {
        let count = word_count.entry(word).or_insert(0);
        *count += 1;
    }
    println!("词频: {:?}", word_count);
}
