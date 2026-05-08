import React from 'react';
import { TelemetryPoint } from '../types';
import { cn } from '../lib/utils';

interface HUDProps {
  data: TelemetryPoint;
}

const HUD: React.FC<HUDProps> = ({ data }) => {
  return (
    <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between text-cyan-400 font-mono">
      {/* Top Bar: Basic Info */}
      <div className="flex justify-between items-start">
        <div className="bg-black/40 backdrop-blur-md p-3 border border-cyan-900/50 rounded-lg">
          <div className="text-[10px] opacity-70">G-LOAD</div>
          <div className={cn("text-2xl font-bold", data.gLoad > 6 ? "text-red-500" : "text-cyan-400")}>
            {data.gLoad.toFixed(1)}G
          </div>
        </div>
        
        <div className="text-center bg-black/40 backdrop-blur-md p-3 border border-cyan-900/50 rounded-lg px-8">
          <div className="text-[10px] opacity-70">HEADING</div>
          <div className="text-3xl font-bold tracking-widest">
            {data.heading.toFixed(0).padStart(3, '0')}°
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-md p-3 border border-cyan-900/50 rounded-lg text-right">
          <div className="text-[10px] opacity-70">AoA</div>
          <div className="text-2xl font-bold">{data.aoa.toFixed(1)}°</div>
        </div>
      </div>

      {/* Center: Attitude Indicator (Simplified) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-cyan-500/20 rounded-full flex items-center justify-center">
        {/* Pitch Lines */}
        <div 
          className="relative w-full h-full transition-transform duration-100 ease-linear"
          style={{ transform: `rotate(${-data.roll}deg) translateY(${data.pitch * 2}px)` }}
        >
          {[-20, -10, 0, 10, 20].map(p => (
            <div 
              key={p} 
              className="absolute left-1/2 -translate-x-1/2 w-24 h-px bg-cyan-400/40 flex justify-between items-center px-1"
              style={{ top: `${50 - p}%` }}
            >
              <span className="text-[8px]">{p}</span>
              <span className="text-[8px]">{p}</span>
            </div>
          ))}
        </div>
        
        {/* Fixed Waterline */}
        <div className="absolute w-12 h-0.5 bg-yellow-400 shadow-[0_0_10px_#fbbf24]" />
        <div className="absolute w-2 h-0.5 bg-yellow-400 -translate-x-6" />
        <div className="absolute w-2 h-0.5 bg-yellow-400 translate-x-6" />
      </div>

      {/* Sides: Airspeed and Altitude Tapes */}
      <div className="flex justify-between items-center h-64 px-12">
        {/* Airspeed */}
        <div className="relative h-full w-20 flex flex-col justify-center bg-black/40 border-y border-r border-cyan-900/50">
          <div className="absolute -left-12 text-xs font-bold bg-cyan-500 text-black px-1 py-0.5 rounded">IAS</div>
          <div className="text-lg font-bold text-center border-l-2 border-cyan-400 py-1 bg-cyan-950/20">
            {data.airspeed.toFixed(0)}
          </div>
          <div className="flex flex-col gap-4 opacity-40 text-[10px] mt-2 ml-2">
            <div>200</div>
            <div>180</div>
            <div>160</div>
            <div>140</div>
          </div>
        </div>

        {/* Altitude */}
        <div className="relative h-full w-24 flex flex-col justify-center bg-black/40 border-y border-l border-cyan-900/50">
          <div className="absolute -right-12 text-xs font-bold bg-cyan-500 text-black px-1 py-0.5 rounded">ALT</div>
          <div className="text-lg font-bold text-center border-r-2 border-cyan-400 py-1 bg-cyan-950/20">
            {data.altitude.toFixed(0)}
          </div>
          <div className="flex flex-col gap-4 opacity-40 text-[10px] mt-2 mr-2 text-right">
            <div>4500</div>
            <div>4000</div>
            <div>3500</div>
            <div>3000</div>
          </div>
          <div className="absolute top-2 right-2 text-[8px] text-yellow-500 font-bold">VSI: {(data.verticalSpeed/1000).toFixed(1)}K</div>
        </div>
      </div>

      {/* Bottom: Coordinates */}
      <div className="flex justify-center gap-8 text-[10px] opacity-60">
        <div>LAT: {data.latitude.toFixed(6)}</div>
        <div>LNG: {data.longitude.toFixed(6)}</div>
        <div className="text-cyan-400 font-bold">MODE: FULL-AUTO SYNC</div>
      </div>

      {/* Input Display (Floating overlay bottom right) */}
      <div className="absolute bottom-8 right-8 w-32 h-32 bg-black/60 border border-slate-800 rounded-lg p-2 overflow-hidden flex flex-col items-center">
        <span className="text-[10px] absolute top-1 left-2 opacity-50 uppercase">Inputs</span>
        <div className="relative w-20 h-20 border border-slate-700/50 mt-4 rounded">
           {/* Stick Point */}
           <div 
             className="absolute w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_8px_cyan]"
             style={{ 
               left: `${(data.inputs.stickX + 1) * 50}%`,
               top: `${(data.inputs.stickY + 1) * 50}%`,
               transform: 'translate(-50%, -50%)'
             }}
           />
           {/* Crosshair */}
           <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10" />
           <div className="absolute left-1/2 top-0 w-[1px] h-full bg-white/10" />
        </div>
        <div className="w-full mt-2 flex gap-1 items-center px-2">
          <span className="text-[8px] opacity-50">THR</span>
          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400" style={{ width: `${data.inputs.throttle * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HUD;
