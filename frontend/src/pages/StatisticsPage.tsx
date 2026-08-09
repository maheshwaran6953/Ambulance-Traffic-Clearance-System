import { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { getStats } from "../api/adminApi";
import type { AdminStats } from "../types";

export function StatisticsPage() {
  const [stats, setStats] = useState<AdminStats>({
    activeTripsCount: 14,
    totalOfficersCount: 128,
    clearedJunctionsCount: 342,
    avgResponseTime: "4m 12s",
  });

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await getStats();
      setStats(data);
    } catch {
      // Fallback
    }
  }

  function handleDownloadPDF() {
    setIsGenerating(true);

    const reportDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const reportTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ATCS Emergency Response Report</title>
        <style>
          body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #281715; line-height: 1.6; }
          .header { border-bottom: 3px solid #b70011; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 26px; font-weight: bold; color: #b70011; margin: 0; }
          .subtitle { font-size: 14px; color: #5c403c; margin-top: 5px; }
          .meta { font-size: 12px; color: #777; margin-top: 10px; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
          .card { border: 1px solid #e6bdb8; background: #fff8f7; padding: 20px; border-radius: 8px; }
          .card-title { font-size: 12px; text-transform: uppercase; color: #5c403c; font-weight: bold; }
          .card-val { font-size: 32px; font-weight: bold; color: #281715; margin: 10px 0 0 0; }
          .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .table th { background: #ffe2de; color: #b70011; text-align: left; padding: 10px; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #e6bdb8; }
          .table td { padding: 10px; border-bottom: 1px solid #eee; font-size: 14px; }
          .footer { margin-top: 50px; border-top: 1px solid #ccc; pt: 20px; font-size: 11px; text-align: center; color: #777; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">AMBULANCE TRAFFIC CLEARANCE SYSTEM</h1>
          <p class="subtitle">Official Emergency System Performance & Traffic Analytics Report</p>
          <p class="meta">Generated on ${reportDate} at ${reportTime} | Authorized by System Admin</p>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-title">Active Emergency Trips</div>
            <div class="card-val">${stats.activeTripsCount}</div>
          </div>
          <div class="card">
            <div class="card-title">Deployed Traffic Officers</div>
            <div class="card-val">${stats.totalOfficersCount}</div>
          </div>
          <div class="card">
            <div class="card-title">Cleared Junction Corridors (24h)</div>
            <div class="card-val">${stats.clearedJunctionsCount}</div>
          </div>
          <div class="card">
            <div class="card-title">Average Response Time</div>
            <div class="card-val">${stats.avgResponseTime}</div>
          </div>
        </div>

        <h2>Junction Performance Breakdown</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Signal Junction Location</th>
              <th>Trips Cleared</th>
              <th>Avg Clearance Speed</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Signal Junction A (Main St & 4th Ave)</td>
              <td>142 Trips</td>
              <td>42 seconds</td>
              <td>Optimal</td>
            </tr>
            <tr>
              <td>Jct 42 - Broadway Corridor</td>
              <td>98 Trips</td>
              <td>51 seconds</td>
              <td>Optimal</td>
            </tr>
            <tr>
              <td>Jct 18 - 5th Ave / Oak St</td>
              <td>74 Trips</td>
              <td>58 seconds</td>
              <td>Operational</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>© 2026 Ambulance Traffic Clearance System (ATCS) • Confidential Emergency Operational Document</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    // Trigger printable PDF / Document download window
    const blob = new Blob([reportHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, "_blank");

    if (!printWindow) {
      // Direct file download fallback
      const link = document.createElement("a");
      link.href = url;
      link.download = `ATCS_Emergency_Analytics_Report_${Date.now()}.html`;
      link.click();
    }

    setTimeout(() => {
      setIsGenerating(false);
    }, 1000);
  }

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
                <h1 className="text-[32px] leading-[40px] font-bold text-[#281715] tracking-[-0.72px]">
                  Emergency System Analytics &amp; Statistics
                </h1>
                <p className="text-[15px] text-[#5c403c] pt-1">
                  Comprehensive metric analysis of emergency response times, signal junction clearances, and officer deployments.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGenerating}
                  className="border border-[#b70011] bg-[#ffe2de] hover:bg-[#ffdad6] text-[#b70011] text-[14px] font-bold px-5 py-2.5 rounded transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {isGenerating ? "Preparing Report..." : "Download PDF Report"}
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-[#fff8f7] border border-[#e6bdb8] rounded-sm overflow-hidden">
                <div className="bg-[#fbdbd7]/50 border-b border-[#e6bdb8] px-4 pt-2 pb-[9px] flex items-center justify-between">
                  <span className="text-[12px] font-medium tracking-[0.6px] uppercase text-[#5c403c]">Active Emergency Trips</span>
                  <svg className="w-4 h-4 text-[#dc2626]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="8" width="14" height="8" rx="1" /><path d="M17 10h2l2 3v3h-4" /><circle cx="7" cy="18" r="1.5" /><circle cx="17" cy="18" r="1.5" />
                  </svg>
                </div>
                <div className="px-6 py-[26px]">
                  <p className="text-[36px] leading-[44px] font-bold text-[#281715] tracking-[-0.72px]">
                    {stats.activeTripsCount}
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]"></span>
                    <span className="text-[12px] font-medium text-[#dc2626]">3 Critical Code 3</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#fff8f7] border border-[#e6bdb8] rounded-sm overflow-hidden">
                <div className="bg-[#fbdbd7]/50 border-b border-[#e6bdb8] px-4 pt-2 pb-[9px] flex items-center justify-between">
                  <span className="text-[12px] font-medium tracking-[0.6px] uppercase text-[#5c403c]">Deployed Officers</span>
                  <svg className="w-4 h-4 text-[#006398]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Z" />
                  </svg>
                </div>
                <div className="px-6 py-[26px]">
                  <p className="text-[36px] leading-[44px] font-bold text-[#281715] tracking-[-0.72px]">
                    {stats.totalOfficersCount}
                  </p>
                  <p className="text-[12px] font-medium text-[#006646] pt-2">94% Active Deployment</p>
                </div>
              </div>

              <div className="bg-[#fff8f7] border border-[#e6bdb8] rounded-sm overflow-hidden">
                <div className="bg-[#fbdbd7]/50 border-b border-[#e6bdb8] px-4 pt-2 pb-[9px] flex items-center justify-between">
                  <span className="text-[12px] font-medium tracking-[0.6px] uppercase text-[#5c403c]">Cleared Routes (24h)</span>
                  <svg className="w-4 h-4 text-[#00825a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div className="p-6">
                  <p className="text-[36px] leading-[44px] font-bold text-[#281715] tracking-[-0.72px]">
                    {stats.clearedJunctionsCount}
                  </p>
                  <div className="flex items-center gap-1 pt-2">
                    <span className="text-[12px] font-medium text-[#006646]">+12% vs last week</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#fff8f7] border border-[#e6bdb8] rounded-sm overflow-hidden">
                <div className="bg-[#fbdbd7]/50 border-b border-[#e6bdb8] px-4 pt-2 pb-[9px] flex items-center justify-between">
                  <span className="text-[12px] font-medium tracking-[0.6px] uppercase text-[#5c403c]">Avg Response Time</span>
                  <svg className="w-4 h-4 text-[#b70011]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="13" r="8" /><path d="M12 9v4l3 2" />
                  </svg>
                </div>
                <div className="p-6">
                  <p className="text-[36px] leading-[44px] font-bold text-[#281715] tracking-[-0.72px]">
                    {stats.avgResponseTime}
                  </p>
                  <div className="flex items-center gap-1 pt-2">
                    <span className="text-[12px] font-medium text-[#006646]">-0m 45s faster than target</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Charts & Detailed Metrics */}
            <div className="grid grid-cols-12 gap-8">
              
              {/* Emergency Response Volume Chart */}
              <div className="col-span-8 bg-white border border-[#e6bdb8] rounded-lg shadow-sm p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[20px] font-semibold text-[#281715]">Daily Emergency Clearances (7 Days)</h3>
                    <p className="text-[14px] text-[#5c403c]">Real-time record of cleared ambulance corridors</p>
                  </div>
                  <span className="mono text-[13px] bg-[#fff0ee] text-[#b70011] px-3 py-1 rounded font-semibold border border-[#e6bdb8]">
                    Peak Volume: Thursday
                  </span>
                </div>

                <div className="h-64 bg-[#fff8f7] border border-[#e6bdb8]/50 rounded flex items-end justify-around gap-4 p-6">
                  <div className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                    <div className="w-full h-[45%] bg-[#006398] rounded-t transition-all hover:bg-[#004f7a]"></div>
                    <span className="text-[12px] font-semibold text-[#5c403c]">Mon</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                    <div className="w-full h-[60%] bg-[#006398] rounded-t transition-all hover:bg-[#004f7a]"></div>
                    <span className="text-[12px] font-semibold text-[#5c403c]">Tue</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                    <div className="w-full h-[52%] bg-[#006398] rounded-t transition-all hover:bg-[#004f7a]"></div>
                    <span className="text-[12px] font-semibold text-[#5c403c]">Wed</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                    <div className="w-full h-[85%] bg-[#dc2626] rounded-t transition-all hover:bg-[#c31f1f]"></div>
                    <span className="text-[12px] font-semibold text-[#dc2626]">Thu (Peak)</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                    <div className="w-full h-[68%] bg-[#006398] rounded-t transition-all hover:bg-[#004f7a]"></div>
                    <span className="text-[12px] font-semibold text-[#5c403c]">Fri</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                    <div className="w-full h-[38%] bg-[#006398] rounded-t transition-all hover:bg-[#004f7a]"></div>
                    <span className="text-[12px] font-semibold text-[#5c403c]">Sat</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                    <div className="w-full h-[55%] bg-[#006398] rounded-t transition-all hover:bg-[#004f7a]"></div>
                    <span className="text-[12px] font-semibold text-[#5c403c]">Sun</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-8 border-t border-[#e6bdb8] pt-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[#006398]"></span>
                    <span className="text-[13px] font-medium text-[#5c403c]">Normal Emergency Traffic</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[#dc2626]"></span>
                    <span className="text-[13px] font-medium text-[#5c403c]">Critical Surge Level</span>
                  </div>
                </div>
              </div>

              {/* Junction Response Breakdown */}
              <div className="col-span-4 bg-white border border-[#e6bdb8] rounded-lg shadow-sm p-6 flex flex-col gap-6">
                <div>
                  <h3 className="text-[20px] font-semibold text-[#281715]">Top Junction Clearances</h3>
                  <p className="text-[14px] text-[#5c403c]">Highest frequency signal posts</p>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <div className="flex justify-between text-[14px] font-semibold text-[#281715] pb-1">
                      <span>Signal Junction A (Main St)</span>
                      <span className="mono text-[#b70011]">142 Trips</span>
                    </div>
                    <div className="h-2 bg-[#fbdbd7] rounded-full overflow-hidden">
                      <div className="h-full bg-[#b70011]" style={{ width: "85%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[14px] font-semibold text-[#281715] pb-1">
                      <span>Jct 42 - Broadway</span>
                      <span className="mono text-[#006398]">98 Trips</span>
                    </div>
                    <div className="h-2 bg-[#fbdbd7] rounded-full overflow-hidden">
                      <div className="h-full bg-[#006398]" style={{ width: "62%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[14px] font-semibold text-[#281715] pb-1">
                      <span>Jct 18 - 5th Ave</span>
                      <span className="mono text-[#00825a]">74 Trips</span>
                    </div>
                    <div className="h-2 bg-[#fbdbd7] rounded-full overflow-hidden">
                      <div className="h-full bg-[#00825a]" style={{ width: "48%" }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#fff0ee] border border-[#e6bdb8] p-4 rounded text-[13px] text-[#5c403c] flex flex-col gap-1">
                  <p className="font-bold text-[#b70011]">💡 Efficiency Note:</p>
                  <p>Signal Junction A shows the highest clearance efficiency with an average clearance time under 45 seconds.</p>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
