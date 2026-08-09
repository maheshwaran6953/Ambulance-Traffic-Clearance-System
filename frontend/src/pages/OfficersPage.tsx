import { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { getOfficers } from "../api/adminApi";
import type { Officer } from "../types";

export function OfficersPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [filterOnline, setFilterOnline] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    loadOfficers();
    const interval = setInterval(() => {
      loadOfficers();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  async function loadOfficers() {
    try {
      const data = await getOfficers();
      if (data && data.length > 0) {
        setOfficers(data);
      }
    } catch {
      // Handled in API layer
    }
  }

  const filteredOfficers = officers.filter((officer) => {
    const matchesStatus =
      filterOnline === "All" ||
      (filterOnline === "Online" && officer.online) ||
      (filterOnline === "Offline" && !officer.online);

    const matchesSearch =
      officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.signalPost.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (officer.badgeNumber && officer.badgeNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-[#fff8f7] min-h-screen flex">
      <Sidebar />

      <div className="ml-64 flex-1 flex flex-col min-h-screen overflow-y-auto">
        <Header />

        <main className="flex-1 p-6">
          <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
            
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-[32px] leading-[40px] font-bold text-[#281715] tracking-[-0.7px]">
                  Traffic Police &amp; Signal Dispatchers
                </h1>
                <p className="text-[15px] text-[#5c403c] pt-1">
                  Manage active traffic officers deployed at critical signal junctions.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c403c]">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search officer name, badge, junction..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-[#e6bdb8] bg-white rounded text-[14px] text-[#281715] placeholder-[#5c403c] focus:outline-none focus:ring-1 focus:ring-[#b70011]"
                  />
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-[#e6bdb8] pb-2">
              {["All", "Online", "Offline"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterOnline(tab)}
                  className={`px-4 py-2 text-[14px] font-semibold tracking-[0.14px] rounded transition-colors ${
                    filterOnline === tab
                      ? "bg-[#006398] text-white shadow-sm"
                      : "text-[#5c403c] hover:bg-[#fff0ee]"
                  }`}
                >
                  {tab} Officers
                </button>
              ))}
            </div>

            {/* Officers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOfficers.map((officer) => (
                <div
                  key={officer.id}
                  className="bg-white border border-[#e6bdb8] rounded-lg shadow-sm p-6 flex flex-col justify-between hover:border-[#b70011]/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-[#e6bdb8]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#fbdbd7] border border-[#e6bdb8] flex items-center justify-center text-xl">
                          👮
                        </div>
                        <div>
                          <h3 className="text-[18px] font-bold text-[#b70011]">{officer.name}</h3>
                          <p className="mono text-[12px] text-[#5c403c]">{officer.badgeNumber || `BADGE-${officer.id}`}</p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold ${
                          officer.online
                            ? "bg-[#00825a]/10 text-[#006646] border border-[#00825a]/30"
                            : "bg-[#5c403c]/10 text-[#5c403c] border border-[#5c403c]/30"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${officer.online ? "bg-[#006646]" : "bg-[#5c403c]"}`}></span>
                        {officer.online ? "On Duty" : "Offline"}
                      </span>
                    </div>

                    <div className="py-4 flex flex-col gap-2">
                      <div>
                        <p className="text-[12px] font-semibold text-[#5c403c] uppercase tracking-[0.6px]">
                          Assigned Junction
                        </p>
                        <p className="text-[15px] font-medium text-[#281715] pt-0.5">{officer.signalPost}</p>
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-[#5c403c] uppercase tracking-[0.6px]">
                          Last Connection
                        </p>
                        <p className="text-[14px] text-[#5c403c]">{officer.lastActiveAt}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#e6bdb8] flex gap-2">
                    <button className="flex-1 py-2 bg-[#fff0ee] hover:bg-[#ffe2de] text-[#b70011] text-[13px] font-semibold rounded border border-[#e6bdb8] transition-colors">
                      Dispatch Alert
                    </button>
                    <button className="px-3 py-2 bg-white hover:bg-[#fff0ee] text-[#006398] text-[13px] font-semibold rounded border border-[#e6bdb8] transition-colors">
                      Direct Signal
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
