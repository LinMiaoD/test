import React from 'react';
import { TelemetryPoint, FlightManeuver } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine
} from 'recharts';
import { AlertCircle, ChevronUp, Play, Pause } from 'lucide-react';

interface TimelineProps {
  data: TelemetryPoint[];
  currentIndex: number;
  onSeek: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  maneuvers: FlightManeuver[];
}

const TimelineStrip: React.FC<TimelineProps> = ({ 
  data, currentIndex, onSeek, isPlaying, onTogglePlay, maneuvers 
}) => {
  // Sample data for the chart to improve performance if there are thousands of points
  const chartData = data.filter((_, i) => i % 5 === 0);

  return (
    <div className="bg-[#111216] border-t border-slate-800 p-4 h-64 flex flex-col gap-2 select-none">
      <div className="flex items-center gap-4">
        <button 
          onClick={onTogglePlay}
          className="p-2 bg-cyan-600 hover:bg-cyan-500 text-black rounded-lg transition-colors"
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
        </button>
        <div className="flex-1 overflow-x-auto no-scrollbar relative">
          <div className="flex gap-2 min-w-max pb-2">
            {maneuvers.map((m, i) => (
              <div 
                key={i}
                className="bg-slate-800/50 border border-slate-700 px-3 py-1 rounded text-[10px] text-slate-300 flex items-center gap-2 cursor-pointer hover:border-cyan-500 transition-all"
                onClick={() => onSeek(Math.floor(m.startTime * 10))}
              >
                <span className="font-bold text-cyan-400">{m.name}</span>
                <span className="opacity-50">{m.score}分</span>
                {m.score < 80 && <AlertCircle size={10} className="text-amber-500" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative group">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData} 
            onMouseMove={(e) => {
              if (e && typeof e.activeTooltipIndex === 'number') {
                // Approximate index since we sampled
                onSeek(e.activeTooltipIndex * 5);
              }
            }}
          >
            <defs>
              <linearGradient id="colorAlt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
            <XAxis dataKey="timestamp" hide />
            <YAxis yAxisId="left" hide orientation="left" />
            <YAxis yAxisId="right" hide orientation="right" />
            
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="altitude" 
              stroke="#8884d8" 
              fillOpacity={1} 
              fill="url(#colorAlt)" 
              dot={false}
              isAnimationActive={false}
            />
            <Area 
              yAxisId="right"
              type="monotone" 
              dataKey="airspeed" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorSpeed)" 
              dot={false}
              isAnimationActive={false}
            />

            {/* Current Position Line */}
            <ReferenceLine 
              x={data[currentIndex]?.timestamp} 
              stroke="#22d3ee" 
              strokeWidth={2}
              label={{ value: 'NOW', fill: '#22d3ee', fontSize: 10, position: 'insideTopLeft' }}
            />

            {/* Violations */}
            {data.filter(p => p.isViolation).map((p, i) => (
               // This is expensive to render many ReferenceLines, let's just mark a few regions
               i % 50 === 0 ? <ReferenceLine key={i} x={p.timestamp} stroke="#ef4444" strokeWidth={1} label="ERR" /> : null
            ))}
          </AreaChart>
        </ResponsiveContainer>

        {/* Hover Labels */}
        <div className="absolute top-0 right-0 p-2 flex gap-4 pointer-events-none">
           <div className="flex flex-col">
             <span className="text-[8px] text-slate-500 uppercase">Altitude</span>
             <span className="text-sm font-bold text-[#8884d8]">{data[currentIndex]?.altitude.toFixed(0)} ft</span>
           </div>
           <div className="flex flex-col">
             <span className="text-[8px] text-slate-500 uppercase">Airspeed</span>
             <span className="text-sm font-bold text-[#10b981]">{data[currentIndex]?.airspeed.toFixed(0)} kn</span>
           </div>
        </div>
      </div>

      <div className="flex justify-between items-center px-1">
        <div className="flex gap-4">
           {['高度', '速度', '过载', '攻角'].map(label => (
             <label key={label} className="flex items-center gap-1.5 cursor-pointer">
               <input type="checkbox" defaultChecked className="w-3 h-3 accent-cyan-500 bg-slate-900 border-slate-700" />
               <span className="text-[10px] text-slate-400">{label}</span>
             </label>
           ))}
        </div>
        <div className="text-[10px] text-slate-500 flex gap-2">
          <span>{data[currentIndex]?.timestamp.toFixed(1)}s</span>
          <span className="opacity-30">/</span>
          <span>{data[data.length-1].timestamp.toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
};

export default TimelineStrip;
