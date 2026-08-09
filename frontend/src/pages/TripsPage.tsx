import { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { getAllActiveTrips } from "../api/adminApi";
import { useAuth } from "../hooks/useAuth";
import { useSignalR } from "../hooks/useSignalR";
import type { Trip } from "../types";

export function TripsPage() {
  const { token } = useAuth();
  const { lastNotification } = useSignalR(token);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    loadTrips();
    const interval = setInterval(() => {
      loadTrips();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (lastNotification) {
      loadTrips();
    }
  }, [lastNotification]);

  async function loadTrips() {
    try {
      const data = await getAllActiveTrips();
      const extraHistory: Trip[] = [
        {
          id: "TRP-8088",
          from: "City Hospital, Block B",
          to: "General Trauma Center",
          startedAt: "10:45 AM",
          status: "Passed",
          ambulanceReg: "MH-12-AB-1234",
          priorityLevel: "High",
          patientType: "Trauma",
          progressPercent: 100,
        },
        {
          id: "TRP-8082",
          from: "Ring Road Station",
          to: "Junction A Medical Unit",
          startedAt: "09:12 AM",
          status: "Cleared",
          ambulanceReg: "DL-01-XY-9876",
          priorityLevel: "Standard",
          patientType: "General Emergency",
          progressPercent: 100,
        },
        {
          id: "TRP-8079",
          from: "Metro Hospital",
          to: "St. Jude Hospital",
          startedAt: "Yesterday 11:30 PM",
          status: "Completed",
          ambulanceReg: "KA-05-MM-3321",
          priorityLevel: "Critical",
          patientType: "Cardiac",
          progressPercent: 100,
        },
      ];

      // Merge avoiding duplicate IDs
      const mergedMap = new Map<string, Trip>();
      data.forEach((t) => mergedMap.set(t.id, t));
      extraHistory.forEach((t) => {
        if (!mergedMap.has(t.id)) mergedMap.set(t.id, t);
      });

      setTrips(Array.from(mergedMap.values()));
    } catch {
      // Fallback handled in API
    }
  }

  const filteredTrips = trips.filter((trip) => {
    const matchesStatus = filterStatus === "All" || trip.status === filterStatus;
    const matchesSearch =
      trip.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (trip.ambulanceReg && trip.ambulanceReg.toLowerCase().includes(searchTerm.toLowerCase())) ||
      trip.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.to.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-[#fff8f7] min-h-screen flex">
      <Sidebar />

      <div className="ml-64 flex-1 flex flex-col min-h-screen overflow-y-auto">
        <Header />

        <main className="flex-1 p-6">
          <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
            
            {/* Page Title & Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-[32px] leading-[40px] font-bold text-[#281715] tracking-[-0.7px]">
                  Emergency Trips Operations
                </h1>
                <p className="text-[15px] text-[#5c403c] pt-1">
                  Monitor live emergency dispatch operations, route clearances, and historical trip logs.
                </p>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c403c]">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search trips, vehicles, routes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-[#e6bdb8] bg-white rounded text-[14px] text-[#281715] placeholder-[#5c403c] focus:outline-none focus:ring-1 focus:ring-[#b70011]"
                  />
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-[#e6bdb8] pb-2">
              {["All", "Active", "Cleared", "Passed", "Completed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 text-[14px] font-semibold tracking-[0.14px] rounded transition-colors ${
                    filterStatus === status
                      ? "bg-[#b70011] text-white shadow-sm"
                      : "text-[#5c403c] hover:bg-[#fff0ee]"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Trips Table */}
            <div className="bg-[#fff8f7] border border-[#e6bdb8] rounded shadow-sm overflow-hidden">
              <div className="bg-[#ffe9e6] border-b border-[#e6bdb8] px-6 py-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-[18px] font-semibold text-[#281715]">
                  <svg className="w-5 h-5 text-[#b70011]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="8" width="14" height="8" rx="1" /><path d="M17 10h2l2 3v3h-4" /><circle cx="7" cy="18" r="1.5" /><circle cx="17" cy="18" r="1.5" />
                  </svg>
                  Showing {filteredTrips.length} Emergency Trips (Live Feed)
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-[#e6bdb8] text-[#5c403c] text-[13px] font-semibold tracking-[0.7px] uppercase">
                      <th className="p-4">Trip ID</th>
                      <th className="p-4">Vehicle Reg</th>
                      <th className="p-4">Route (Origin → Destination)</th>
                      <th className="p-4">Priority</th>
                      <th className="p-4">Patient Type</th>
                      <th className="p-4">Progress</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6bdb8] text-[15px] text-[#281715]">
                    {filteredTrips.length > 0 ? (
                      filteredTrips.map((trip) => {
                        const statusColor =
                          trip.status === "Active"
                            ? "bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/30"
                            : trip.status === "Cleared" || trip.status === "Passed" || trip.status === "Completed"
                            ? "bg-[#00825a]/10 text-[#006646] border-[#00825a]/30"
                            : "bg-[#5c403c]/10 text-[#5c403c] border-[#5c403c]/30";

                        return (
                          <tr key={trip.id} className="hover:bg-[#fff0ee]/50 transition-colors">
                            <td className="p-4 mono font-bold text-[#b70011]">{trip.id}</td>
                            <td className="p-4 mono font-semibold">{trip.ambulanceReg || "KA-01-EQ-9901"}</td>
                            <td className="p-4">
                              <span className="font-medium">{trip.from}</span>
                              <span className="text-[#5c403c] mx-2">→</span>
                              <span className="font-medium text-[#006398]">{trip.to}</span>
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 text-[12px] font-semibold rounded bg-[#ffe2de] text-[#b70011]">
                                {trip.priorityLevel || "Critical"}
                              </span>
                            </td>
                            <td className="p-4 text-[#5c403c] font-medium">{trip.patientType || "Cardiac"}</td>
                            <td className="p-4 w-40">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-[#fbdbd7] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#b70011] rounded-full transition-all duration-500"
                                    style={{ width: `${trip.progressPercent || 100}%` }}
                                  ></div>
                                </div>
                                <span className="mono text-[12px] font-semibold text-[#5c403c]">
                                  {trip.progressPercent || 100}%
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[12px] font-bold rounded-full border ${statusColor}`}>
                                <span className="w-2 h-2 rounded-full bg-current"></span>
                                {trip.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-[#5c403c] italic">
                          No emergency trips matching the filter criteria.
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
    </div>
  );
}
