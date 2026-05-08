use crate::data::FlightData;
use crate::atomic::AtomicAction;
use crate::composite::maneuver::Maneuver;

pub struct ReplayPlayer {
    flight_data: Vec<FlightData>,
    atomic_actions: Vec<AtomicAction>,
    maneuvers: Vec<Maneuver>,
    current_index: usize,
    playback_speed: f64,
    is_playing: bool,
}

impl ReplayPlayer {
    pub fn new(flight_data: Vec<FlightData>, atomic_actions: Vec<AtomicAction>, maneuvers: Vec<Maneuver>) -> Self {
        Self {
            flight_data,
            atomic_actions,
            maneuvers,
            current_index: 0,
            playback_speed: 1.0,
            is_playing: false,
        }
    }

    pub fn play(&mut self) {
        self.is_playing = true;
    }

    pub fn pause(&mut self) {
        self.is_playing = false;
    }

    pub fn stop(&mut self) {
        self.is_playing = false;
        self.current_index = 0;
    }

    pub fn seek_to(&mut self, timestamp: f64) {
        self.current_index = self.find_index_by_timestamp(timestamp);
    }

    pub fn set_speed(&mut self, speed: f64) {
        self.playback_speed = speed.max(0.1).min(10.0);
    }

    pub fn get_current_data(&self) -> Option<&FlightData> {
        self.flight_data.get(self.current_index)
    }

    pub fn get_current_atomic_action(&self) -> Option<&AtomicAction> {
        let timestamp = self.get_current_timestamp()?;
        self.atomic_actions.iter().find(|action| {
            timestamp >= action.start_time && timestamp <= action.end_time
        })
    }

    pub fn get_current_maneuver(&self) -> Option<&Maneuver> {
        let timestamp = self.get_current_timestamp()?;
        self.maneuvers.iter().find(|m| {
            timestamp >= m.start_time && timestamp <= m.end_time
        })
    }

    pub fn get_current_timestamp(&self) -> Option<f64> {
        self.flight_data.get(self.current_index).map(|d| d.timestamp)
    }

    pub fn advance(&mut self, delta_time: f64) {
        if !self.is_playing || self.flight_data.is_empty() {
            return;
        }

        let current_time = self.get_current_timestamp().unwrap_or(0.0);
        let target_time = current_time + delta_time * self.playback_speed;

        let new_index = self.find_index_by_timestamp(target_time);
        self.current_index = new_index.min(self.flight_data.len() - 1);

        if self.current_index >= self.flight_data.len() - 1 {
            self.is_playing = false;
        }
    }

    pub fn get_total_duration(&self) -> Option<f64> {
        self.flight_data.last().map(|d| d.timestamp)
    }

    pub fn get_progress(&self) -> f64 {
        let total = self.get_total_duration().unwrap_or(1.0);
        let current = self.get_current_timestamp().unwrap_or(0.0);
        if total == 0.0 {
            return 0.0;
        }
        current / total
    }

    pub fn get_flight_data(&self) -> &[FlightData] {
        &self.flight_data
    }

    pub fn get_atomic_actions(&self) -> &[AtomicAction] {
        &self.atomic_actions
    }

    pub fn get_maneuvers(&self) -> &[Maneuver] {
        &self.maneuvers
    }

    fn find_index_by_timestamp(&self, timestamp: f64) -> usize {
        self.flight_data
            .binary_search_by(|data| {
                data.timestamp.partial_cmp(&timestamp).unwrap()
            })
            .unwrap_or_else(|idx| idx)
    }
}
