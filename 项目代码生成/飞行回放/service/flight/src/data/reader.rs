use std::fs::File;
use std::io::{BufReader, Write};
use std::path::Path;

use csv::{ReaderBuilder, WriterBuilder};

use super::FlightData;

pub struct FlightDataReader;

impl FlightDataReader {
    pub fn read_csv<P: AsRef<Path>>(path: P) -> Result<Vec<FlightData>, Box<dyn std::error::Error>> {
        let file = File::open(path)?;
        let reader = BufReader::new(file);
        let mut csv_reader = ReaderBuilder::new().has_headers(true).from_reader(reader);

        let mut data = Vec::new();
        for result in csv_reader.deserialize() {
            let record: Vec<String> = result?;
            if record.len() >= 9 {
                data.push(FlightData::new(
                    record[0].parse().unwrap_or(0.0),
                    record[1].parse().unwrap_or(0.0),
                    record[2].parse().unwrap_or(0.0),
                    record[3].parse().unwrap_or(0.0),
                    record[4].parse().unwrap_or(0.0),
                    record[5].parse().unwrap_or(0.0),
                    record[6].parse().unwrap_or(0.0),
                    record[7].parse().unwrap_or(0.0),
                    record[8].parse().unwrap_or(0.0),
                ));
            }
        }
        Ok(data)
    }

    pub fn write_csv<P: AsRef<Path>>(path: P, data: &[FlightData]) -> Result<(), Box<dyn std::error::Error>> {
        let file = File::create(path)?;
        let mut writer = WriterBuilder::new().from_writer(file);

        writer.write_record(&[
            "timestamp", "altitude", "speed", "pitch", "roll", "yaw", "lat", "lon", "vertical_speed"
        ])?;

        for fd in data {
            writer.write_record(&[
                fd.timestamp.to_string(),
                fd.altitude.to_string(),
                fd.speed.to_string(),
                fd.pitch.to_string(),
                fd.roll.to_string(),
                fd.yaw.to_string(),
                fd.lat.to_string(),
                fd.lon.to_string(),
                fd.vertical_speed.to_string(),
            ])?;
        }
        writer.flush()?;
        Ok(())
    }

    pub fn read_json<P: AsRef<Path>>(path: P) -> Result<Vec<FlightData>, Box<dyn std::error::Error>> {
        let content = std::fs::read_to_string(path)?;
        let data: Vec<FlightData> = serde_json::from_str(&content)?;
        Ok(data)
    }

    pub fn write_json<P: AsRef<Path>>(path: P, data: &[FlightData]) -> Result<(), Box<dyn std::error::Error>> {
        let json = serde_json::to_string_pretty(data)?;
        let mut file = File::create(path)?;
        file.write_all(json.as_bytes())?;
        Ok(())
    }
}
