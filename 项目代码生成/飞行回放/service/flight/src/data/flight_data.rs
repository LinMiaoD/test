use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlightData {
    pub timestamp: f64,
    pub altitude: f64,
    pub speed: f64,
    pub pitch: f64,
    pub roll: f64,
    pub yaw: f64,
    pub lat: f64,
    pub lon: f64,
    pub vertical_speed: f64,
}

impl FlightData {
    pub fn new(
        timestamp: f64,
        altitude: f64,
        speed: f64,
        pitch: f64,
        roll: f64,
        yaw: f64,
        lat: f64,
        lon: f64,
        vertical_speed: f64,
    ) -> Self {
        Self {
            timestamp,
            altitude,
            speed,
            pitch,
            roll,
            yaw,
            lat,
            lon,
            vertical_speed,
        }
    }

    pub fn zero() -> Self {
        Self {
            timestamp: 0.0,
            altitude: 0.0,
            speed: 0.0,
            pitch: 0.0,
            roll: 0.0,
            yaw: 0.0,
            lat: 0.0,
            lon: 0.0,
            vertical_speed: 0.0,
        }
    }
}

pub struct FlightDataGenerator {
    base_lat: f64,
    base_lon: f64,
    current_time: f64,
}

impl FlightDataGenerator {
    pub fn new(base_lat: f64, base_lon: f64) -> Self {
        Self {
            base_lat,
            base_lon,
            current_time: 0.0,
        }
    }

    pub fn generate_level_flight(&mut self, duration: f64, altitude: f64, speed: f64) -> Vec<FlightData> {
        let mut data = Vec::new();
        let steps = (duration * 10.0) as i32;
        for i in 0..steps {
            let t = i as f64 / 10.0;
            data.push(FlightData::new(
                self.current_time + t,
                altitude,
                speed,
                0.0,
                0.0,
                0.0,
                self.base_lat,
                self.base_lon + t * 0.0001,
                0.0,
            ));
        }
        self.current_time += duration;
        data
    }

    pub fn generate_takeoff(&mut self, duration: f64, start_altitude: f64, start_speed: f64) -> Vec<FlightData> {
        let mut data = Vec::new();
        let steps = (duration * 10.0) as i32;
        for i in 0..steps {
            let t = i as f64 / 10.0;
            let progress = t / duration;
            data.push(FlightData::new(
                self.current_time + t,
                start_altitude + progress * 500.0,
                start_speed + progress * 30.0,
                5.0 * (1.0 - progress),
                0.0,
                0.0,
                self.base_lat,
                self.base_lon + t * 0.0001,
                5.0 + progress * 10.0,
            ));
        }
        self.current_time += duration;
        self.base_lat += 0.001;
        data
    }

    pub fn generate_climb(&mut self, duration: f64, start_altitude: f64, end_altitude: f64, speed: f64) -> Vec<FlightData> {
        let mut data = Vec::new();
        let steps = (duration * 10.0) as i32;
        let altitude_delta = end_altitude - start_altitude;
        for i in 0..steps {
            let t = i as f64 / 10.0;
            let progress = t / duration;
            data.push(FlightData::new(
                self.current_time + t,
                start_altitude + progress * altitude_delta,
                speed - progress * 5.0,
                10.0 * (1.0 - progress * 0.5),
                0.0,
                0.0,
                self.base_lat,
                self.base_lon + t * 0.0001,
                8.0 * (1.0 - progress * 0.3),
            ));
        }
        self.current_time += duration;
        data
    }

    /// 生成斤斗（Loop）
    /// 斤斗特征：俯仰角平滑变化 0° -> 90° -> 0° -> -90° -> 0°
    pub fn generate_loop(&mut self, duration: f64, start_altitude: f64, speed: f64) -> Vec<FlightData> {
        let mut data = Vec::new();
        let steps = (duration * 10.0) as i32;

        for i in 0..steps {
            let t = i as f64 / 10.0;
            let progress = t / duration;

            // 斤斗俯仰角：使用正弦波生成平滑的俯仰角变化
            // 0° -> 90° -> 0° -> -90° -> 0° (一个完整的正弦周期)
            // sin(0) = 0, sin(π/2) = 90, sin(π) = 0, sin(3π/2) = -90, sin(2π) = 0
            let pitch = 90.0 * (std::f64::consts::PI * 2.0 * progress).sin();

            // 斤斗高度变化：使用余弦波，高度变化约500米
            // 当俯仰为90°时（上升阶段），高度增加最大
            // 当俯仰为-90°时（下降阶段），高度恢复
            let altitude_delta = 500.0 * (std::f64::consts::PI * 2.0 * progress).cos();

            // 简化垂直速度：前半圈上升，后半圈下降
            let final_vs = if progress < 0.5 {
                25.0 * (1.0 - progress * 2.0).cos()
            } else {
                -25.0 * ((progress - 0.5) * 2.0).cos()
            };

            // 速度变化：前半减速（爬升），后半加速（俯冲）
            let speed_factor = if progress < 0.5 {
                1.0 - progress * 0.2  // 减速20%
            } else {
                0.8 + (progress - 0.5) * 0.4  // 恢复并加速
            };

            data.push(FlightData::new(
                self.current_time + t,
                start_altitude + altitude_delta,
                speed * speed_factor,
                pitch,
                0.0,
                0.0,
                self.base_lat,
                self.base_lon + t * 0.0001,
                final_vs,
            ));
        }
        self.current_time += duration;
        data
    }

    pub fn generate_roll(&mut self, duration: f64, start_altitude: f64, speed: f64) -> Vec<FlightData> {
        let mut data = Vec::new();
        let steps = (duration * 10.0) as i32;
        for i in 0..steps {
            let t = i as f64 / 10.0;
            let progress = t / duration;
            let roll = 360.0 * progress;
            data.push(FlightData::new(
                self.current_time + t,
                start_altitude,
                speed,
                0.0,
                roll,
                30.0 * progress,
                self.base_lat,
                self.base_lon + t * 0.0001,
                0.0,
            ));
        }
        self.current_time += duration;
        data
    }

    /// 生成倒飞
    pub fn generate_inverted_flight(&mut self, duration: f64, start_altitude: f64, speed: f64) -> Vec<FlightData> {
        let mut data = Vec::new();
        let steps = (duration * 10.0) as i32;
        for i in 0..steps {
            let t = i as f64 / 10.0;
            data.push(FlightData::new(
                self.current_time + t,
                start_altitude,
                speed,
                180.0,
                0.0,
                0.0,
                self.base_lat,
                self.base_lon + t * 0.0001,
                0.0,
            ));
        }
        self.current_time += duration;
        data
    }

    pub fn generate_descend(&mut self, duration: f64, start_altitude: f64, end_altitude: f64, speed: f64) -> Vec<FlightData> {
        let mut data = Vec::new();
        let steps = (duration * 10.0) as i32;
        let altitude_delta = end_altitude - start_altitude;
        for i in 0..steps {
            let t = i as f64 / 10.0;
            let progress = t / duration;
            data.push(FlightData::new(
                self.current_time + t,
                start_altitude + progress * altitude_delta,
                speed + progress * 10.0,
                -10.0 * (1.0 - progress * 0.5),
                0.0,
                0.0,
                self.base_lat,
                self.base_lon + t * 0.0001,
                -8.0 * (1.0 - progress * 0.3),
            ));
        }
        self.current_time += duration;
        data
    }

    pub fn generate_turn(&mut self, duration: f64, start_altitude: f64, speed: f64, turn_rate: f64) -> Vec<FlightData> {
        let mut data = Vec::new();
        let steps = (duration * 10.0) as i32;
        let bank_angle = 30.0;
        for i in 0..steps {
            let t = i as f64 / 10.0;
            let progress = t / duration;
            let yaw_delta = turn_rate * 90.0 * progress;
            let lat_delta = (yaw_delta.to_radians().sin() * 0.001 * progress).abs();
            let lon_delta = (yaw_delta.to_radians().cos() * 0.001 * progress).abs();
            data.push(FlightData::new(
                self.current_time + t,
                start_altitude,
                speed,
                0.0,
                bank_angle * (1.0 - progress * 0.3),
                yaw_delta,
                self.base_lat + lat_delta,
                self.base_lon + lon_delta,
                0.0,
            ));
        }
        self.current_time += duration;
        data
    }

    /// 生成快滚（Barrel Roll）- 滚转360° + 俯仰振荡
    pub fn generate_barrel_roll(&mut self, duration: f64, start_altitude: f64, speed: f64) -> Vec<FlightData> {
        let mut data = Vec::new();
        let steps = (duration * 10.0) as i32;

        for i in 0..steps {
            let t = i as f64 / 10.0;
            let progress = t / duration;

            // 俯仰角：做180°俯仰振荡
            let pitch = 45.0 * (progress * 2.0 * std::f64::consts::PI).sin();

            // 滚转角：360°连续滚转
            let roll = 360.0 * progress;

            // 偏航角：左转30°
            let yaw = 30.0 * progress;

            // 高度：基本保持，轻微起伏
            let altitude = start_altitude + 30.0 * (progress * 2.0 * std::f64::consts::PI).sin();

            // 速度：轻微减速后恢复
            let current_speed = speed * (1.0 - progress * 0.1 + 0.05 * (progress * 2.0 * std::f64::consts::PI).sin());

            // 垂直速度
            let vs = 5.0 * (progress * 2.0 * std::f64::consts::PI).cos();

            data.push(FlightData::new(
                self.current_time + t,
                altitude,
                current_speed,
                pitch,
                roll,
                yaw,
                self.base_lat,
                self.base_lon + t * 0.0001,
                vs,
            ));
        }
        self.current_time += duration;
        data
    }

    /// 生成半滚倒转（Snap Roll）
    pub fn generate_snap_roll(&mut self, duration: f64, start_altitude: f64, speed: f64) -> Vec<FlightData> {
        let mut data = Vec::new();
        let steps = (duration * 10.0) as i32;

        for i in 0..steps {
            let t = i as f64 / 10.0;
            let progress = t / duration;

            // 俯仰角：快速拉起后倒转
            let pitch = if progress < 0.3 {
                progress / 0.3 * 90.0  // 0-30%: 0° -> 90°
            } else if progress < 0.5 {
                90.0 - (progress - 0.3) / 0.2 * 270.0  // 30-50%: 90° -> -180°
            } else {
                -180.0 + (progress - 0.5) / 0.5 * 180.0  // 50-100%: -180° -> 0°
            };

            // 滚转角：快速180°翻转
            let roll = if progress < 0.3 {
                progress / 0.3 * 180.0
            } else {
                180.0
            };

            // 高度变化
            let altitude = if progress < 0.3 {
                start_altitude + progress / 0.3 * 150.0
            } else if progress < 0.6 {
                start_altitude + 150.0 - (progress - 0.3) / 0.3 * 200.0
            } else {
                start_altitude - 50.0 + (progress - 0.6) / 0.4 * 50.0
            };

            // 垂直速度
            let vs = if progress < 0.3 {
                15.0 * (1.0 - progress / 0.3)
            } else if progress < 0.6 {
                -20.0
            } else {
                8.0 * (progress - 0.6) / 0.4
            };

            data.push(FlightData::new(
                self.current_time + t,
                altitude,
                speed,
                pitch,
                roll,
                0.0,
                self.base_lat,
                self.base_lon + t * 0.0001,
                vs,
            ));
        }
        self.current_time += duration;
        data
    }

    /// 生成完整飞行剖面
    pub fn generate_full_flight(&mut self) -> Vec<FlightData> {
        let mut all_data = Vec::new();

        // 1. 平飞准备
        all_data.extend(self.generate_level_flight(5.0, 1000.0, 60.0));

        // 2. 起飞上升
        all_data.extend(self.generate_takeoff(10.0, 1000.0, 50.0));

        // 3. 稳定爬升到3000米
        all_data.extend(self.generate_climb(15.0, 1500.0, 3000.0, 80.0));

        // 4. 斤斗（Loop）- 俯仰角0->90->0->-90->0
        all_data.extend(self.generate_loop(8.0, 3000.0, 80.0));

        // 5. 平飞
        all_data.extend(self.generate_level_flight(5.0, 3000.0, 75.0));

        // 6. 横滚（Roll）- 连续滚转360°
        all_data.extend(self.generate_roll(6.0, 3000.0, 75.0));

        // 7. 平飞
        all_data.extend(self.generate_level_flight(5.0, 3000.0, 75.0));

        // 8. 快滚（Barrel Roll）
        all_data.extend(self.generate_barrel_roll(8.0, 3000.0, 75.0));

        // 9. 平飞
        all_data.extend(self.generate_level_flight(5.0, 3000.0, 70.0));

        // 10. 半滚倒转（Snap Roll）
        all_data.extend(self.generate_snap_roll(4.0, 3000.0, 70.0));

        // 11. 平飞
        all_data.extend(self.generate_level_flight(5.0, 2950.0, 70.0));

        // 12. 下降
        all_data.extend(self.generate_descend(20.0, 2950.0, 1000.0, 65.0));

        // 13. 平飞
        all_data.extend(self.generate_level_flight(10.0, 1000.0, 50.0));

        all_data
    }
}
