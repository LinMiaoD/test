use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Maneuver {
    pub maneuver_type: ManeuverType,
    pub start_time: f64,
    pub end_time: f64,
    pub confidence: f64,
}

impl Maneuver {
    pub fn new(maneuver_type: ManeuverType, start_time: f64, end_time: f64, confidence: f64) -> Self {
        Self {
            maneuver_type,
            start_time,
            end_time,
            confidence,
        }
    }

    pub fn duration(&self) -> f64 {
        self.end_time - self.start_time
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ManeuverType {
    Takeoff,
    Cruise,
    Landing,
    Loop,
    Roll,
    InvertedFlight,
    Immelmann,
    SplitS,
    Turn,
    ClimbingTurn,
    DescendingTurn,
}

impl std::fmt::Display for ManeuverType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ManeuverType::Takeoff => write!(f, "起飞"),
            ManeuverType::Cruise => write!(f, "巡航"),
            ManeuverType::Landing => write!(f, "着陆"),
            ManeuverType::Loop => write!(f, "斤斗"),
            ManeuverType::Roll => write!(f, "横滚"),
            ManeuverType::InvertedFlight => write!(f, "倒飞"),
            ManeuverType::Immelmann => write!(f, "伊梅尔曼"),
            ManeuverType::SplitS => write!(f, "分离S"),
            ManeuverType::Turn => write!(f, "转弯"),
            ManeuverType::ClimbingTurn => write!(f, "上升转弯"),
            ManeuverType::DescendingTurn => write!(f, "下降转弯"),
        }
    }
}
