import { useState, useMemo } from "react";
import { Zone } from "@/lib/firebase/models";
import { GlassCard } from "../ui/GlassCard";
import { Users, Clock, Activity, X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CrowdFlowMapProps {
  zones: Zone[];
  loading?: boolean;
}

// Generate some fake historical data for the chart based on the current wait time
const generateHistory = (currentWait: number) => {
  const data = [];
  let w = Math.max(0, currentWait - 15);
  for (let i = 6; i >= 1; i--) {
    data.push({ time: `-${i}0m`, wait: Math.max(0, w + Math.floor(Math.random() * 10 - 5)) });
  }
  data.push({ time: "Now", wait: currentWait });
  return data;
};

export function CrowdFlowMap({ zones, loading }: CrowdFlowMapProps) {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const getZone = (id: string) => zones.find((z) => z.id === id);

  const getHeatmapStyle = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio > 0.8) return { bg: "bg-red-500", shadow: "shadow-red-500/50", border: "border-red-200", text: "text-red-600", lightBg: "bg-red-50" };
    if (ratio > 0.5) return { bg: "bg-amber-500", shadow: "shadow-amber-500/50", border: "border-amber-200", text: "text-amber-600", lightBg: "bg-amber-50" };
    return { bg: "bg-emerald-500", shadow: "shadow-emerald-500/50", border: "border-emerald-200", text: "text-emerald-600", lightBg: "bg-emerald-50" };
  };

  const selectedZoneHistory = useMemo(() => {
    if (!selectedZone) return [];
    return generateHistory(selectedZone.waitTime);
  }, [selectedZone, selectedZone?.waitTime]);

  const renderZoneNode = (zone?: Zone, positionClasses?: string) => {
    if (!zone) return null;
    const styles = getHeatmapStyle(zone.currentCapacity, zone.maxCapacity);
    const ratio = Math.round((zone.currentCapacity / zone.maxCapacity) * 100);

    return (
      <div 
        onClick={() => setSelectedZone(zone)}
        className={`absolute ${positionClasses} flex flex-col items-center justify-center transform hover:scale-110 transition-transform cursor-pointer group`}
        style={{ zIndex: 10 }}
      >
        <div className={`absolute w-12 h-12 -z-10 animate-ping rounded-full ${styles.bg} opacity-20`} />
        <div className={`w-4 h-4 rounded-full ${styles.bg} border-2 border-white shadow-lg ${styles.shadow} mb-2`} />
        
        <div className={`bg-white/90 backdrop-blur-sm border ${styles.border} rounded-xl p-2 w-32 flex flex-col items-center gap-1 shadow-lg`}>
          <span className="text-[10px] font-bold text-slate-700 text-center uppercase tracking-wider">{zone.name}</span>
          <div className={`text-sm font-bold ${styles.text}`}>{ratio}% Full</div>
        </div>
      </div>
    );
  };

  return (
    <GlassCard className="col-span-12 lg:col-span-8 flex flex-col h-[600px] overflow-hidden relative p-0 border-0 shadow-2xl">
      <div className="absolute inset-0 bg-slate-50 z-0"></div>
      
      <div className="relative z-10 flex items-center justify-between p-6 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <Activity className="w-5 h-5 text-indigo-600 animate-pulse" />
          Live Interactive Stadium Map
        </h2>
        <div className="flex gap-4 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> Clear</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span> Moderate</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span> Congested</span>
        </div>
      </div>
      
      {loading ? (
        <div className="flex-1 rounded-b-2xl bg-slate-50 flex flex-col items-center justify-center gap-4 relative z-10">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="text-slate-500 font-bold tracking-widest uppercase">Loading Sensor Data...</div>
        </div>
      ) : (
        <div className="flex-1 relative bg-slate-100 overflow-hidden flex items-center justify-center z-10">
          
          {/* Detailed Zone Panel Overlay */}
          {selectedZone && (
            <div className="absolute top-4 left-4 z-50 w-80 bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-2xl p-5 animate-in slide-in-from-left-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{selectedZone.name}</h3>
                  <span className="text-xs font-medium text-indigo-600 uppercase tracking-widest">{selectedZone.type}</span>
                </div>
                <button onClick={() => setSelectedZone(null)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col items-center">
                  <Users className="w-5 h-5 text-indigo-500 mb-1" />
                  <span className="text-xl font-black text-slate-800">{selectedZone.currentCapacity}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">/ {selectedZone.maxCapacity} Cap</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col items-center">
                  <Clock className="w-5 h-5 text-emerald-500 mb-1" />
                  <span className="text-xl font-black text-slate-800">{selectedZone.waitTime}m</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Wait Time</span>
                </div>
              </div>

              <div className="h-40 w-full">
                <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Wait Time Trend</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedZoneHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ color: '#64748b', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="wait" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Stadium Graphic Container */}
          <div className="absolute w-[60%] h-[50%] border-8 border-white bg-emerald-50 shadow-inner rounded-[120px] flex items-center justify-center">
            <div className="absolute w-full h-[2px] bg-white opacity-50"></div>
            <div className="absolute w-[2px] h-full bg-white opacity-50"></div>
            <div className="absolute w-32 h-32 border-4 border-white opacity-50 rounded-full"></div>
            <span className="text-emerald-900/10 font-black text-4xl tracking-widest uppercase absolute select-none">VENUE SYNC</span>
          </div>

          <div className="absolute w-[70%] h-[60%] border-4 border-slate-200/50 rounded-[140px] pointer-events-none border-dashed" />

          {/* Placing Zones Around the Stadium */}
          {renderZoneNode(getZone('z1'), "top-[10%] left-1/2 -translate-x-1/2")} {/* North Gate */}
          {renderZoneNode(getZone('z2'), "bottom-[10%] left-1/2 -translate-x-1/2")} {/* South Gate */}
          
          {renderZoneNode(getZone('z3'), "top-[30%] right-[10%] translate-y-[-50%]")} {/* Food East */}
          {renderZoneNode(getZone('z7'), "bottom-[30%] right-[10%] translate-y-[50%]")} {/* Merch East */}
          
          {renderZoneNode(getZone('z4'), "top-[30%] left-[10%] translate-y-[-50%]")} {/* Beer West */}
          {renderZoneNode(getZone('z5'), "bottom-[30%] left-[10%] translate-y-[50%]")} {/* Washroom 1 */}
          
          {renderZoneNode(getZone('z6'), "top-1/2 left-[5%] -translate-y-1/2")} {/* Washroom 2 */}
          
        </div>
      )}
    </GlassCard>
  );
}
