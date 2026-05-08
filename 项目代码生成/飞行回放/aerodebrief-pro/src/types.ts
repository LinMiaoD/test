export interface TelemetryPoint {
  timestamp: number;
  altitude: number;      // ft
  airspeed: number;      // knots
  verticalSpeed: number; // ft/min
  heading: number;       // degrees
  pitch: number;         // degrees
  roll: number;          // degrees
  gLoad: number;         // Gs
  aoa: number;           // angle of attack
  latitude: number;
  longitude: number;
  position: [number, number, number]; // x, y, z for 3D
  inputs: {
    stickX: number; // -1 to 1
    stickY: number; // -1 to 1
    pedals: number; // -1 to 1
    throttle: number; // 0 to 1
  };
  event?: string;
  isViolation?: boolean;
  violationType?: string;
}

export interface FlightManeuver {
  name: string;
  startTime: number;
  endTime: number;
  score: number;
  feedback: string;
}

export interface Annotation {
  id: string;
  timestamp: number;
  text: string;
  type: 'voice' | 'text' | 'screenshot';
}
