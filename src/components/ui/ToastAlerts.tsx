import { useEffect, useState } from "react";
import { Bell, X, ArrowRight } from "lucide-react";
import { clsx } from "clsx";

interface Alert {
  id: string;
  title: string;
  message: string;
  actionText?: string;
  type: "info" | "promo";
}

export function ToastAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Simulate incoming real-time alerts
    const timer1 = setTimeout(() => {
      setAlerts((prev) => [
        ...prev,
        {
          id: "1",
          title: "High Traffic Alert",
          message: "Gate A is currently at 90% capacity. Use Gate B for faster entry.",
          type: "info",
        },
      ]);
    }, 5000);

    const timer2 = setTimeout(() => {
      setAlerts((prev) => [
        ...prev,
        {
          id: "2",
          title: "Incentivized Dispersal",
          message: "15% off merchandise if you exit through the East Concourse now to avoid traffic!",
          actionText: "Claim QR Code",
          type: "promo",
        },
      ]);
    }, 15000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 max-w-sm w-full">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={clsx(
            "glass-panel p-4 rounded-xl shadow-2xl transform transition-all duration-500 animate-in slide-in-from-right-8",
            alert.type === "promo" ? "border-violet-500/50" : "border-cyan-500/50"
          )}
        >
          <div className="flex gap-3">
            <div className={clsx(
              "mt-1 rounded-full p-1.5 h-fit",
              alert.type === "promo" ? "bg-violet-500/20 text-violet-400" : "bg-cyan-500/20 text-cyan-400"
            )}>
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-semibold text-white">{alert.title}</h4>
                <button onClick={() => removeAlert(alert.id)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-300 mt-1">{alert.message}</p>
              {alert.actionText && (
                <button className="mt-3 text-xs font-semibold flex items-center gap-1 text-violet-400 hover:text-violet-300 group">
                  {alert.actionText} 
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
