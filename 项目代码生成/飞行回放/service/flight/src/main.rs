use flight::data::{FlightDataGenerator, FlightDataReader};
use flight::atomic::AtomicActionDetector;
use flight::composite::PatternMatcher;
use flight::replay::{ReplayPlayer, Visualizer};

fn main() {
    println!("===========================================");
    println!("       飞行回放与动作识别系统              ");
    println!("===========================================\n");

    let mut generator = FlightDataGenerator::new(39.9042, 116.4074);
    println!("正在生成模拟飞行数据...");

    let flight_data = generator.generate_full_flight();
    println!("生成 {} 个飞行数据点", flight_data.len());

    println!("\n正在检测原子动作...");
    let detector = AtomicActionDetector::new();
    let atomic_actions = detector.detect(&flight_data);
    println!("检测到 {} 个原子动作", atomic_actions.len());

    println!("\n正在识别复合动作...");
    let pattern_matcher = PatternMatcher::new();
    let maneuvers = pattern_matcher.recognize_maneuvers(&flight_data, &atomic_actions);
    println!("识别到 {} 个动作", maneuvers.len());

    let visualizer = Visualizer::new();
    visualizer.print_flight_summary(&flight_data, &maneuvers);
    visualizer.print_atomic_actions_summary(&atomic_actions);

    let mut player = ReplayPlayer::new(
        flight_data.clone(),
        atomic_actions.clone(),
        maneuvers.clone(),
    );

    println!("\n========== 开始回放 ==========\n");
    player.play();
    player.set_speed(10.0);

    let total_steps = 50;
    for i in 0..total_steps {
        player.advance(1.0);
        if i % 5 == 0 {
            visualizer.print_state(&player);
        }
    }

    player.pause();
    println!("回放已暂停，进度: {:.1}%", player.get_progress() * 100.0);

    let csv_path = "flight_data_output.csv";
    if let Err(e) = FlightDataReader::write_csv(csv_path, &flight_data) {
        eprintln!("写入CSV失败: {}", e);
    } else {
        println!("\n飞行数据已导出至: {}", csv_path);
    }

    let json_path = "flight_data_output.json";
    if let Err(e) = FlightDataReader::write_json(json_path, &flight_data) {
        eprintln!("写入JSON失败: {}", e);
    } else {
        println!("飞行数据已导出至: {}", json_path);
    }

    println!("\n===========================================");
    println!("          演示完成!                       ");
    println!("===========================================\n");
}
