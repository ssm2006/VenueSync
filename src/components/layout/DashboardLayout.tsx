import { ReactNode } from "react";
import { Activity, Map, Coffee, ShoppingBag } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden relative">
      {/* Decorative background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <header className="fixed top-0 left-0 right-0 h-20 glass-panel border-b border-slate-200 z-50 flex items-center justify-between px-8 bg-white/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <Activity className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">VenueSync</h1>
        </div>
        <nav className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            <Map className="w-4 h-4" /> Live Map
          </button>
          <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
            <Coffee className="w-4 h-4" /> Food & Drink
          </button>
          <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
            <ShoppingBag className="w-4 h-4" /> Express Order
          </button>
        </nav>
      </header>

      <main className="pt-28 pb-12 px-8 max-w-7xl mx-auto z-10 relative">
        {children}
      </main>
    </div>
  );
}
