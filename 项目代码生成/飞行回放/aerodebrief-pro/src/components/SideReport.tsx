import React from 'react';
import { TelemetryPoint, FlightManeuver, Annotation } from '../types';
import { 
  Trophy, MessageSquare, Camera, Mic, 
  ChevronRight, AlertTriangle, CheckCircle2,
  Share2, Save
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ReportProps {
  maneuvers: FlightManeuver[];
  annotations: Annotation[];
  onAddAnnotation: (type: 'text' | 'voice' | 'screenshot') => void;
  onSeek: (timestamp: number) => void;
  currentManeuverIndex: number;
}

const SideReport: React.FC<ReportProps> = ({ 
  maneuvers, annotations, onAddAnnotation, onSeek, currentManeuverIndex 
}) => {
  const averageScore = Math.floor(maneuvers.reduce((acc, m) => acc + m.score, 0) / maneuvers.length);

  return (
    <div className="w-96 bg-[#0e0f12] border-l border-slate-800 flex flex-col h-full overflow-hidden">
      {/* Header Info */}
      <div className="p-6 border-b border-slate-800 bg-gradient-to-br from-slate-900/50 to-transparent">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">讲评报告</h2>
            <p className="text-xs text-slate-500">模拟训练 #1042 - 2026.04.22</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-3xl font-black text-cyan-400 leading-none">{averageScore}</div>
            <div className="text-[10px] text-cyan-900 font-bold uppercase tracking-widest mt-1">Total Score</div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
           <div className="bg-slate-800/30 rounded p-2 text-center border border-slate-800/50">
             <div className="text-[10px] text-slate-500 uppercase">高度保持</div>
             <div className="text-sm font-bold text-white">95%</div>
           </div>
           <div className="bg-slate-800/30 rounded p-2 text-center border border-slate-800/50">
             <div className="text-[10px] text-slate-500 uppercase">速度控制</div>
             <div className="text-sm font-bold text-amber-500">72%</div>
           </div>
           <div className="bg-slate-800/30 rounded p-2 text-center border border-slate-800/50">
             <div className="text-[10px] text-slate-500 uppercase">载荷控制</div>
             <div className="text-sm font-bold text-white">88%</div>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col gap-8">
        {/* Maneuver List */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={14} className="text-cyan-500" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">关键动作评分</h3>
          </div>
          <div className="flex flex-col gap-3">
            {maneuvers.map((m, i) => (
              <div 
                key={i}
                className={cn(
                  "p-3 rounded-lg border transition-all cursor-pointer",
                  currentManeuverIndex === i 
                    ? "bg-cyan-500/10 border-cyan-500/50 ring-1 ring-cyan-500/20" 
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                )}
                onClick={() => onSeek(m.startTime)}
              >
                <div className="flex justify-between items-center mb-1">
                   <span className="text-xs font-bold text-white">{m.name}</span>
                   <span className={cn(
                     "text-xs font-black",
                     m.score >= 90 ? "text-green-400" : m.score >= 80 ? "text-cyan-400" : "text-amber-500"
                   )}>{m.score}分</span>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{m.feedback}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Key Events / Violations */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={14} className="text-amber-500" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">异常事件分析</h3>
          </div>
          <div className="bg-red-950/20 border border-red-900/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="p-1.5 bg-red-500/10 rounded text-red-500">
                <AlertTriangle size={14} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-[10px] font-bold text-red-400 mb-1">
                  <span>过载警告</span>
                  <span>01:12:05</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  斤斗顶点拉起过大，瞬时过载达到 7.2G（标准 5.5G），触发身体过载告警。
                </p>
                <button 
                  className="mt-2 text-[9px] text-cyan-400 font-bold uppercase hover:underline"
                  onClick={() => onSeek(72)}
                >
                  跳转回放
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Annotations */}
        <section className="mb-4">
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
               <MessageSquare size={14} className="text-slate-400" />
               <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">教员批注</h3>
             </div>
             <span className="text-[10px] text-slate-500">{annotations.length} 条</span>
           </div>
           
           <div className="flex flex-col gap-4">
              {annotations.map(anno => (
                <div key={anno.id} className="relative pl-4 border-l border-slate-800 py-1">
                   <div className="flex justify-between items-center mb-1">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">T+{anno.timestamp.toFixed(0)}S</span>
                     <span className="text-[8px] px-1 bg-slate-800 rounded text-slate-500">{anno.type.toUpperCase()}</span>
                   </div>
                   <p className="text-xs text-white leading-relaxed">{anno.text}</p>
                </div>
              ))}
              
              {annotations.length === 0 && (
                <div className="text-center py-8 opacity-30 italic text-xs">尚无批注</div>
              )}
           </div>
        </section>
      </div>

      {/* Action Toolbar */}
      <div className="p-6 border-t border-slate-800 bg-black/40">
        <div className="flex gap-2 mb-4">
          <button 
            onClick={() => onAddAnnotation('screenshot')}
            className="flex-1 flex flex-col items-center justify-center p-3 h-16 bg-slate-900 border border-slate-800 rounded-lg hover:border-cyan-500 transition-all text-slate-500 hover:text-cyan-400"
          >
            <Camera size={18} />
            <span className="text-[8px] font-bold uppercase mt-1">截图</span>
          </button>
          <button 
            onClick={() => onAddAnnotation('voice')}
            className="flex-1 flex flex-col items-center justify-center p-3 h-16 bg-slate-900 border border-slate-800 rounded-lg hover:border-cyan-500 transition-all text-slate-500 hover:text-cyan-400"
          >
            <Mic size={18} />
            <span className="text-[8px] font-bold uppercase mt-1">语音</span>
          </button>
          <button 
            onClick={() => onAddAnnotation('text')}
            className="flex-1 flex flex-col items-center justify-center p-3 h-16 bg-slate-900 border border-slate-800 rounded-lg hover:border-cyan-500 transition-all text-slate-500 hover:text-cyan-400"
          >
            <MessageSquare size={18} />
            <span className="text-[8px] font-bold uppercase mt-1">文字</span>
          </button>
        </div>
        <button className="w-full h-12 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-black font-black uppercase text-xs rounded-lg transition-all flex items-center justify-center gap-2">
          <Save size={14} />
          生成并发送讲评报告
        </button>
      </div>
    </div>
  );
};

export default SideReport;
