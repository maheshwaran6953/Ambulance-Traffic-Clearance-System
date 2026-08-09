import { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { getNotifications, updateNotificationStatus } from "../api/policeApi";
import { useAuth } from "../hooks/useAuth";
import { useSignalR } from "../hooks/useSignalR";
import type { EmergencyNotification } from "../types";

export function PoliceDashboardPage() {
  const { token } = useAuth();
  const { lastNotification } = useSignalR(token);

  const [notifications, setNotifications] = useState<EmergencyNotification[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalNotif, setModalNotif] = useState<EmergencyNotification | null>(null);

  // Live real-time Date & Clock ticker
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const clockTimer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(() => {
      loadNotifications();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (lastNotification) {
      setNotifications((prev) => [lastNotification, ...prev]);
      setModalNotif(lastNotification);
      setShowModal(true);
    }
  }, [lastNotification]);

  async function loadNotifications() {
    try {
      const data = await getNotifications();
      setNotifications(data || []);
    } catch {
      // Handled in API layer
    }
  }

  async function handleStatusUpdate(id: string, status: "Cleared" | "Passed") {
    try {
      await updateNotificationStatus(id, status);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status } : n))
      );
      if (showModal) setShowModal(false);
      await loadNotifications();
    } catch (err) {
      console.error(err);
    }
  }

  const activeAlert = notifications.find((n) => n.status === "Active" || n.status === "Pending") || null;
  const clearedRoutes = notifications.filter((n) => n.status === "Cleared" || n.status === "Passed");

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

        <main className="flex-1 p-6">
          <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
            
            {/* Live Date & Time Bar */}
            <div className="bg-white border border-[#e6bdb8] rounded-lg px-6 py-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#006398] animate-pulse"></span>
                <p className="text-[15px] font-semibold text-[#281715]">Police Junction Dispatch Console</p>
              </div>
              <div className="flex items-center gap-6 mono text-[14px]">
                <div className="flex items-center gap-2 text-[#5c403c]">
                  <svg className="w-4 h-4 text-[#006398]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  <span className="font-semibold">{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2 text-[#006398] bg-[#eef7ff] px-3 py-1 rounded border border-[#5bb8fe]/40 font-bold">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                  </svg>
                  <span>{formattedTime}</span>
                </div>
              </div>
            </div>

            {/* Grid layout for Junction Details & Ambulance Approaching */}
            <div className="grid grid-cols-12 gap-8 items-stretch">
              
              {/* Signal Junction Details Card */}
              <div className="col-span-4 bg-[#006398] text-white rounded-lg p-6 shadow-sm relative overflow-hidden flex flex-col justify-between h-full min-h-[300px]">
                <div>
                  <div className="flex items-center justify-between">
                    <svg className="w-6 h-[27px]" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="9" y="2" width="6" height="14" rx="3" />
                      <circle cx="12" cy="6" r="1.4" fill="#006398" />
                      <circle cx="12" cy="9" r="1.4" fill="#006398" />
                      <circle cx="12" cy="12" r="1.4" fill="#006398" />
                      <rect x="10" y="16" width="4" height="6" />
                    </svg>
                    <span className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-[13px] font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00825a] animate-ping"></span> On Duty
                    </span>
                  </div>
                  <h3 className="text-[26px] leading-[32px] font-bold pt-4">Signal Junction A</h3>
                  <p className="text-[15px] leading-6 opacity-90 pb-4">Main St. &amp; 4th Ave Intersection</p>
                </div>

                <div className="border-t border-white/20 pt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5bb8fe] flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] tracking-[0.6px] uppercase opacity-80 font-medium">Assigned Officer</p>
                    <p className="text-[18px] leading-6 font-semibold">Inspector Anil</p>
                  </div>
                </div>
              </div>

              {/* Perfectly Aligned Active Emergency Alert Card */}
              <div className="col-span-8 relative bg-[#fff8f7] border-2 border-[#dc2626] rounded-lg shadow-sm p-6 flex flex-col justify-between h-full min-h-[300px]">
                {activeAlert ? (
                  <>
                    <div className="flex items-start justify-between gap-4 border-b border-[#e6bdb8] pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#dc2626]/10 flex items-center justify-center text-2xl shrink-0">
                          🚑
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h3 className="text-[24px] leading-7 font-extrabold text-[#281715]">Ambulance Approaching</h3>
                            <span className="mono text-[12px] bg-[#ffe2de] text-[#b70011] px-2.5 py-0.5 rounded font-extrabold border border-[#e6bdb8]">
                              {activeAlert.tripId}
                            </span>
                          </div>
                          <p className="mono text-[14px] text-[#5c403c] pt-0.5 font-bold">
                            Vehicle Reg: <span className="text-[#b70011]">{activeAlert.ambulanceReg}</span>
                          </p>
                        </div>
                      </div>

                      <span className="bg-[#dc2626] text-white text-[12px] font-bold tracking-[0.3px] uppercase px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm shrink-0">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                        ACTIVE ALERT
                      </span>
                    </div>

                    <div className="grid grid-cols-12 gap-4 py-4">
                      <div className="col-span-6 bg-white border border-[#e6bdb8] p-3.5 rounded flex flex-col justify-between">
                        <p className="text-[11px] font-semibold tracking-[0.6px] uppercase text-[#5c403c]">Route Origin → Target ER</p>
                        <p className="text-[15px] font-bold text-[#281715] truncate pt-1">
                          {activeAlert.from} → <span className="text-[#006398]">{activeAlert.to}</span>
                        </p>
                      </div>

                      <div className="col-span-3 bg-white border border-[#e6bdb8] p-3.5 rounded flex flex-col justify-between">
                        <p className="text-[11px] font-semibold tracking-[0.6px] uppercase text-[#5c403c]">Distance</p>
                        <p className="text-[20px] font-extrabold text-[#b70011] pt-1">{activeAlert.distanceKm} km</p>
                      </div>

                      <div className="col-span-3 bg-white border border-[#e6bdb8] p-3.5 rounded flex flex-col justify-between">
                        <p className="text-[11px] font-semibold tracking-[0.6px] uppercase text-[#5c403c]">Est. ETA</p>
                        <p className="text-[20px] font-extrabold text-[#b70011] pt-1">{activeAlert.etaMinutes} min</p>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-2 border-t border-[#e6bdb8]">
                      <button
                        onClick={() => handleStatusUpdate(activeAlert.id, "Cleared")}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#00825a] hover:bg-[#026c4a] text-white text-[14px] font-bold tracking-[0.14px] py-3.5 rounded shadow-sm transition-colors"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
                        </svg>
                        MARK ROUTE CLEARED
                      </button>

                      <button
                        onClick={() => handleStatusUpdate(activeAlert.id, "Passed")}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#006398] hover:bg-[#004f7a] text-white text-[14px] font-bold tracking-[0.14px] py-3.5 rounded transition-colors shadow-sm"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="6" width="15" height="10" rx="1" /><path d="M16 9h3l3 3v4h-6" /><circle cx="6" cy="18" r="1.5" /><circle cx="18" cy="18" r="1.5" />
                        </svg>
                        MARK AMBULANCE PASSED
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-8 flex flex-col items-center justify-center text-center gap-3 h-full">
                    <div className="w-14 h-14 rounded-full bg-[#00825a]/10 flex items-center justify-center text-2xl">
                      🟢
                    </div>
                    <div>
                      <h4 className="text-[20px] font-bold text-[#281715]">Junction Clear &amp; Operational</h4>
                      <p className="text-[14px] text-[#5c403c] pt-1">
                        No active approaching emergency vehicles detected at Signal Junction A.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Cleared Routes Table */}
            <div className="bg-[#fff8f7] border border-[#e6bdb8] rounded-lg shadow-sm overflow-hidden">
              <div className="bg-[#ffe9e6] border-b border-[#e6bdb8] px-6 py-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-[18px] font-bold text-[#281715]">
                  <svg className="w-5 h-5 text-[#00825a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
                  </svg>
                  Recent Cleared Routes &amp; Activity Log ({clearedRoutes.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-[#e6bdb8] text-[#5c403c] text-[13px] font-semibold tracking-[0.7px] uppercase">
                      <th className="p-4">Ambulance Reg</th>
                      <th className="p-4">Route (Origin → Destination)</th>
                      <th className="p-4">Junction</th>
                      <th className="p-4">Time Updated</th>
                      <th className="p-4">Action Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6bdb8] text-[15px] text-[#281715]">
                    {clearedRoutes.length > 0 ? (
                      clearedRoutes.map((route) => (
                        <tr key={route.id} className="hover:bg-[#fff0ee]/50 transition-colors">
                          <td className="p-4 mono font-bold text-[#b70011]">{route.ambulanceReg}</td>
                          <td className="p-4 font-medium">{route.from} → <span className="text-[#006398]">{route.to}</span></td>
                          <td className="p-4 text-[#5c403c]">{route.signalPost || "Signal Junction A"}</td>
                          <td className="p-4 text-[#5c403c] mono text-[13px]">
                            {formattedTime}
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 text-[12px] font-bold rounded-full border ${
                                route.status === "Cleared"
                                  ? "bg-[#00825a]/10 text-[#006646] border-[#00825a]/30"
                                  : "bg-[#006398]/10 text-[#004f7a] border-[#006398]/30"
                              }`}
                            >
                              <span className="w-2 h-2 rounded-full bg-current"></span>
                              {route.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-[#5c403c] italic">
                          No cleared routes recorded yet for this operational session.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Emergency Approaching Modal */}
      {showModal && modalNotif && (
        <div className="fixed inset-0 bg-[#281715]/80 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-[448px] bg-[#fff8f7] border-4 border-[#dc2626] rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in">
            <div className="bg-[#dc2626] text-white p-6 flex gap-4">
              <svg className="w-[33px] h-[28px] shrink-0 animate-bounce" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2 2 20h20L12 2Z" />
              </svg>
              <div>
                <h3 className="text-[28px] leading-[34px] font-bold">EMERGENCY<br />APPROACHING!</h3>
                <p className="text-[15px] leading-6 opacity-90 pt-1">Immediate corridor clearance required.</p>
              </div>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-[12px] font-semibold tracking-[0.6px] uppercase text-[#5c403c]">Vehicle Reg</p>
                  <p className="mono text-[15px] font-bold text-[#281715] pt-1">{modalNotif.ambulanceReg}</p>
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-semibold tracking-[0.6px] uppercase text-[#5c403c]">Estimated ETA</p>
                  <p className="text-[20px] leading-7 font-extrabold text-[#b70011] pt-1">{modalNotif.etaMinutes} min</p>
                </div>
              </div>
              <div className="bg-[#fbdbd7] border border-[#e6bdb8] p-[13px] rounded flex gap-2">
                <svg className="w-5 h-5 text-[#281715] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                </svg>
                <p className="text-[14px] leading-5 text-[#281715]">
                  Approaching from {modalNotif.from}. Ensure intersection is completely clear.
                </p>
              </div>
            </div>
            <div className="bg-[#ffe9e6] border-t border-[#e6bdb8] px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-[14px] font-semibold text-[#5c403c]"
              >
                Dismiss
              </button>
              <button
                onClick={() => handleStatusUpdate(modalNotif.id, "Cleared")}
                className="flex items-center gap-2 bg-[#00825a] hover:bg-[#026c4a] text-white text-[14px] font-bold px-6 py-2 shadow-sm rounded transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
                </svg>
                MARK ROUTE CLEARED
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
