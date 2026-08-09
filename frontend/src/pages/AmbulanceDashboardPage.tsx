import { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { cancelTrip, createTrip, getActiveTrips } from "../api/ambulanceApi";
import { useAuth } from "../hooks/useAuth";
import { useSignalR } from "../hooks/useSignalR";
import type { Trip } from "../types";

export function AmbulanceDashboardPage() {
  const { token } = useAuth();
  const { lastNotification } = useSignalR(token);

  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [startingLocation, setStartingLocation] = useState("Central Hospital, Block A");
  const [destination, setDestination] = useState("General Hospital ER");
  const [patientType, setPatientType] = useState("Cardiac");
  const [priorityLevel, setPriorityLevel] = useState("Critical");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live real-time Date & Clock ticker
  const [now, setNow] = useState(new Date());
  const [elapsedSeconds, setElapsedSeconds] = useState(252); // default 4m 12s

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setNow(new Date());
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    loadTrips();
    const interval = setInterval(() => {
      loadTrips();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic progress animation for live active trip
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTrips((prevTrips) =>
        prevTrips.map((trip, idx) => {
          if (idx === 0 && trip.status === "Active") {
            const currentProgress = trip.progressPercent || 15;
            const newProgress = currentProgress >= 95 ? 15 : currentProgress + 3;
            return { ...trip, progressPercent: newProgress };
          }
          return trip;
        })
      );
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (lastNotification) {
      if (lastNotification.status === "Cleared") {
        setToastMessage(`Route Cleared! ${lastNotification.signalPost} cleared by Officer.`);
      } else if (lastNotification.status === "Passed") {
        setToastMessage(`Ambulance Passed! ${lastNotification.signalPost} route cleared.`);
      } else {
        setToastMessage(`Alert Updated: ${lastNotification.signalPost} - ${lastNotification.status}`);
      }
    }
  }, [lastNotification]);

  async function loadTrips() {
    try {
      const data = await getActiveTrips();
      setActiveTrips(data || []);
    } catch {
      // Handled in API layer
    }
  }

  async function handleStartTrip(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newTrip = await createTrip(startingLocation, destination, patientType, priorityLevel);
      setActiveTrips((prev) => [newTrip, ...prev]);
      setElapsedSeconds(0);
      setToastMessage("Emergency Trip Broadcasted to Signal Junctions!");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancelTrip(tripId: string) {
    try {
      await cancelTrip(tripId);
      setActiveTrips((prev) => prev.filter((t) => t.id !== tripId));
      setToastMessage(`Emergency Trip ${tripId} Cancelled.`);
    } catch (err) {
      console.error(err);
    }
  }

  const currentTrip = activeTrips.length > 0 ? activeTrips[0] : null;

  const formatElapsed = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
  };

  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const formattedTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="bg-[#fff8f7] min-h-screen flex">
      <Sidebar />

      <div className="ml-64 flex-1 flex flex-col min-h-screen overflow-y-auto">
        <Header />

        <main className="relative flex-1 p-6">
          <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
            
            {/* Live Date & Time Bar */}
            <div className="bg-white border border-[#e6bdb8] rounded-lg px-6 py-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#00825a] animate-pulse"></span>
                <p className="text-[15px] font-semibold text-[#281715]">Live Operational Status</p>
              </div>
              <div className="flex items-center gap-6 mono text-[14px]">
                <div className="flex items-center gap-2 text-[#5c403c]">
                  <svg className="w-4 h-4 text-[#b70011]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  <span className="font-semibold">{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2 text-[#b70011] bg-[#ffe2de] px-3 py-1 rounded border border-[#e6bdb8] font-bold">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                  </svg>
                  <span>{formattedTime}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-[#fff8f7] border border-[#e6bdb8] rounded-lg shadow-sm p-[25px] flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-medium tracking-[0.6px] uppercase text-[#5c403c]">Active Trips</p>
                  <p className="text-[36px] leading-[44px] font-bold text-[#281715] tracking-[-0.72px]">
                    {activeTrips.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#dc2626]/10 flex items-center justify-center text-2xl">🚑</div>
              </div>
              <div className="bg-[#fff8f7] border border-[#e6bdb8] rounded-lg shadow-sm p-[25px] flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-medium tracking-[0.6px] uppercase text-[#5c403c]">Total Clearances</p>
                  <p className="text-[36px] leading-[44px] font-bold text-[#281715] tracking-[-0.72px]">142</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#5bb8fe]/10 flex items-center justify-center">
                  <svg className="w-5 h-6 text-[#006398]" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="9" y="2" width="6" height="14" rx="3" /><circle cx="12" cy="6" r="1.4" fill="#eef7ff" /><circle cx="12" cy="9" r="1.4" fill="#eef7ff" /><circle cx="12" cy="12" r="1.4" fill="#eef7ff" /><rect x="10" y="16" width="4" height="6" />
                  </svg>
                </div>
              </div>
              <div className="bg-[#fff8f7] border border-[#e6bdb8] rounded-lg shadow-sm p-[25px] flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-medium tracking-[0.6px] uppercase text-[#5c403c]">Avg Response Time</p>
                  <p className="text-[36px] leading-[44px] font-bold text-[#281715] tracking-[-0.72px]">4.2m</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#00825a]/10 flex items-center justify-center">
                  <svg className="w-[22px] h-[26px] text-[#00825a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="13" r="8" /><path d="M12 9v4l3 2" /><path d="M9 2h6" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Start Trip form + Active trip */}
            <div className="grid grid-cols-12 gap-8">
              
              {/* Start Emergency Trip Form */}
              <div className="col-span-5 bg-[#fff8f7] border border-[#e6bdb8] rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="bg-[#fff0ee] border-b border-[#e6bdb8] px-6 pt-4 pb-[17px] flex items-center gap-3">
                  <svg className="w-[19px] h-[19px] text-[#281715]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18" /><path d="M3 12h12" /><path d="M3 18h6" />
                  </svg>
                  <h3 className="text-[20px] leading-7 font-semibold text-[#281715]">Start Emergency Trip</h3>
                </div>

                <form onSubmit={handleStartTrip} className="p-6 flex flex-col gap-6 flex-1">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[14px] font-semibold text-[#281715] tracking-[0.14px]">Starting Location</label>
                      <select
                        value={startingLocation}
                        onChange={(e) => setStartingLocation(e.target.value)}
                        className="w-full px-4 py-[13px] border border-[#e6bdb8] rounded text-[15px] text-[#281715] bg-[#fff8f7] focus:outline-none focus:ring-1 focus:ring-[#b70011]"
                      >
                        <option>Central Hospital, Block A</option>
                        <option>Northside Medical Clinic</option>
                        <option>City Civil Trauma Center</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[14px] font-semibold text-[#281715] tracking-[0.14px]">Destination</label>
                      <select
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full px-4 py-[13px] border border-[#e6bdb8] rounded text-[15px] text-[#281715] bg-[#fff8f7] focus:outline-none focus:ring-1 focus:ring-[#b70011]"
                      >
                        <option>General Hospital ER</option>
                        <option>City Civil Hospital</option>
                        <option>Apollo Emergency Center</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-semibold text-[#281715] tracking-[0.14px]">Patient Type (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., Cardiac, Trauma"
                      value={patientType}
                      onChange={(e) => setPatientType(e.target.value)}
                      className="w-full px-[17px] py-[13px] border border-[#e6bdb8] rounded bg-[#fff8f7] text-[15px] placeholder-[#5c403c] focus:outline-none focus:ring-1 focus:ring-[#b70011]"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-[14px] font-semibold text-[#281715] tracking-[0.14px]">Priority Level</label>
                    <div className="grid grid-cols-3 gap-3">
                      {["Critical", "High", "Standard"].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setPriorityLevel(level)}
                          className={`py-[9px] rounded border text-[14px] font-semibold tracking-[0.14px] transition-colors ${
                            priorityLevel === level
                              ? "border-[#b70011] bg-[#dc2626]/10 text-[#b70011]"
                              : "border-[#e6bdb8] text-[#5c403c] hover:bg-[#fff0ee]"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 flex items-end pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 bg-[#dc2626] hover:bg-[#c31f1f] text-white text-[18px] font-bold py-4 rounded shadow-sm transition-colors disabled:opacity-50"
                    >
                      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      {isSubmitting ? "Broadcasting..." : "Start Emergency"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Current Active Trip Card - Optimized Case Tracking */}
              <div className="col-span-7 bg-[#fff8f7] border border-[#b70011] rounded-lg p-[5px] shadow-[0px_0px_7.5px_rgba(220,38,38,0.15)]">
                {currentTrip ? (
                  <div className="bg-[#fff8f7] rounded overflow-hidden">
                    <div className="bg-[#fff0ee] border-b border-[#e6bdb8] px-6 pt-4 pb-[17px] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="relative flex w-3.5 h-3.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#dc2626] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#dc2626]"></span>
                        </span>
                        <div>
                          <h3 className="text-[20px] leading-7 font-bold text-[#281715]">
                            Active Case: {currentTrip.id}
                          </h3>
                          <p className="text-[12px] font-medium text-[#5c403c]">
                            Started at {currentTrip.startedAt} • <span className="mono font-semibold text-[#b70011]">Elapsed: {formatElapsed(elapsedSeconds)}</span>
                          </p>
                        </div>
                      </div>
                      <span className="bg-[#ffdad6] text-[#93000a] text-[12px] font-bold tracking-[0.3px] uppercase px-3 py-1.5 rounded-full border border-[#dc2626]/30">
                        {currentTrip.priorityLevel || "Critical Priority"}
                      </span>
                    </div>

                    <div className="p-6 flex flex-col gap-6">
                      
                      {/* Live Progress Bar */}
                      <div>
                        <div className="flex items-end justify-between pb-2">
                          <span className="text-[14px] font-semibold text-[#281715] tracking-[0.14px]">Live Corridor Clearance Progress</span>
                          <span className="mono text-[15px] font-extrabold text-[#b70011]">
                            {currentTrip.progressPercent || 15}%
                          </span>
                        </div>
                        <div className="h-3.5 bg-[#fbdbd7] rounded-full overflow-hidden border border-[#e6bdb8]">
                          <div
                            className="h-full bg-gradient-to-r from-[#dc2626] to-[#b70011] rounded-full transition-all duration-700 shadow-inner"
                            style={{ width: `${currentTrip.progressPercent || 15}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Dynamic Route Nodes */}
                      <div className="border-l-2 border-[#e6bdb8] flex flex-col gap-6 pl-[26px] py-2">
                        {/* Departure Node */}
                        <div className="relative">
                          <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-[#00825a] border-2 border-[#fff8f7] flex items-center justify-center">
                            <svg className="w-2.5 h-2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          </div>
                          <div className="bg-[#fff0ee] border border-[#e6bdb8] rounded p-[15px] flex justify-between items-center">
                            <div>
                              <p className="text-[14px] font-bold text-[#281715]">{currentTrip.from}</p>
                              <p className="text-[12px] font-medium text-[#5c403c]">Departure Origin</p>
                            </div>
                            <span className="mono text-[13px] font-semibold text-[#5c403c]">{currentTrip.startedAt}</span>
                          </div>
                        </div>

                        {/* Active Signal Node */}
                        <div className="relative">
                          <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-[#fff8f7] border-2 border-[#b70011] flex items-center justify-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#b70011] animate-ping"></span>
                          </div>
                          <div className="bg-[#fff8f7] border-2 border-[#b70011]/60 rounded shadow-sm p-[16px] flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-[14px] font-bold text-[#281715]">Signal Junction A (Main St)</p>
                                <p className="text-[12px] font-medium text-[#5c403c]">Approaching Junction • WebSocket Live Broadcast Active</p>
                              </div>
                              <span className="bg-[#dc2626]/10 border border-[#b70011]/30 text-[#b70011] text-[11px] font-extrabold px-3 py-1 rounded uppercase tracking-wider">
                                CLEARING IN PROGRESS
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[13px] text-[#5c403c] pt-1">
                              <span className="w-2 h-2 rounded-full bg-[#00825a]"></span>
                              Inspector Anil assigned on duty.
                            </div>
                          </div>
                        </div>

                        {/* Destination Node */}
                        <div className="relative opacity-90">
                          <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-[#fff8f7] border-2 border-[#006398] flex items-center justify-center">
                            <svg className="w-2.5 h-3 text-[#006398]" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C7 2 4 6 4 10c0 6 8 12 8 12s8-6 8-12c0-4-3-8-8-8Z" />
                            </svg>
                          </div>
                          <div className="bg-[#fff8f7] border border-dashed border-[#e6bdb8] rounded p-[15px]">
                            <p className="text-[14px] font-bold text-[#281715]">{currentTrip.to}</p>
                            <p className="text-[12px] font-medium text-[#5c403c]">Target Emergency ER</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cancellation Action */}
                    <div className="bg-white border-t border-[#e6bdb8] px-6 py-4">
                      <button
                        onClick={() => handleCancelTrip(currentTrip.id)}
                        className="w-full flex items-center justify-center gap-2 border border-[#dc2626] bg-[#ffe2de] text-[#dc2626] hover:bg-[#ffdad6] text-[14px] font-bold py-3 rounded transition-colors shadow-sm"
                      >
                        <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" />
                        </svg>
                        Cancel Active Emergency Trip
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 flex flex-col items-center justify-center text-center gap-4 bg-[#fff8f7] min-h-[400px]">
                    <div className="w-16 h-16 rounded-full bg-[#ffe2de] flex items-center justify-center text-3xl">
                      🚑
                    </div>
                    <div>
                      <h4 className="text-[20px] font-bold text-[#281715]">No Active Case Tracking</h4>
                      <p className="text-[14px] text-[#5c403c] pt-1">
                        Use the form on the left to initiate a live emergency trip broadcast.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed top-4 right-6 bg-[#00825a] text-white rounded shadow-lg flex items-center gap-3 px-6 py-4 z-50 animate-in fade-in slide-in-from-top-4">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
              </svg>
              <div>
                <p className="text-[14px] font-semibold tracking-[0.14px]">Real-Time Operational Alert</p>
                <p className="text-[12px] font-medium opacity-90">{toastMessage}</p>
              </div>
              <button className="pl-4" onClick={() => setToastMessage(null)}>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m18 6-12 12M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
