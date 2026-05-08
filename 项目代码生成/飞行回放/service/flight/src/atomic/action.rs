use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ActionType {
    // ========== 俯仰类（Pitch）1-13 ==========
    PitchRateIncrease,           // 俯仰角稳定增大（2~15°/s）
    PitchRateDecrease,           // 俯仰角稳定减小
    PitchRateRapidIncrease,      // 俯仰角急剧增大（>15°/s）
    PitchRateRapidDecrease,      // 俯仰角急剧减小
    PitchPositiveHold,           // 俯仰角正值保持（5°~30°）
    PitchZeroHold,               // 俯仰角零值保持（水平，±1°）
    PitchNegativeHold,           // 俯仰角负值保持（-30°~-5°）
    PitchLargePositiveHold,      // 大仰角保持（30°~90°）
    PitchLargeNegativeHold,      // 大俯角保持（-90°~-30°）
    PitchCrossingZeroUp,         // 俯仰角穿越零度（俯→仰）
    PitchCrossingZeroDown,       // 俯仰角穿越零度（仰→俯）
    PitchCrossing90,             // 俯仰角穿越+90°（过顶）
    PitchOscillation,            // 俯仰振荡（PIO特征）

    // ========== 滚转类（Roll）14-24 ==========
    RollLeftIncreasing,          // 左滚转增速
    RollRightIncreasing,          // 右滚转增速
    RollLeftSmallHold,           // 左坡度保持（小，5°~30°）
    RollRightSmallHold,          // 右坡度保持（小）
    RollLeftLargeHold,           // 大坡度保持（左，60°~90°）
    RollRightLargeHold,          // 大坡度保持（右）
    RollLevelHold,               // 翼平保持（|φ|≤2°）
    RollCrossing90Left,          // 坡度穿越90°（左）
    RollCrossing90Right,         // 坡度穿越90°（右）
    RollCrossing180,             // 坡度穿越180°（进入倒飞）
    RollHighSpeedContinuous,      // 高速连续滚转（p≥180°/s）

    // ========== 航向/偏航类（Yaw/Heading）25-33 ==========
    HeadingLeftTurn,             // 航向角持续左转（1°~10°/s）
    HeadingRightTurn,            // 航向角持续右转
    HeadingHold,                 // 航向保持
    SideslipLeftIncrease,        // 侧滑角增大（左）
    SideslipRightIncrease,       // 侧滑角增大（右）
    SideslipNeutral,             // 侧滑角归零
    YawRateCoordinated,         // 偏航角速率保持（协调转弯）
    YawOscillation,              // 偏航振荡（荷兰滚）
    HeadingRapidChange,          // 航向快速切换

    // ========== 轨迹角与爬降类（FPA）34-44 ==========
    FlightPathAngleIncrease,     // 轨迹俯仰角稳定增大
    FlightPathAngleDecrease,     // 轨迹俯仰角稳定减小
    PositiveFPAHold,             // 正γ稳定保持（稳定爬升）
    NegativeFPAHold,            // 负γ稳定保持（稳定下降）
    FPACrossingZeroUp,           // γ穿越零度（由降转升）
    FPACrossingZeroDown,         // γ穿越零度（由升转降）
    LargePositiveFPA,           // 大仰角轨迹段（γ≥45°）
    LargeNegativeFPA,           // 大俯角轨迹段（γ≤-45°）
    VerticalClimb,              // 垂直爬升段（γ≥80°）
    VerticalDive,               // 垂直俯冲段（γ≤-80°）
    InvertedLevelFlight,         // 倒飞水平轨迹保持

    // ========== 垂直速度类（Vertical Speed）45-51 ==========
    VzIncreasing,                // 垂直速度持续增大（爬升率增加）
    VzDecreasing,               // 垂直速度持续减小（下降率增加）
    VzPositiveHold,              // Vz正值稳定保持（爬升）
    VzNegativeHold,             // Vz负值稳定保持（下降）
    VzZeroCrossing,             // Vz归零（平飞建立）
    HighSinkRate,               // 大下沉率段
    VzCrossingZero,             // Vz过零穿越

    // ========== 空速类（Airspeed）52-60 ==========
    AirspeedSlowIncrease,        // 空速缓慢增大（0.5~3kn/s）
    AirspeedRapidIncrease,       // 空速快速增大（>3kn/s）
    AirspeedSlowDecrease,       // 空速缓慢减小
    AirspeedRapidDecrease,      // 空速快速减小
    AirspeedHold,               // 空速稳定保持
    NearStallSpeedHold,         // 近失速速度保持
    TransonicAccel,             // 跨音速加速穿越
    TransonicDecel,             // 跨音速减速穿越
    MaxSpeedHold,               // 最大速度区间保持

    // ========== 高度类（Altitude） ==========
    AltitudeConstant,            // 高度稳定（高度保持）
    AltitudeClimb,              // 高度上升
    AltitudeDescent,            // 高度下降
    AltitudeRapidClimb,         // 高度快速上升
    AltitudeRapidDescent,       // 高度快速下降
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AtomicAction {
    pub action_type: ActionType,
    pub start_time: f64,
    pub end_time: f64,
    pub parameters: HashMap<String, f64>,
}

impl AtomicAction {
    pub fn new(action_type: ActionType, start_time: f64, end_time: f64) -> Self {
        Self {
            action_type,
            start_time,
            end_time,
            parameters: HashMap::new(),
        }
    }

    pub fn with_params(mut self, params: HashMap<String, f64>) -> Self {
        self.parameters = params;
        self
    }

    pub fn duration(&self) -> f64 {
        self.end_time - self.start_time
    }
}

impl std::fmt::Display for ActionType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            // 俯仰
            ActionType::PitchRateIncrease => write!(f, "俯仰角稳定增大"),
            ActionType::PitchRateDecrease => write!(f, "俯仰角稳定减小"),
            ActionType::PitchRateRapidIncrease => write!(f, "俯仰角急剧增大"),
            ActionType::PitchRateRapidDecrease => write!(f, "俯仰角急剧减小"),
            ActionType::PitchPositiveHold => write!(f, "俯仰角正值保持"),
            ActionType::PitchZeroHold => write!(f, "俯仰角零值保持"),
            ActionType::PitchNegativeHold => write!(f, "俯仰角负值保持"),
            ActionType::PitchLargePositiveHold => write!(f, "大仰角保持"),
            ActionType::PitchLargeNegativeHold => write!(f, "大俯角保持"),
            ActionType::PitchCrossingZeroUp => write!(f, "俯仰角穿越零度(俯→仰)"),
            ActionType::PitchCrossingZeroDown => write!(f, "俯仰角穿越零度(仰→俯)"),
            ActionType::PitchCrossing90 => write!(f, "俯仰角穿越+90°"),
            ActionType::PitchOscillation => write!(f, "俯仰振荡"),
            // 滚转
            ActionType::RollLeftIncreasing => write!(f, "左滚转增速"),
            ActionType::RollRightIncreasing => write!(f, "右滚转增速"),
            ActionType::RollLeftSmallHold => write!(f, "左坡度保持"),
            ActionType::RollRightSmallHold => write!(f, "右坡度保持"),
            ActionType::RollLeftLargeHold => write!(f, "大左坡度保持"),
            ActionType::RollRightLargeHold => write!(f, "大右坡度保持"),
            ActionType::RollLevelHold => write!(f, "翼平保持"),
            ActionType::RollCrossing90Left => write!(f, "坡度穿越90°(左)"),
            ActionType::RollCrossing90Right => write!(f, "坡度穿越90°(右)"),
            ActionType::RollCrossing180 => write!(f, "坡度穿越180°"),
            ActionType::RollHighSpeedContinuous => write!(f, "高速连续滚转"),
            // 航向/偏航
            ActionType::HeadingLeftTurn => write!(f, "航向角持续左转"),
            ActionType::HeadingRightTurn => write!(f, "航向角持续右转"),
            ActionType::HeadingHold => write!(f, "航向保持"),
            ActionType::SideslipLeftIncrease => write!(f, "左侧滑"),
            ActionType::SideslipRightIncrease => write!(f, "右侧滑"),
            ActionType::SideslipNeutral => write!(f, "侧滑角归零"),
            ActionType::YawRateCoordinated => write!(f, "协调转弯"),
            ActionType::YawOscillation => write!(f, "偏航振荡"),
            ActionType::HeadingRapidChange => write!(f, "航向快速切换"),
            // 轨迹角
            ActionType::FlightPathAngleIncrease => write!(f, "轨迹俯仰角增大"),
            ActionType::FlightPathAngleDecrease => write!(f, "轨迹俯仰角减小"),
            ActionType::PositiveFPAHold => write!(f, "稳定爬升"),
            ActionType::NegativeFPAHold => write!(f, "稳定下降"),
            ActionType::FPACrossingZeroUp => write!(f, "轨迹由降转升"),
            ActionType::FPACrossingZeroDown => write!(f, "轨迹由升转降"),
            ActionType::LargePositiveFPA => write!(f, "大仰角轨迹"),
            ActionType::LargeNegativeFPA => write!(f, "大俯角轨迹"),
            ActionType::VerticalClimb => write!(f, "垂直爬升"),
            ActionType::VerticalDive => write!(f, "垂直俯冲"),
            ActionType::InvertedLevelFlight => write!(f, "倒飞水平"),
            // 垂直速度
            ActionType::VzIncreasing => write!(f, "垂直速度增大"),
            ActionType::VzDecreasing => write!(f, "垂直速度减小"),
            ActionType::VzPositiveHold => write!(f, "垂直速度正保持"),
            ActionType::VzNegativeHold => write!(f, "垂直速度负保持"),
            ActionType::VzZeroCrossing => write!(f, "垂直速度归零"),
            ActionType::HighSinkRate => write!(f, "大下沉率"),
            ActionType::VzCrossingZero => write!(f, "垂直速度过零"),
            // 空速
            ActionType::AirspeedSlowIncrease => write!(f, "空速缓慢增大"),
            ActionType::AirspeedRapidIncrease => write!(f, "空速快速增大"),
            ActionType::AirspeedSlowDecrease => write!(f, "空速缓慢减小"),
            ActionType::AirspeedRapidDecrease => write!(f, "空速快速减小"),
            ActionType::AirspeedHold => write!(f, "空速稳定"),
            ActionType::NearStallSpeedHold => write!(f, "近失速"),
            ActionType::TransonicAccel => write!(f, "跨音速加速"),
            ActionType::TransonicDecel => write!(f, "跨音速减速"),
            ActionType::MaxSpeedHold => write!(f, "最大速度保持"),
            // 高度
            ActionType::AltitudeConstant => write!(f, "高度稳定"),
            ActionType::AltitudeClimb => write!(f, "高度上升"),
            ActionType::AltitudeDescent => write!(f, "高度下降"),
            ActionType::AltitudeRapidClimb => write!(f, "高度快速上升"),
            ActionType::AltitudeRapidDescent => write!(f, "高度快速下降"),
        }
    }
}
