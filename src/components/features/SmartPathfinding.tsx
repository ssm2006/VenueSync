import { useState, useMemo } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Navigation, MapPin, Footprints, Clock, ArrowRight } from "lucide-react";
import { Zone } from "@/lib/firebase/models";

interface SmartPathfindingProps {
  zones: Zone[];
  loading?: boolean;
}

export function SmartPathfinding({ zones, loading }: SmartPathfindingProps) {
  const [selectedAmenity, setSelectedAmenity] = useState<string>("");
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [route, setRoute] = useState<Zone | null>(null);

  const amenities = ["food", "washroom", "merch"];
  // Use gate zones as possible starting locations
  const origins = zones.filter(z => z.type === 'gate');

  const handleCalculate = () => {
    if (!selectedAmenity || !currentLocation) {
      setRoute(null);
      return;
    }

    setIsCalculating(true);
    setRoute(null);

    // Simulate calculation time
    setTimeout(() => {
      const candidates = zones.filter((z) => z.type === selectedAmenity);
      if (candidates.length > 0) {
        // Find candidate with lowest wait time
        const bestCandidate = candidates.reduce((prev, curr) => 
          curr.waitTime < prev.waitTime ? curr : prev
        );
        setRoute(bestCandidate);
      }
      setIsCalculating(false);
    }, 1200);
  };

  useMemo(() => {
    if (selectedAmenity && currentLocation) {
      handleCalculate();
    }
  }, [selectedAmenity, currentLocation]);

  const originZone = zones.find(z => z.id === currentLocation);

  return (
    <GlassCard className="col-span-12 lg:col-span-4 flex flex-col h-[600px] bg-white border border-slate-200">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-800">
        <Navigation className="text-indigo-600 w-5 h-5 animate-bounce" />
        Smart Pathfinding
      </h2>

      <div className="mb-6 flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Start Location</label>
          {loading ? (
            <div className="w-full h-12 bg-slate-100 animate-pulse rounded-xl"></div>
          ) : (
            <select 
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none transition-colors"
            >
              <option value="">Select your location...</option>
              {origins.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          )}
        </div>
        
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Find nearest</label>
          {loading ? (
            <div className="w-full h-12 bg-slate-100 animate-pulse rounded-xl"></div>
          ) : (
            <select 
              value={selectedAmenity}
              onChange={(e) => setSelectedAmenity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none transition-colors"
            >
              <option value="">Select an amenity...</option>
              {amenities.map(a => (
                <option key={a} value={a} className="capitalize">{a}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="flex-1 border-t border-slate-100 pt-6 overflow-y-auto pr-2">
        {loading || isCalculating ? (
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-4 bg-slate-100 rounded w-1/2"></div>
            <div className="h-20 bg-slate-50 rounded-xl"></div>
            <div className="h-20 bg-slate-50 rounded-xl"></div>
          </div>
        ) : route && originZone ? (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4">
            <div className="bg-gradient-to-r from-indigo-50 to-emerald-50 border border-indigo-100 rounded-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Navigation className="w-16 h-16 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Optimal Route Found</h3>
              <p className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                Avoiding congestion <ArrowRight className="w-4 h-4"/> Heading to {route.name}
              </p>
            </div>

            <div className="relative pl-6 border-l-2 border-indigo-200 ml-3 mt-4 flex flex-col gap-8">
              
              {/* Step 1: Origin */}
              <div className="relative">
                <div className="absolute -left-[31px] bg-white p-1 rounded-full border border-slate-200 shadow-sm top-[-4px]">
                  <MapPin className="w-4 h-4 text-slate-500" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Depart</h4>
                <p className="text-xs text-slate-500 font-medium">{originZone.name}</p>
              </div>

              {/* Step 2: Transit */}
              <div className="relative">
                <div className="absolute -left-[31px] bg-white p-1 rounded-full border border-indigo-200 shadow-sm top-[-4px]">
                  <Footprints className="w-4 h-4 text-indigo-500" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Walk 4 mins</h4>
                <p className="text-xs text-slate-500 font-medium text-wrap">Follow Main Concourse towards Sector {route.type.toUpperCase()}</p>
              </div>

              {/* Step 3: Destination */}
              <div className="relative">
                <div className="absolute -left-[31px] bg-white p-1 rounded-full border border-emerald-200 shadow-sm top-[-4px]">
                  <Clock className="w-4 h-4 text-emerald-500" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Arrive at {route.name}</h4>
                <div className="flex flex-col items-start gap-1 mt-2">
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">
                    {route.waitTime} min current line
                  </span>
                  <span className="text-xs font-bold text-slate-500">Total Est. Time: {route.waitTime + 4} mins</span>
                </div>
              </div>

            </div>

            <button className="mt-4 w-full py-4 bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 active:scale-95 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 transition-all">
              <Footprints className="w-5 h-5" /> Start Navigation
            </button>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
            <MapPin className="w-12 h-12 opacity-20" />
            <p className="text-sm text-center font-medium">Select a start location and amenity<br/>to calculate the fastest route.</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
