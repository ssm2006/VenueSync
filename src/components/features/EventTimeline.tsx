import { GlassCard } from "../ui/GlassCard";
import { Calendar, Play, CheckCircle2 } from "lucide-react";

export function EventTimeline() {
  const schedule = [
    { time: "5:00 PM", title: "Gates Open", status: "completed" },
    { time: "6:00 PM", title: "Pre-Show Entertainment", status: "completed" },
    { time: "7:30 PM", title: "Main Event Starts", status: "current" },
    { time: "9:00 PM", title: "Halftime / Intermission", status: "upcoming" },
    { time: "10:30 PM", title: "Event Concludes", status: "upcoming" },
  ];

  return (
    <GlassCard className="col-span-12 md:col-span-6 lg:col-span-4 glass-strong p-6 text-white border border-[var(--border2)]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text)]">
          <Calendar className="w-5 h-5 text-indigo-400" /> Event Timeline
        </h2>
        <span className="bg-[rgba(16,185,129,0.15)] text-emerald-400 border border-[rgba(16,185,129,0.3)] px-2 py-1 rounded text-xs font-bold animate-pulse">LIVE</span>
      </div>

      <div className="relative border-l-2 border-[var(--border)] ml-3">
        {schedule.map((item, i) => (
          <div key={i} className="mb-6 ml-6 relative group">
            {item.status === "completed" && (
              <span className="absolute -left-[35px] bg-[rgba(255,255,255,0.05)] text-[var(--accent)] rounded-full border border-[var(--border2)] top-1 p-1">
                <CheckCircle2 className="w-3 h-3" />
              </span>
            )}
            {item.status === "current" && (
              <span className="absolute -left-[35px] bg-[rgba(124,109,235,0.2)] text-[var(--accent)] rounded-full border-2 border-[var(--bg2)] min-w-5 min-h-5 p-1 ring-4 ring-[rgba(124,109,235,0.1)] top-1">
                <Play className="w-3 h-3 fill-current" />
              </span>
            )}
            {item.status === "upcoming" && (
              <span className="absolute -left-[29px] bg-[var(--border2)] rounded-full w-3 h-3 top-2 border-2 border-[var(--bg2)]"></span>
            )}

            <div className={`transition-all ${item.status === 'current' ? 'scale-105 origin-left' : ''}`}>
              <h4 className={`text-sm font-bold ${item.status === 'current' ? 'text-[var(--accent)] border border-[rgba(124,109,235,0.3)] bg-[rgba(124,109,235,0.1)] px-3 py-2 rounded-xl inline-block mt-[-6px]' : 'text-[var(--text)]'}`}>
                {item.title}
              </h4>
              <p className={`text-xs font-semibold ${item.status === 'current' ? 'text-indigo-300 mt-1' : 'text-[var(--text3)]'}`}>{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
