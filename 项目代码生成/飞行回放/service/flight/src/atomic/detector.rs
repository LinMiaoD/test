use crate::data::FlightData;
use crate::atomic::action::{ActionType, AtomicAction};

const WINDOW_SIZE: usize = 5;

// 俯仰阈值 (度/秒)
const PITCH_RATE_STABLE: f64 = 2.0;
const PITCH_RATE_RAPID: f64 = 15.0;

// 滚转阈值 (度/秒)
const ROLL_RATE_LOW: f64 = 5.0;
const ROLL_RATE_HIGH: f64 = 180.0;

// 航向阈值 (度/秒)
const HEADING_RATE_STABLE: f64 = 1.0;
const HEADING_RATE_RAPID: f64 = 10.0;

// 垂直速度阈值 (米/秒)
const VS_STABLE: f64 = 2.0;
const VS_RAPID: f64 = 10.0;

// 速度变化率阈值 (米/秒²)
const SPEED_RATE_SLOW: f64 = 0.5;
const SPEED_RATE_RAPID: f64 = 3.0;

pub struct AtomicActionDetector;

impl AtomicActionDetector {
    pub fn new() -> Self {
        Self
    }

    pub fn detect(&self, flight_data: &[FlightData]) -> Vec<AtomicAction> {
        if flight_data.len() < WINDOW_SIZE {
            return Vec::new();
        }

        let mut actions = Vec::new();
        let mut i = WINDOW_SIZE;

        while i < flight_data.len() {
            let window = &flight_data[i - WINDOW_SIZE..i];
            let action_type = self.classify_window(window);

            let start_idx = i - WINDOW_SIZE;
            let mut end_idx = i;

            while end_idx < flight_data.len() {
                let next_window = &flight_data[end_idx - WINDOW_SIZE..end_idx];
                if self.classify_window(next_window) != action_type {
                    break;
                }
                end_idx += 1;
            }

            let start_time = flight_data[start_idx].timestamp;
            let end_time = flight_data[end_idx - 1].timestamp;

            let params = self.extract_parameters(window);

            actions.push(AtomicAction::new(action_type, start_time, end_time).with_params(params));

            if end_idx <= i {
                i += 1;
            } else {
                i = end_idx;
            }
        }

        self.merge_consecutive_actions(&mut actions);
        actions
    }

    fn classify_window(&self, window: &[FlightData]) -> ActionType {
        let pitch_rate = self.calculate_pitch_rate(window);
        let roll_rate = self.calculate_roll_rate(window);
        let yaw_rate = self.calculate_yaw_rate(window);
        let vs = self.calculate_mean_vertical_speed(window);
        let speed_rate = self.calculate_speed_rate(window);
        let altitude_change = self.calculate_altitude_change(window);

        // 获取当前窗口的平均角度值（用于角度保持判断）
        let mean_pitch = window.iter().map(|d| d.pitch).sum::<f64>() / window.len() as f64;
        let mean_roll = window.iter().map(|d| d.roll).sum::<f64>() / window.len() as f64;
        let mean_speed = window.iter().map(|d| d.speed).sum::<f64>() / window.len() as f64;

        // 获取窗口末尾的角度值（用于大角度判断）
        let last_pitch = window.last().unwrap().pitch;

        // ========== 俯仰检测（高优先级） ==========
        // 急剧俯仰变化（跨越±180°时除外）
        if pitch_rate > PITCH_RATE_RAPID {
            return ActionType::PitchRateRapidIncrease;
        }
        if pitch_rate < -PITCH_RATE_RAPID {
            return ActionType::PitchRateRapidDecrease;
        }

        // 稳定俯仰变化
        if pitch_rate > PITCH_RATE_STABLE {
            return ActionType::PitchRateIncrease;
        }
        if pitch_rate < -PITCH_RATE_STABLE {
            return ActionType::PitchRateDecrease;
        }

        // 俯仰角值保持（使用平均角度判断）
        if last_pitch > 30.0 && last_pitch <= 90.0 {
            return ActionType::PitchLargePositiveHold;
        }
        if mean_pitch >= 5.0 && mean_pitch <= 30.0 {
            return ActionType::PitchPositiveHold;
        }
        if mean_pitch >= -30.0 && mean_pitch < -5.0 {
            return ActionType::PitchNegativeHold;
        }
        if mean_pitch.abs() <= 1.0 {
            return ActionType::PitchZeroHold;
        }

        // ========== 滚转检测 ==========
        if roll_rate > ROLL_RATE_HIGH {
            return ActionType::RollHighSpeedContinuous;
        }
        if roll_rate > ROLL_RATE_LOW {
            return ActionType::RollRightIncreasing;
        }
        if roll_rate < -ROLL_RATE_LOW {
            return ActionType::RollLeftIncreasing;
        }

        // 滚转角值保持
        if mean_roll >= 60.0 && mean_roll <= 90.0 {
            return ActionType::RollRightLargeHold;
        }
        if mean_roll >= -90.0 && mean_roll <= -60.0 {
            return ActionType::RollLeftLargeHold;
        }
        if mean_roll >= 5.0 && mean_roll < 60.0 {
            return ActionType::RollRightSmallHold;
        }
        if mean_roll > -60.0 && mean_roll <= -5.0 {
            return ActionType::RollLeftSmallHold;
        }
        if mean_roll.abs() <= 2.0 {
            return ActionType::RollLevelHold;
        }

        // 坡度穿越检测
        let first_roll = window.first().unwrap().roll;
        let last_roll = window.last().unwrap().roll;
        if Self::crossed_angle(first_roll, last_roll, 90.0) {
            return if last_roll > 0.0 {
                ActionType::RollCrossing90Right
            } else {
                ActionType::RollCrossing90Left
            };
        }
        if Self::crossed_angle(first_roll, last_roll, 180.0) || Self::crossed_angle(first_roll, last_roll, -180.0) {
            return ActionType::RollCrossing180;
        }

        // ========== 航向检测 ==========
        if yaw_rate > HEADING_RATE_RAPID {
            return ActionType::HeadingRapidChange;
        }
        if yaw_rate > HEADING_RATE_STABLE {
            return ActionType::HeadingRightTurn;
        }
        if yaw_rate < -HEADING_RATE_STABLE {
            return ActionType::HeadingLeftTurn;
        }
        if yaw_rate.abs() < 0.5 {
            return ActionType::HeadingHold;
        }

        // ========== 垂直速度/高度检测 ==========
        if vs > VS_RAPID && altitude_change > 50.0 {
            return ActionType::AltitudeRapidClimb;
        }
        if vs < -VS_RAPID && altitude_change < -50.0 {
            return ActionType::AltitudeRapidDescent;
        }
        if vs > VS_STABLE && altitude_change > 10.0 {
            return ActionType::AltitudeClimb;
        }
        if vs < -VS_STABLE && altitude_change < -10.0 {
            return ActionType::AltitudeDescent;
        }
        if vs.abs() < 1.0 && altitude_change.abs() < 5.0 {
            return ActionType::AltitudeConstant;
        }

        // ========== 速度检测 ==========
        if speed_rate > SPEED_RATE_RAPID {
            return ActionType::AirspeedRapidIncrease;
        }
        if speed_rate > SPEED_RATE_SLOW {
            return ActionType::AirspeedSlowIncrease;
        }
        if speed_rate < -SPEED_RATE_RAPID {
            return ActionType::AirspeedRapidDecrease;
        }
        if speed_rate < -SPEED_RATE_SLOW {
            return ActionType::AirspeedSlowDecrease;
        }
        if mean_speed > 40.0 && speed_rate.abs() < SPEED_RATE_SLOW {
            return ActionType::AirspeedHold;
        }

        // 默认状态
        ActionType::AltitudeConstant
    }

    fn crossed_angle(from: f64, to: f64, _threshold: f64) -> bool {
        // 检测是否跨越了某个角度边界
        // 如果from和to分别在threshold的两侧，则认为跨越了
        // 简化检测：检查角度是否发生了大跳变
        let diff = (to - from).abs();
        diff > 90.0 && diff < 270.0
    }

    fn calculate_pitch_rate(&self, window: &[FlightData]) -> f64 {
        if window.len() < 2 {
            return 0.0;
        }
        let first = &window[0];
        let last = &window[window.len() - 1];
        let dt = last.timestamp - first.timestamp;
        if dt == 0.0 {
            return 0.0;
        }
        // 俯仰角不跨越±180°，直接计算
        (last.pitch - first.pitch) / dt
    }

    fn calculate_roll_rate(&self, window: &[FlightData]) -> f64 {
        if window.len() < 2 {
            return 0.0;
        }
        let first = &window[0];
        let last = &window[window.len() - 1];
        let dt = last.timestamp - first.timestamp;
        if dt == 0.0 {
            return 0.0;
        }
        let roll_diff = Self::normalize_angle(last.roll - first.roll);
        roll_diff / dt
    }

    fn calculate_yaw_rate(&self, window: &[FlightData]) -> f64 {
        if window.len() < 2 {
            return 0.0;
        }
        let first = &window[0];
        let last = &window[window.len() - 1];
        let dt = last.timestamp - first.timestamp;
        if dt == 0.0 {
            return 0.0;
        }
        let yaw_diff = Self::normalize_angle(last.yaw - first.yaw);
        yaw_diff / dt
    }

    fn calculate_mean_vertical_speed(&self, window: &[FlightData]) -> f64 {
        window.iter().map(|d| d.vertical_speed).sum::<f64>() / window.len() as f64
    }

    fn calculate_speed_rate(&self, window: &[FlightData]) -> f64 {
        if window.len() < 2 {
            return 0.0;
        }
        let first = &window[0];
        let last = &window[window.len() - 1];
        let dt = last.timestamp - first.timestamp;
        if dt == 0.0 {
            return 0.0;
        }
        (last.speed - first.speed) / dt
    }

    fn calculate_altitude_change(&self, window: &[FlightData]) -> f64 {
        if window.is_empty() {
            return 0.0;
        }
        let first = window[0].altitude;
        let last = window[window.len() - 1].altitude;
        last - first
    }

    fn normalize_angle(angle: f64) -> f64 {
        let mut normalized = angle % 360.0;
        if normalized > 180.0 {
            normalized -= 360.0;
        } else if normalized < -180.0 {
            normalized += 360.0;
        }
        normalized
    }

    fn extract_parameters(&self, window: &[FlightData]) -> std::collections::HashMap<String, f64> {
        let mut params = std::collections::HashMap::new();

        if let Some(first) = window.first() {
            params.insert("start_altitude".to_string(), first.altitude);
            params.insert("start_speed".to_string(), first.speed);
            params.insert("start_pitch".to_string(), first.pitch);
            params.insert("start_roll".to_string(), first.roll);
            params.insert("start_yaw".to_string(), first.yaw);
            params.insert("start_vs".to_string(), first.vertical_speed);
        }

        if let Some(last) = window.last() {
            params.insert("end_altitude".to_string(), last.altitude);
            params.insert("end_speed".to_string(), last.speed);
            params.insert("end_pitch".to_string(), last.pitch);
            params.insert("end_roll".to_string(), last.roll);
            params.insert("end_yaw".to_string(), last.yaw);
            params.insert("end_vs".to_string(), last.vertical_speed);
        }

        params.insert("mean_vs".to_string(), self.calculate_mean_vertical_speed(window));
        params.insert("pitch_rate".to_string(), self.calculate_pitch_rate(window));
        params.insert("roll_rate".to_string(), self.calculate_roll_rate(window));
        params.insert("yaw_rate".to_string(), self.calculate_yaw_rate(window));
        params.insert("speed_rate".to_string(), self.calculate_speed_rate(window));
        params.insert("altitude_change".to_string(), self.calculate_altitude_change(window));

        params
    }

    fn merge_consecutive_actions(&self, actions: &mut Vec<AtomicAction>) {
        if actions.is_empty() {
            return;
        }
        let mut merged = vec![actions[0].clone()];
        for action in actions.iter().skip(1) {
            let last = merged.last_mut().unwrap();
            if std::mem::discriminant(&last.action_type) == std::mem::discriminant(&action.action_type) {
                last.end_time = action.end_time;
            } else {
                merged.push(action.clone());
            }
        }
        *actions = merged;
    }
}

impl Default for AtomicActionDetector {
    fn default() -> Self {
        Self::new()
    }
}
