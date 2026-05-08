use crate::data::FlightData;
use crate::atomic::AtomicAction;
use super::maneuver::{Maneuver, ManeuverType};

pub struct PatternMatcher;

impl PatternMatcher {
    pub fn new() -> Self {
        Self
    }

    pub fn recognize_maneuvers(&self, flight_data: &[FlightData], _atomic_actions: &[AtomicAction]) -> Vec<Maneuver> {
        let mut maneuvers = Vec::new();

        maneuvers.extend(self.detect_takeoff_and_landing(flight_data));
        maneuvers.extend(self.detect_loops(flight_data));
        maneuvers.extend(self.detect_rolls(flight_data));
        maneuvers.extend(self.detect_inverted_flight(flight_data));
        maneuvers.extend(self.detect_cruise(flight_data));
        maneuvers.extend(self.detect_turns(flight_data));
        maneuvers.extend(self.detect_climbs_and_descents(flight_data));

        maneuvers.sort_by(|a, b| a.start_time.partial_cmp(&b.start_time).unwrap());
        self.merge_overlapping_maneuvers(&mut maneuvers);
        maneuvers
    }

    fn detect_takeoff_and_landing(&self, flight_data: &[FlightData]) -> Vec<Maneuver> {
        let mut maneuvers = Vec::new();
        let mut in_takeoff = false;
        let mut takeoff_start = 0.0;
        let mut in_landing = false;
        let mut landing_start = 0.0;

        for i in 0..flight_data.len() {
            let data = &flight_data[i];

            if !in_takeoff && data.vertical_speed > 2.0 && data.altitude < 500.0 {
                in_takeoff = true;
                takeoff_start = data.timestamp;
            } else if in_takeoff && data.vertical_speed < 0.5 && data.altitude > 400.0 {
                in_takeoff = false;
                maneuvers.push(Maneuver::new(
                    ManeuverType::Takeoff,
                    takeoff_start,
                    data.timestamp,
                    0.9,
                ));
            }

            if !in_landing && data.vertical_speed < -2.0 && data.altitude > 100.0 {
                in_landing = true;
                landing_start = data.timestamp;
            } else if in_landing && data.altitude < 50.0 && data.speed < 30.0 {
                in_landing = false;
                maneuvers.push(Maneuver::new(
                    ManeuverType::Landing,
                    landing_start,
                    data.timestamp,
                    0.9,
                ));
            }
        }

        maneuvers
    }

    /// 斤斗检测：基于原始俯仰角数据检测
    /// 斤斗特征：俯仰角从正值变为负值再回到0附近
    fn detect_loops(&self, flight_data: &[FlightData]) -> Vec<Maneuver> {
        let mut maneuvers = Vec::new();
        let n = flight_data.len();
        let mut i = 0;

        while i < n {
            let data = &flight_data[i];

            // 检查是否开始斤斗（俯仰角 > 30°）
            if data.pitch > 30.0 {
                let loop_start_time = data.timestamp;
                let mut max_pitch = data.pitch;
                let mut found_negative = false;
                let mut found_recovery = false;
                let mut recovery_time = 0.0;

                // 向前搜索最多15秒
                let mut j = i + 1;
                while j < n {
                    let curr = &flight_data[j];
                    if curr.timestamp - loop_start_time > 15.0 {
                        break;
                    }

                    // 跟踪最大俯仰角
                    if curr.pitch > max_pitch {
                        max_pitch = curr.pitch;
                    }

                    // 检测是否进入负俯仰（倒飞）
                    if !found_negative && curr.pitch < -30.0 {
                        found_negative = true;
                    }

                    // 检测是否回到0°附近（完成斤斗）
                    if found_negative && !found_recovery && curr.pitch >= -10.0 && curr.pitch <= 10.0 {
                        found_recovery = true;
                        recovery_time = curr.timestamp;
                        break;
                    }
                    j += 1;
                }

                // 如果找到完整的斤斗
                if found_recovery && found_negative {
                    let duration = recovery_time - loop_start_time;

                    // 检查是否符合斤斗条件：
                    // 1. 最大俯仰角 > 60°
                    // 2. 持续时间 4-15秒
                    if max_pitch > 60.0 && duration > 4.0 && duration < 15.0 {
                        maneuvers.push(Maneuver::new(
                            ManeuverType::Loop,
                            loop_start_time,
                            recovery_time,
                            0.85,
                        ));

                        // 跳过已检测的区段 - 直接跳到recovery_time之后
                        while i < n && flight_data[i].timestamp <= recovery_time {
                            i += 1;
                        }
                        continue;
                    }
                }
            }
            i += 1;
        }

        maneuvers
    }

    fn detect_rolls(&self, flight_data: &[FlightData]) -> Vec<Maneuver> {
        let mut maneuvers = Vec::new();
        let mut roll_start: Option<usize> = None;
        let mut total_roll: f64 = 0.0;
        let mut last_roll = 0.0;

        for i in 0..flight_data.len() {
            let data = &flight_data[i];

            if roll_start.is_none() && data.roll.abs() > 10.0 {
                roll_start = Some(i);
                total_roll = 0.0;
                last_roll = data.roll;
            } else if let Some(start) = roll_start {
                let roll_delta = Self::normalize_angle(data.roll - last_roll);
                total_roll += roll_delta;
                last_roll = data.roll;

                if total_roll.abs() >= 360.0 {
                    let duration = data.timestamp - flight_data[start].timestamp;
                    if duration < 12.0 && duration > 1.0 {
                        maneuvers.push(Maneuver::new(
                            ManeuverType::Roll,
                            flight_data[start].timestamp,
                            data.timestamp,
                            0.9,
                        ));
                    }
                    roll_start = None;
                    total_roll = 0.0;
                }

                if roll_start.is_some() {
                    let elapsed = data.timestamp - flight_data[start].timestamp;
                    if elapsed > 12.0 || data.roll.abs() < 5.0 {
                        roll_start = None;
                        total_roll = 0.0;
                    }
                }
            }
        }

        maneuvers
    }

    fn detect_inverted_flight(&self, flight_data: &[FlightData]) -> Vec<Maneuver> {
        let mut maneuvers = Vec::new();
        let mut inverted_start: Option<usize> = None;

        for i in 0..flight_data.len() {
            let data = &flight_data[i];
            // 倒飞：俯仰角绝对值 > 90° 或滚转角在 170°-190°
            let is_inverted = data.pitch.abs() > 90.0 || (data.roll > 170.0 && data.roll < 190.0);

            if !is_inverted && inverted_start.is_some() {
                let start = inverted_start.take().unwrap();
                let duration = data.timestamp - flight_data[start].timestamp;
                if duration > 0.5 {
                    maneuvers.push(Maneuver::new(
                        ManeuverType::InvertedFlight,
                        flight_data[start].timestamp,
                        data.timestamp,
                        0.85,
                    ));
                }
            } else if is_inverted && inverted_start.is_none() {
                inverted_start = Some(i);
            }
        }

        maneuvers
    }

    fn detect_cruise(&self, flight_data: &[FlightData]) -> Vec<Maneuver> {
        let mut maneuvers = Vec::new();
        let mut cruise_start: Option<usize> = None;

        for i in 0..flight_data.len() {
            let data = &flight_data[i];
            let is_stable = data.vertical_speed.abs() < 1.0
                && data.pitch.abs() < 5.0
                && data.roll.abs() < 5.0
                && data.speed > 40.0;

            if is_stable && cruise_start.is_none() {
                cruise_start = Some(i);
            } else if !is_stable && cruise_start.is_some() {
                let start = cruise_start.take().unwrap();
                let duration = data.timestamp - flight_data[start].timestamp;
                if duration > 3.0 {
                    maneuvers.push(Maneuver::new(
                        ManeuverType::Cruise,
                        flight_data[start].timestamp,
                        data.timestamp,
                        0.8,
                    ));
                }
            }
        }

        if let Some(start) = cruise_start {
            let duration = flight_data.last().unwrap().timestamp - flight_data[start].timestamp;
            if duration > 3.0 {
                maneuvers.push(Maneuver::new(
                    ManeuverType::Cruise,
                    flight_data[start].timestamp,
                    flight_data.last().unwrap().timestamp,
                    0.8,
                ));
            }
        }

        maneuvers
    }

    fn detect_turns(&self, flight_data: &[FlightData]) -> Vec<Maneuver> {
        let mut maneuvers = Vec::new();
        let mut turn_start: Option<usize> = None;
        let mut last_yaw = 0.0;

        for i in 0..flight_data.len() {
            let data = &flight_data[i];
            let yaw_change = (data.yaw - last_yaw).abs();

            if yaw_change > 5.0 && data.roll.abs() > 15.0 && turn_start.is_none() {
                turn_start = Some(i);
                last_yaw = data.yaw;
            } else if let Some(start) = turn_start {
                let total_yaw_change = (data.yaw - flight_data[start].yaw).abs();
                if total_yaw_change > 20.0 && yaw_change < 3.0 {
                    let duration = data.timestamp - flight_data[start].timestamp;
                    if duration > 1.0 {
                        let climb_or_descend = if data.vertical_speed > 2.0 {
                            ManeuverType::ClimbingTurn
                        } else if data.vertical_speed < -2.0 {
                            ManeuverType::DescendingTurn
                        } else {
                            ManeuverType::Turn
                        };
                        maneuvers.push(Maneuver::new(
                            climb_or_descend,
                            flight_data[start].timestamp,
                            data.timestamp,
                            0.85,
                        ));
                    }
                    turn_start = None;
                }

                if turn_start.is_some() {
                    let elapsed = data.timestamp - flight_data[start].timestamp;
                    if elapsed > 30.0 {
                        turn_start = None;
                    }
                }

                last_yaw = data.yaw;
            }
        }

        maneuvers
    }

    fn detect_climbs_and_descents(&self, flight_data: &[FlightData]) -> Vec<Maneuver> {
        let mut maneuvers = Vec::new();
        let mut climb_start: Option<usize> = None;
        let mut descend_start: Option<usize> = None;

        for i in 0..flight_data.len() {
            let data = &flight_data[i];

            if data.vertical_speed > 3.0 && climb_start.is_none() {
                climb_start = Some(i);
            } else if let Some(start) = climb_start {
                if data.vertical_speed < 1.0 || i == flight_data.len() - 1 {
                    let duration = data.timestamp - flight_data[start].timestamp;
                    if duration > 2.0 {
                        maneuvers.push(Maneuver::new(
                            ManeuverType::Takeoff,
                            flight_data[start].timestamp,
                            data.timestamp,
                            0.75,
                        ));
                    }
                    climb_start = None;
                }
            }

            if data.vertical_speed < -3.0 && descend_start.is_none() {
                descend_start = Some(i);
            } else if let Some(start) = descend_start {
                if data.vertical_speed > -1.0 || i == flight_data.len() - 1 {
                    let duration = data.timestamp - flight_data[start].timestamp;
                    if duration > 2.0 {
                        maneuvers.push(Maneuver::new(
                            ManeuverType::Landing,
                            flight_data[start].timestamp,
                            data.timestamp,
                            0.75,
                        ));
                    }
                    descend_start = None;
                }
            }
        }

        maneuvers
    }

    fn merge_overlapping_maneuvers(&self, maneuvers: &mut Vec<Maneuver>) {
        if maneuvers.is_empty() {
            return;
        }

        maneuvers.sort_by(|a, b| a.start_time.partial_cmp(&b.start_time).unwrap());

        // Only merge if the maneuver is fully contained within the previous one
        // and they are compatible types (same type or both are stable phases like Cruise)
        let mut merged = vec![maneuvers[0].clone()];
        for maneuver in maneuvers.iter().skip(1) {
            let last = merged.last_mut().unwrap();

            // Only merge if:
            // 1. Current maneuver starts after or at the previous end time (no overlap to begin)
            // 2. OR current maneuver is fully contained within previous (strictly less end time)
            // And they are compatible (same type, or Cruise with other stable phases)
            let is_compatible = Self::are_maneuvers_compatible(last.maneuver_type, maneuver.maneuver_type);

            if maneuver.start_time >= last.end_time {
                // No overlap, add as new
                merged.push(maneuver.clone());
            } else if maneuver.start_time <= last.end_time && maneuver.end_time <= last.end_time && is_compatible {
                // Current is fully contained within previous - keep the one with higher confidence
                if maneuver.confidence > last.confidence {
                    *last = maneuver.clone();
                }
            } else if maneuver.start_time <= last.end_time && maneuver.end_time > last.end_time && is_compatible {
                // Overlapping - extend the previous end time if compatible
                if maneuver.confidence > last.confidence {
                    last.maneuver_type = maneuver.maneuver_type;
                }
                last.end_time = maneuver.end_time;
                last.confidence = (last.confidence + maneuver.confidence) / 2.0;
            } else {
                // Non-compatible overlapping maneuvers - keep both
                merged.push(maneuver.clone());
            }
        }

        *maneuvers = merged;
    }

    fn are_maneuvers_compatible(a: ManeuverType, b: ManeuverType) -> bool {
        // Only allow merging of same types or compatible stable phases
        match (a, b) {
            // Same types are compatible
            (x, y) if x == y => true,
            // Cruise can merge with Cruise (multiple cruise segments)
            (ManeuverType::Cruise, ManeuverType::Cruise) => true,
            // Turn can merge with Turn
            (ManeuverType::Turn, ManeuverType::Turn) => true,
            // But Loop, Roll, Takeoff, Landing, InvertedFlight don't merge with Cruise
            // because they represent distinct maneuver types
            (ManeuverType::Loop, _) | (_, ManeuverType::Loop) => false,
            (ManeuverType::Roll, _) | (_, ManeuverType::Roll) => false,
            (ManeuverType::InvertedFlight, _) | (_, ManeuverType::InvertedFlight) => false,
            (ManeuverType::Takeoff, _) | (_, ManeuverType::Takeoff) => false,
            (ManeuverType::Landing, _) | (_, ManeuverType::Landing) => false,
            (ManeuverType::Immelmann, _) | (_, ManeuverType::Immelmann) => false,
            (ManeuverType::SplitS, _) | (_, ManeuverType::SplitS) => false,
            _ => false,
        }
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
}

impl Default for PatternMatcher {
    fn default() -> Self {
        Self::new()
    }
}
