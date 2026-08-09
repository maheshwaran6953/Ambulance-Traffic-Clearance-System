import { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { getAllActiveTrips, getOfficers, getStats } from "../api/adminApi";
import type { AdminStats, Officer, Trip } from "../types";

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>({
    activeTripsCount: 14,
    totalOfficersCount: 128,
    clearedJunctionsCount: 342,
    avgResponseTime: "4m 12s",
  });
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    try {
      const [s, t, o] = await Promise.all([getStats(), getAllActiveTrips(), getOfficers()]);
      setStats(s);
      setActiveTrips(t);
      setOfficers(o);
    } catch {
      // API fallback
    }
  }

  return (
    <div className="bg-[#fff8f7] min-h-screen flex">
      <Sidebar />

      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        <Header showSearch={true} />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
            
            {/* System Overview */}
            <section className="flex flex-col gap-4">
              <h3 className="text-[20px] leading-7 font-semibold text-[#281715]">System Overview</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#fff8f7] border border-[#e6bdb8] rounded-sm overflow-hidden">
                  <div className="bg-[#fbdbd7]/50 border-b border-[#e6bdb8] px-4 pt-2 pb-[9px] flex items-center justify-between">
                    <span className="text-[12px] font-medium tracking-[0.6px] uppercase text-[#5c403c]">Active Trips</span>
                    <svg className="w-3 h-3.5 text-[#5c403c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v13a1 1 0 0 0 1 1h10" /><path d="m15 18 3 3 5-5" />
                    </svg>
                  </div>
                  <div className="px-6 py-[26px]">
                    <p className="text-[36px] leading-[44px] font-bold text-[#281715] tracking-[-0.72px]">
                      {stats.activeTripsCount}
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]"></span>
                      <span className="text-[12px] font-medium text-[#ba1a1a]">3 Critical</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#fff8f7] border border-[#e6bdb8] rounded-sm overflow-hidden">
                  <div className="bg-[#fbdbd7]/50 border-b border-[#e6bdb8] px-4 pt-2 pb-[9px] flex items-center justify-between">
                    <span className="text-[12px] font-medium tracking-[0.6px] uppercase text-[#5c403c]">Officers on Duty</span>
                    <svg className="w-2.5 h-3 text-[#5c403c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Z" />
                    </svg>
                  </div>
                  <div className="px-6 py-[26px]">
                    <p className="text-[36px] leading-[44px] font-bold text-[#281715] tracking-[-0.72px]">
                      {stats.totalOfficersCount}
                    </p>
                    <p className="text-[12px] font-medium text-[#006646] pt-2">94% Deployment</p>
                  </div>
                </div>

                <div className="bg-[#fff8f7] border border-[#e6bdb8] rounded-sm overflow-hidden">
                  <div className="bg-[#fbdbd7]/50 border-b border-[#e6bdb8] px-4 pt-2 pb-[9px] flex items-center justify-between">
                    <span className="text-[12px] font-medium tracking-[0.6px] uppercase text-[#5c403c]">Routes Cleared (24h)</span>
                    <svg className="w-3 h-3 text-[#5c403c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <div className="p-6">
                    <p className="text-[36px] leading-[44px] font-bold text-[#281715] tracking-[-0.72px]">
                      {stats.clearedJunctionsCount}
                    </p>
                    <div className="flex items-center gap-1 pt-2">
                      <svg className="w-4 h-2 text-[#006646]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2 20 10 6l5 6 7-10 v3 h-4 v-3 h4" />
                      </svg>
                      <span className="text-[12px] font-medium text-[#006646]">+12% vs yesterday</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#fff8f7] border border-[#e6bdb8] rounded-sm overflow-hidden">
                  <div className="bg-[#fbdbd7]/50 border-b border-[#e6bdb8] px-4 pt-2 pb-[9px] flex items-center justify-between">
                    <span className="text-[12px] font-medium tracking-[0.6px] uppercase text-[#5c403c]">Avg Response Time</span>
                    <svg className="w-2.5 h-3 text-[#5c403c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="13" r="8" /><path d="M12 9v4l3 2" />
                    </svg>
                  </div>
                  <div className="p-6">
                    <p className="text-[36px] leading-[44px] font-bold text-[#281715] tracking-[-0.72px]">
                      {stats.avgResponseTime}
                    </p>
                    <div className="flex items-center gap-1 pt-2">
                      <svg className="w-4 h-2 text-[#ba1a1a] rotate-180" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2 20 10 6l5 6 7-10 v3 h-4 v-3 h4" />
                      </svg>
                      <span className="text-[12px] font-medium text-[#ba1a1a]">-0m 45s vs target</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Live Trips + Signal Stations */}
            <div className="grid grid-cols-3 gap-6">
              <section className="col-span-2 flex flex-col">
                <div className="flex items-center justify-between pb-4">
                  <h3 className="text-[20px] leading-7 font-semibold text-[#281715]">Live Emergency Trips Monitor</h3>
                  <a href="#" className="text-[14px] font-semibold text-[#006398] tracking-[0.14px]">View All Active</a>
                </div>
                <div className="bg-[#fff8f7] border border-[#e6bdb8] rounded-sm overflow-hidden">
                  <div className="bg-[#fbdbd7]/50 border-b border-[#e6bdb8] grid grid-cols-12 gap-4 px-4 pt-3 pb-[13px] text-[12px] font-medium tracking-[0.6px] uppercase text-[#5c403c]">
                    <div className="col-span-2">ID / Unit</div>
                    <div className="col-span-3">Origin →<br />Destination</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-4">Route Progress</div>
                    <div className="col-span-1 text-right">Action</div>
                  </div>
                  <div className="divide-y divide-[#e6bdb8]">
                    <div className="grid grid-cols-12 gap-4 items-center pl-5 pr-4 py-4 border-l-4 border-[#dc2626]">
                      <div className="col-span-2">
                        <p className="mono text-[14px] font-bold text-[#281715]">TRP-8092</p>
                        <p className="text-[12px] font-medium text-[#5c403c]">ALS Unit 4</p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-[14px] text-[#281715]">Northside Gen</p>
                        <p className="text-[12px] font-medium text-[#5c403c]">Central Trauma Center</p>
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]"></span>
                        <span className="text-[14px] font-semibold text-[#dc2626] tracking-[0.14px]">Code 3</span>
                      </div>
                      <div className="col-span-4">
                        <div className="h-2 bg-[#fbdbd7] rounded-sm overflow-hidden">
                          <div className="h-full bg-[#dc2626]" style={{ width: "65%" }}></div>
                        </div>
                        <div className="flex justify-between pt-1 text-[12px] font-medium text-[#5c403c]">
                          <span>ETA: 4m</span><span>65%</span>
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button className="p-1 text-[#5c403c]">
                          <svg className="w-[22px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" /><circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 items-center pl-5 pr-4 py-4 border-l-4 border-[#d97706]">
                      <div className="col-span-2">
                        <p className="mono text-[14px] font-bold text-[#281715]">TRP-8095</p>
                        <p className="text-[12px] font-medium text-[#5c403c]">BLS Unit 12</p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-[14px] text-[#281715]">Westside Clinic</p>
                        <p className="text-[12px] font-medium text-[#5c403c]">Mercy Hospital</p>
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]"></span>
                        <span className="text-[14px] font-semibold text-[#d97706] tracking-[0.14px]">In Transit</span>
                      </div>
                      <div className="col-span-4">
                        <div className="h-2 bg-[#fbdbd7] rounded-sm overflow-hidden">
                          <div className="h-full bg-[#d97706]" style={{ width: "30%" }}></div>
                        </div>
                        <div className="flex justify-between pt-1 text-[12px] font-medium text-[#5c403c]">
                          <span>ETA: 12m</span><span>30%</span>
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button className="p-1 text-[#5c403c]">
                          <svg className="w-[22px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" /><circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="flex flex-col">
                <div className="flex items-center justify-between pb-4">
                  <h3 className="text-[20px] leading-7 font-semibold text-[#281715]">Signal Stations</h3>
                  <svg className="w-[18px] h-3 text-[#5c403c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 5h16M7 12h10M10 19h4" />
                  </svg>
                </div>
                <div className="bg-[#fff8f7] border border-[#e6bdb8] rounded-sm p-[17px] flex flex-col gap-3">
                  <div className="bg-white border border-[#e6bdb8] rounded-sm p-[13px] flex gap-3">
                    <div className="w-8 h-[42px] flex items-center justify-center text-xl shrink-0">🚦</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-[14px] font-semibold text-[#281715] tracking-[0.14px]">Jct 42 - Main/Broadway</p>
                        <span className="flex items-center gap-1 bg-[#00825a]/20 border border-[#00825a]/30 text-[#006646] text-[10px] font-bold uppercase px-2 py-0.5 rounded-full whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#006646]"></span> Active
                        </span>
                      </div>
                      <p className="text-[12px] font-medium text-[#5c403c] pt-1">👮 Off. J. Smith (ID: 442)</p>
                    </div>
                  </div>

                  <div className="bg-white border border-[#e6bdb8] rounded-sm p-[13px] flex gap-3">
                    <div className="w-8 h-[42px] flex items-center justify-center text-xl shrink-0">🚦</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-[14px] font-semibold text-[#281715] tracking-[0.14px]">Jct 18 - 5th Ave/Oak</p>
                        <span className="flex items-center gap-1 bg-[#00825a]/20 border border-[#00825a]/30 text-[#006646] text-[10px] font-bold uppercase px-2 py-0.5 rounded-full whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#006646]"></span> Active
                        </span>
                      </div>
                      <p className="text-[12px] font-medium text-[#5c403c] pt-1">👮 Off. M. Davis (ID: 891)</p>
                    </div>
                  </div>

                  <div className="bg-[#fbdbd7]/30 border border-[#e6bdb8] rounded-sm p-[13px] flex gap-3">
                    <div className="w-8 h-[42px] flex items-center justify-center text-lg shrink-0 opacity-60">📡</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-[14px] font-semibold text-[#5c403c] tracking-[0.14px]">Jct 09 - West/Pine</p>
                        <span className="flex items-center gap-1 bg-[#fbdbd7] border border-[#e6bdb8] text-[#5c403c] text-[10px] font-bold uppercase px-2 py-0.5 rounded-full whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5c403c]"></span> Offline
                        </span>
                      </div>
                      <p className="text-[12px] font-medium italic text-[#5c403c] opacity-75 pt-1">Unassigned</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Analytics */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[20px] leading-7 font-semibold text-[#281715]">Emergency Response Analytics (7 Days)</h3>
                <button className="border border-[#e6bdb8] bg-white text-[#5c403c] text-[12px] font-medium px-[13px] py-[5px] rounded-sm">
                  Export
                </button>
              </div>
              <div className="bg-[#fff8f7] border border-[#e6bdb8] rounded-sm p-[25px] flex flex-col gap-4">
                <div className="h-64 bg-white border border-[#e6bdb8]/50 rounded-sm flex items-end justify-around gap-2 p-4">
                  <div className="w-full h-[35%] bg-[#006398]/80 rounded-t-sm"></div>
                  <div className="w-full h-[56%] bg-[#006398]/80 rounded-t-sm"></div>
                  <div className="w-full h-[39%] bg-[#006398]/80 rounded-t-sm"></div>
                  <div className="w-full h-[78%] bg-[#dc2626]/80 rounded-t-sm"></div>
                  <div className="w-full h-[48%] bg-[#006398]/80 rounded-t-sm"></div>
                  <div className="w-full h-[26%] bg-[#006398]/80 rounded-t-sm"></div>
                  <div className="w-full h-[43%] bg-[#006398]/80 rounded-t-sm"></div>
                </div>
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-[#006398]"></span>
                    <span className="text-[12px] font-medium text-[#5c403c]">Normal Trip Volume</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-[#dc2626]"></span>
                    <span className="text-[12px] font-medium text-[#5c403c]">Critical Surge</span>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
