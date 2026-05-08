use crate::data::FlightData;
use crate::atomic::AtomicAction;
use crate::composite::maneuver::Maneuver;
use crate::replay::ReplayPlayer;

pub struct Visualizer;

impl Visualizer {
    pub fn new() -> Self {
        Self
    }

    pub fn print_state(&self, player: &ReplayPlayer) {
        if let Some(data) = player.get_current_data() {
            println!("\n========== 飞行回放状态 ==========");
            println!("时间戳: {:.2}秒", data.timestamp);
            println!("进度: {:.1}%", player.get_progress() * 100.0);
            println!("-----------------------------------");
            println!("高度: {:.1} 米", data.altitude);
            println!("空速: {:.1} 米/秒", data.speed);
            println!("垂直速度: {:.1} 米/秒", data.vertical_speed);
            println!("-----------------------------------");
            println!("俯仰角: {:.1}°", data.pitch);
            println!("滚转角: {:.1}°", data.roll);
            println!("航向角: {:.1}°", data.yaw);
            println!("-----------------------------------");
            println!("位置: ({:.6}°, {:.6}°)", data.lat, data.lon);

            if let Some(action) = player.get_current_atomic_action() {
                println!("\n【原子动作】{}", action.action_type);
                println!("  持续时间: {:.2}秒", action.duration());
            }

            if let Some(maneuver) = player.get_current_maneuver() {
                println!("\n【复合动作】{}", maneuver.maneuver_type);
                println!("  置信度: {:.0}%", maneuver.confidence * 100.0);
            }

            println!("==========================================\n");
        }
    }

    pub fn print_flight_summary(&self, flight_data: &[FlightData], maneuvers: &[Maneuver]) {
        println!("\n========== 飞行概要 ==========");

        if let Some(first) = flight_data.first() {
            if let Some(last) = flight_data.last() {
                println!("总时长: {:.2}秒", last.timestamp - first.timestamp);
                println!("起点: ({:.6}°, {:.6}°)", first.lat, first.lon);
                println!("终点: ({:.6}°, {:.6}°)", last.lat, last.lon);
            }
        }

        let max_altitude = flight_data.iter().map(|d| d.altitude).fold(0.0, f64::max);
        let max_speed = flight_data.iter().map(|d| d.speed).fold(0.0, f64::max);
        let max_vspeed = flight_data.iter().map(|d| d.vertical_speed).fold(0.0, f64::max);

        println!("最大高度: {:.1} 米", max_altitude);
        println!("最大空速: {:.1} 米/秒", max_speed);
        println!("最大垂直速度: {:.1} 米/秒", max_vspeed);

        println!("\n---------- 识别到的动作 ----------");
        for (i, maneuver) in maneuvers.iter().enumerate() {
            println!("{}. {} ({:.1}秒 - {:.1}秒) [置信度: {:.0}%]",
                i + 1,
                maneuver.maneuver_type,
                maneuver.start_time,
                maneuver.end_time,
                maneuver.confidence * 100.0
            );
        }

        println!("\n======================================\n");
    }

    pub fn print_atomic_actions_summary(&self, actions: &[AtomicAction]) {
        println!("\n========== 原子动作 ==========");

        let mut current_type: Option<String> = None;
        let mut count = 0;

        for action in actions {
            let type_str = action.action_type.to_string();
            if current_type.as_ref() == Some(&type_str) {
                count += 1;
            } else {
                if count > 0 {
                    println!("  次数: {}", count);
                }
                println!("{}", type_str);
                println!("  开始: {:.2}秒, 结束: {:.2}秒", action.start_time, action.end_time);
                count = 1;
                current_type = Some(type_str);
            }
        }

        if count > 0 {
            println!("  次数: {}", count);
        }

        println!("\n===================================\n");
    }

    pub fn print_csv_format(&self, flight_data: &[FlightData], output_path: &str) {
        println!("正在写入CSV文件: {}", output_path);
        println!("timestamp,altitude,speed,pitch,roll,yaw,lat,lon,vertical_speed");
        for data in flight_data {
            println!("{:.2},{:.1},{:.1},{:.1},{:.1},{:.1},{:.6},{:.6},{:.1}",
                data.timestamp, data.altitude, data.speed, data.pitch, data.roll,
                data.yaw, data.lat, data.lon, data.vertical_speed);
        }
    }
}

impl Default for Visualizer {
    fn default() -> Self {
        Self::new()
    }
}
