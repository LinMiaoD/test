import { TelemetryPoint, FlightManeuver } from './types';

export const generateMockTelemetry = (seconds: number): TelemetryPoint[] => {
  const points: TelemetryPoint[] = [];
  const steps = seconds * 10; // 10Hz data

  for (let i = 0; i < steps; i++) {
    const t = i / 10;
    
    // Simulate a flight path
    // Takeoff (0-20s), Climb (20-60s), Loop (60-80s), Descent (80-120s)
    let alt = 0;
    let speed = 0;
    let pitch = 0;
    let roll = 0;
    let x = 0, y = 0, z = 0;
    let stickX = 0, stickY = 0, throttle = 0;

    if (t < 20) {
      // Ground roll & takeoff
      speed = t * 8;
      throttle = 1.0;
      if (t > 15) {
        alt = (t - 15) * 50;
        pitch = 10;
        stickY = -0.5;
      }
    } else if (t < 60) {
      // Climb
      speed = 160 + Math.sin(t * 0.1) * 10;
      alt = 250 + (t - 20) * 80;
      pitch = 12;
      throttle = 0.9;
    } else if (t < 80) {
      // Loop maneuver
      const phase = (t - 60) / 20; // 0 to 1
      const angle = phase * Math.PI * 2;
      pitch = Math.sin(angle) * 45;
      alt = 3500 + Math.sin(angle) * 1000;
      speed = 250 - Math.sin(angle) * 100;
      stickY = -0.8;
      throttle = 1.0;
    } else {
      // Cruise/Descent
      alt = Math.max(0, 3500 - (t - 80) * 40);
      speed = 180 - (t - 80) * 0.5;
      pitch = -2;
      throttle = 0.4;
    }

    // Rough path calculation
    x = t * 50;
    z = Math.sin(t * 0.02) * 500;
    y = alt / 10; // Scale altitude for visualization

    const isViolation = t > 72 && t < 78; // Simulate a "G-overload" or "Stall warning"

    points.push({
      timestamp: t,
      altitude: alt,
      airspeed: speed,
      verticalSpeed: i > 0 ? (alt - points[i-1].altitude) * 600 : 0,
      heading: (t * 2) % 360,
      pitch,
      roll: Math.sin(t * 0.1) * 15,
      gLoad: 1 + Math.abs(Math.sin(t * 0.2)) * 3 * (t > 60 && t < 80 ? 2 : 1),
      aoa: 4 + Math.abs(pitch) * 0.5,
      latitude: 42.8451 + (t * 0.0001),
      longitude: 93.656 + (t * 0.0001),
      position: [x, y, z],
      inputs: {
        stickX,
        stickY,
        pedals: Math.sin(t * 0.05) * 0.2,
        throttle
      },
      isViolation,
      violationType: isViolation ? 'Excessive G-Load' : undefined
    });
  }
  return points;
};

export const MOCK_MANEUVERS: FlightManeuver[] = [
  { name: '起飞阶段', startTime: 0, endTime: 25, score: 92, feedback: '离陆平稳，保持航向良好。' },
  { name: '连续爬升', startTime: 25, endTime: 60, score: 88, feedback: '空速波动略大，俯仰控制需精细。' },
  { name: '斤斗动作', startTime: 60, endTime: 80, score: 75, feedback: '顶点过载不足，攻角接近极限。' },
  { name: '航线加入', startTime: 80, endTime: 120, score: 90, feedback: '高度高度控制精准。' }
];
