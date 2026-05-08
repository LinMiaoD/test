import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TelemetryPoint, FlightManeuver, Annotation } from './types';
import { generateMockTelemetry, MOCK_MANEUVERS } from './mockData';
import FlightScene from './components/FlightScene';
import HUD from './components/HUD';
import TimelineStrip from './components/Timeline';
import SideReport from './components/SideReport';
import { cn } from './lib/utils';
import { 
  ChevronLeft, ChevronRight, Menu, Settings, 
  Map, Plane, Layout, History, 
  Maximize, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const APP_BG = "#0a0a0b";

export default function App() {
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [viewMode, setViewMode] = useState<'cockpit' | 'external' | 'satellite' | 'roaming'>('external');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  // Initialize data
  useEffect(() => {
    const data = generateMockTelemetry(120);
    setTelemetry(data);
  }, []);

  // Playback Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && telemetry.length > 0) {
      interval = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= telemetry.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 100 / playbackSpeed); // Adjusted for 10Hz data
    }
    return () => clearInterval(interval);
  }, [isPlaying, telemetry.length, playbackSpeed]);

  const currentPoint = telemetry[currentIndex] || telemetry[0];

  const currentManeuverIndex = useMemo(() => {
    if (!currentPoint) return -1;
    return MOCK_MANEUVERS.findIndex(m => 
      currentPoint.timestamp >= m.startTime && currentPoint.timestamp <= m.endTime
    );
  }, [currentPoint]);

  const handleSeek = useCallback((index: number) => {
    setCurrentIndex(Math.min(Math.max(0, index), telemetry.length - 1));
  }, [telemetry.length]);

  const handleTimestampSeek = useCallback((timestamp: number) => {
    const idx = telemetry.findIndex(p => p.timestamp >= timestamp);
    if (idx !== -1) setCurrentIndex(idx);
  }, [telemetry]);

  const addAnnotation = (type: 'text' | 'voice' | 'screenshot') => {
    const text = type === 'screenshot' ? '截图批注' : 
                 type === 'voice' ? '教员语音批注...' : '请输入教员评语...';
    
    setAnnotations(prev => [
      ...prev,
      { id: Date.now().toString(), timestamp: currentPoint.timestamp, text, type }
    ]);
  };

  if (telemetry.length === 0) return (
    <div className="h-screen w-screen bg-black flex items-center justify-center text-cyan-500 font-mono">
      INITIALIZING TELEMETRY ENGINE...
    </div>
  );

  return (
    <div className={cn("h-screen w-screen flex flex-col font-sans text-slate-300", APP_BG)}>
      {/* Top Header */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-cyan-600/20 p-2 rounded-lg">
            <Plane className="text-cyan-500" size={20} />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase">AeroDebrief Pro</h1>
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
               <span className="text-cyan-600">ID: #FLT-1042</span>
               <span className="w-1 h-1 bg-slate-700 rounded-full" />
               <span>PILOT: 张学员 (ZHANG)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <div className="flex bg-black/40 border border-slate-800 rounded-lg p-1">
             {[0.5, 1, 2, 4, 8].map(speed => (
               <button 
                 key={speed}
                 onClick={() => setPlaybackSpeed(speed)}
                 className={cn(
                   "px-2 py-0.5 text-[9px] font-bold rounded transition-colors",
                   playbackSpeed === speed ? "bg-cyan-600 text-black" : "text-slate-500 hover:text-slate-300"
                 )}
               >
                 {speed}x
               </button>
             ))}
           </div>
           <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <Settings size={18} />
           </button>
           <button className="p-2 bg-slate-800 text-white rounded-lg px-4 text-xs font-bold flex items-center gap-2 border border-slate-700">
              <History size={14} />
              全屏回放
           </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Nav (Collapsed/Mini) */}
        <nav className="w-16 border-r border-white/5 flex flex-col items-center py-6 gap-8 text-slate-500">
          <button className="text-cyan-400 p-2 bg-cyan-900/20 rounded-xl"><Layout size={20} /></button>
          <button className="hover:text-white transition-colors"><Map size={20} /></button>
          <button className="hover:text-white transition-colors"><History size={20} /></button>
          <button className="hover:text-white transition-colors"><Settings size={20} /></button>
        </nav>

        {/* Center Canvas */}
        <div className="flex-1 relative flex flex-col">
          <div className="flex-1 relative">
            <FlightScene 
              telemetry={telemetry} 
              currentIndex={currentIndex} 
              viewMode={viewMode}
            />
            {/* View Mode Toggle Overlay (re-implementing properly) */}
            <div className="absolute top-6 left-6 flex gap-1.5 p-1 bg-black/60 backdrop-blur border border-white/10 rounded-xl overflow-hidden">
                {(['cockpit', 'external', 'satellite', 'roaming'] as const).map(mode => (
                  <button 
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      "px-3 py-1.5 text-[10px] font-black tracking-widest uppercase transition-all rounded-lg",
                      viewMode === mode ? "bg-cyan-600 text-black shadow-[0_0_15px_rgba(8,145,178,0.4)]" : "text-slate-500 hover:text-slate-200"
                    )}
                  >
                    {mode}
                  </button>
                ))}
            </div>
            
            <HUD data={currentPoint} />
          </div>

          <TimelineStrip 
            data={telemetry} 
            currentIndex={currentIndex} 
            onSeek={handleSeek}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            maneuvers={MOCK_MANEUVERS}
          />
        </div>

        {/* Right Side Panel */}
        <div className="relative">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-16 bg-[#0e0f12] border border-slate-800 rounded-lg flex items-center justify-center text-slate-500 hover:text-white z-10"
          >
            {isSidebarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 384, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="h-full overflow-hidden"
              >
                <SideReport 
                  maneuvers={MOCK_MANEUVERS}
                  annotations={annotations}
                  onAddAnnotation={addAnnotation}
                  onSeek={handleTimestampSeek}
                  currentManeuverIndex={currentManeuverIndex}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Connection Verification Overlay (Silent) */}
      <div className="fixed bottom-4 left-4 text-[8px] opacity-10">CORE_ENGINE_V1.0_STABLE</div>
    </div>
  );
}
