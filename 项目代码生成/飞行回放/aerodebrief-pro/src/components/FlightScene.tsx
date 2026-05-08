import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Stars, Float, Trail, Line, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { TelemetryPoint } from '../types';

interface SceneProps {
  telemetry: TelemetryPoint[];
  currentIndex: number;
  viewMode: 'cockpit' | 'satellite' | 'roaming' | 'external';
}

function Aircraft({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);

  return (
    <group ref={meshRef} position={position} rotation={rotation}>
      {/* Representative high-detail glider/jet body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.2, 0.5, 4, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Wings */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[8, 0.1, 1]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      {/* Tail */}
      <mesh position={[0, 0, 1.8]}>
        <boxGeometry args={[2, 0.1, 0.5]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[0, 0.8, 1.8]} rotation={[Math.PI/2, 0, 0]}>
        <boxGeometry args={[0.1, 1, 0.5]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      {/* Cockpit */}
      <mesh position={[0, 0.4, -0.8]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#cbd5e1" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function Trajectory({ telemetry, currentIndex }: { telemetry: TelemetryPoint[], currentIndex: number }) {
  const visiblePoints = useMemo(() => telemetry.slice(0, currentIndex + 1), [telemetry, currentIndex]);
  
  // Create segments with colors
  return (
    <>
      {visiblePoints.map((p, i) => {
        if (i === 0) return null;
        const prev = visiblePoints[i-1];
        let color = "#10b981"; // Green
        if (p.isViolation) color = "#ef4444"; // Red
        else if (Math.abs(p.roll) > 45) color = "#f59e0b"; // Yellow
        
        return (
          <Line
            key={i}
            points={[prev.position, p.position]}
            color={color}
            lineWidth={3}
          />
        );
      })}
    </>
  );
}

const FlightScene: React.FC<SceneProps> = ({ telemetry, currentIndex, viewMode }) => {
  const currentPoint = telemetry[currentIndex] || telemetry[0];
  
  const aircraftPosition: [number, number, number] = currentPoint.position;
  const aircraftRotation: [number, number, number] = [
    THREE.MathUtils.degToRad(-currentPoint.pitch),
    THREE.MathUtils.degToRad(-currentPoint.heading),
    THREE.MathUtils.degToRad(currentPoint.roll)
  ];

  return (
    <div className="w-full h-full bg-[#0a0a0b] relative overflow-hidden">
      <Canvas shadows>
        <PerspectiveCamera 
          makeDefault 
          position={
            viewMode === 'external' ? [aircraftPosition[0] - 20, aircraftPosition[1] + 10, aircraftPosition[2] + 20] :
            viewMode === 'cockpit' ? [aircraftPosition[0], aircraftPosition[1] + 1, aircraftPosition[2] - 2] :
            [aircraftPosition[0] - 100, 500, aircraftPosition[2]]
          } 
          fov={50} 
        />
        <OrbitControls 
          target={aircraftPosition} 
          enablePan={false}
          maxDistance={500}
          minDistance={2}
        />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[100, 100, 100]} intensity={1.5} castShadow />
        <Environment preset="night" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Ground Grid */}
        <gridHelper args={[10000, 100, "#1e293b", "#0f172a"]} position={[aircraftPosition[0], 0, aircraftPosition[2]]} />
        
        <Trajectory telemetry={telemetry} currentIndex={currentIndex} />
        <Aircraft position={aircraftPosition} rotation={aircraftRotation} />
      </Canvas>

      {/* Camera Toggle */}
      <div className="absolute top-4 left-4 flex gap-2">
        {(['cockpit', 'external', 'satellite', 'roaming'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => {/* handled in parent */}}
            className={`px-3 py-1 text-xs rounded border transition-colors ${
              viewMode === mode ? 'bg-cyan-500 border-cyan-400 text-black' : 'bg-black/50 border-slate-700 text-slate-400'
            }`}
          >
            {mode.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FlightScene;
