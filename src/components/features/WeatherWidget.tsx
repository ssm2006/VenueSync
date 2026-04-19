import { GlassCard } from "../ui/GlassCard";
import { CloudRain, Wind, Thermometer, Droplets } from "lucide-react";

export function WeatherWidget() {
  return (
    <GlassCard className="col-span-12 md:col-span-6 lg:col-span-4 glass-strong p-6 text-white border border-[var(--border2)]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text)]">
          <CloudRain className="w-5 h-5 text-indigo-400" /> Stadium Climate
        </h2>
        <span className="text-xs font-bold text-slate-400">OPEN ROOF</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Temperature */}
        <div className="col-span-2 bg-[rgba(255,255,255,0.04)] rounded-2xl p-6 border border-[var(--border)] flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-[var(--text2)] uppercase tracking-widest">Temperature</span>
            <div className="text-4xl font-black text-[var(--text)] mt-1">72°F</div>
            <p className="text-xs font-semibold text-emerald-400 mt-1">Perfect conditions</p>
          </div>
          <Thermometer className="w-12 h-12 text-indigo-300 opacity-50" />
        </div>

        {/* Humidity */}
        <div className="bg-[rgba(255,255,255,0.04)] rounded-2xl p-4 border border-[var(--border)] flex flex-col items-center justify-center text-center">
          <Droplets className="w-6 h-6 text-indigo-400 mb-2" />
          <span className="text-xs font-bold text-[var(--text2)] uppercase tracking-widest mb-1">Humidity</span>
          <span className="text-lg font-black text-[var(--text)]">45%</span>
        </div>

        {/* Wind */}
        <div className="bg-[rgba(255,255,255,0.04)] rounded-2xl p-4 border border-[var(--border)] flex flex-col items-center justify-center text-center">
          <Wind className="w-6 h-6 text-emerald-400 mb-2" />
          <span className="text-xs font-bold text-[var(--text2)] uppercase tracking-widest mb-1">Wind</span>
          <span className="text-lg font-black text-[var(--text)]">8 mph</span>
        </div>
      </div>
    </GlassCard>
  );
}
