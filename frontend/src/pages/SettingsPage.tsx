import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { useAuth } from "../hooks/useAuth";

export function SettingsPage() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState("John");
  const [lastName, setLastName] = useState("Doe");
  const [email, setEmail] = useState("dispatcher.alpha1@atcs.gov");
  const [volume, setVolume] = useState(85);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [audibleAlarms, setAudibleAlarms] = useState(true);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavedStatus("Profile preferences updated successfully!");
    setTimeout(() => setSavedStatus(null), 3000);
  }

  return (
    <div className="bg-white min-h-screen flex">
      <Sidebar />

      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        <Header />

        <main className="max-w-[1280px] mx-auto w-full p-12 flex flex-col gap-8">
          <div className="pb-2">
            <h1 className="text-[36px] leading-[44px] font-bold text-[#281715] tracking-[-0.72px]">System Preferences</h1>
            <p className="text-[16px] leading-6 text-[#5c403c] pt-1">
              Manage your account settings, notification preferences, and system configurations.
            </p>
          </div>

          {savedStatus && (
            <div className="bg-[#00825a]/10 border border-[#00825a]/30 text-[#006646] p-4 rounded text-[14px] font-semibold">
              {savedStatus}
            </div>
          )}

          <div className="grid grid-cols-12 gap-8">
            {/* Left column */}
            <div className="col-span-8 flex flex-col gap-8">
              
              {/* Profile Settings */}
              <form onSubmit={handleSaveProfile} className="bg-white border border-[#e5e7eb] rounded shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-1px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="bg-[#f9fafb] border-b border-[#e5e7eb] px-6 pt-4 pb-[17px]">
                  <h3 className="flex items-center gap-2 text-[20px] leading-7 font-semibold text-[#281715]">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                    Profile Settings
                  </h3>
                </div>
                <div className="p-6 flex gap-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-xl border-2 border-[#e6bdb8] bg-[#ffe2de] flex items-center justify-center text-5xl overflow-hidden">
                      {user?.role === "Ambulance" ? "🚑" : user?.role === "Police" ? "👮" : "👩✈️"}
                    </div>
                    <button type="button" className="border border-[#d1d5db] text-[#4b5563] text-[14px] font-semibold tracking-[0.14px] px-[17px] py-[9px] rounded-sm hover:bg-[#f9fafb]">
                      Change Photo
                    </button>
                  </div>
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="flex gap-4">
                      <div className="flex-1 flex flex-col gap-1">
                        <label className="text-[14px] font-semibold text-[#281715] tracking-[0.14px]">First Name</label>
                        <input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="border border-[#d1d5db] rounded-sm px-[13px] py-[9px] text-[16px] text-[#281715] focus:outline-none focus:ring-1 focus:ring-[#006398]"
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        <label className="text-[14px] font-semibold text-[#281715] tracking-[0.14px]">Last Name</label>
                        <input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="border border-[#d1d5db] rounded-sm px-[13px] py-[9px] text-[16px] text-[#281715] focus:outline-none focus:ring-1 focus:ring-[#006398]"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[14px] font-semibold text-[#281715] tracking-[0.14px]">Email Address</label>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-[#d1d5db] rounded-sm px-[13px] py-[9px] text-[16px] text-[#281715] focus:outline-none focus:ring-1 focus:ring-[#006398]"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <span className="flex items-center gap-1 bg-[#ffe2de] border border-[#e6bdb8] text-[#5c403c] text-[12px] font-medium px-[13px] py-[5px] rounded-full">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#006398]"></span> {user?.role || "Senior Controller"}
                      </span>
                      <span className="flex items-center gap-1 bg-[#dc2626]/10 border border-[#dc2626]/30 text-[#dc2626] text-[12px] font-medium px-[13px] py-[5px] rounded-full">
                        <svg className="w-2.5 h-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Z" />
                        </svg>
                        Admin Access
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-[#f9fafb] border-t border-[#e5e7eb] px-6 pt-[17px] pb-4 flex justify-end">
                  <button type="submit" className="bg-[#0284c7] hover:bg-[#026a9e] text-white text-[14px] font-semibold tracking-[0.14px] px-6 py-2 rounded-sm transition-colors">
                    Save Changes
                  </button>
                </div>
              </form>

              {/* Security Settings */}
              <section className="bg-white border border-[#e5e7eb] rounded shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-1px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="bg-[#f9fafb] border-b border-[#e5e7eb] px-6 pt-4 pb-[17px]">
                  <h3 className="flex items-center gap-2 text-[20px] leading-7 font-semibold text-[#281715]">
                    <svg className="w-4 h-[21px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Security Settings
                  </h3>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-1 max-w-[448px]">
                    <label className="text-[14px] font-semibold text-[#281715] tracking-[0.14px]">Current Password</label>
                    <input type="password" className="border border-[#d1d5db] rounded-sm h-[42px] px-3 text-[15px]" />
                  </div>
                  <div className="flex gap-4 max-w-[672px]">
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-[14px] font-semibold text-[#281715] tracking-[0.14px]">New Password</label>
                      <input type="password" className="border border-[#d1d5db] rounded-sm h-[42px] px-3 text-[15px]" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-[14px] font-semibold text-[#281715] tracking-[0.14px]">Confirm New Password</label>
                      <input type="password" className="border border-[#d1d5db] rounded-sm h-[42px] px-3 text-[15px]" />
                    </div>
                  </div>
                </div>
                <div className="bg-[#f9fafb] border-t border-[#e5e7eb] px-6 pt-[17px] pb-4">
                  <button type="button" className="border border-[#d1d5db] bg-white text-[#4b5563] text-[14px] font-semibold tracking-[0.14px] px-[25px] py-[9px] rounded-sm hover:bg-[#f9fafb]">
                    Update Password
                  </button>
                </div>
              </section>
            </div>

            {/* Right column */}
            <div className="col-span-4 flex flex-col gap-8">
              
              {/* Notifications */}
              <section className="bg-white border border-[#e5e7eb] rounded shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-1px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="bg-[#f9fafb] border-b border-[#e5e7eb] px-6 pt-4 pb-[17px]">
                  <h3 className="flex items-center gap-2 text-[20px] leading-7 font-semibold text-[#281715]">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                    </svg>
                    Notifications
                  </h3>
                </div>
                <div className="p-6 flex flex-col gap-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[14px] font-semibold text-[#281715] tracking-[0.14px]">Emergency Alerts</p>
                        <p className="text-[12px] font-medium text-[#5c403c]">Push notifications for critical trips</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emergencyAlerts}
                          onChange={(e) => setEmergencyAlerts(e.target.checked)}
                          className="sr-only toggle"
                        />
                        <div className={`w-11 h-6 rounded-full transition-colors ${emergencyAlerts ? "bg-[#006398]" : "bg-gray-300"}`}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow mt-1 ml-1 transition-transform flex items-center justify-center ${emergencyAlerts ? "translate-x-5" : ""}`}>
                            {emergencyAlerts && (
                              <svg className="w-2.5 h-2.5 text-[#006398]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[14px] font-semibold text-[#281715] tracking-[0.14px]">Audible Alarms</p>
                        <p className="text-[12px] font-medium text-[#5c403c]">Sound alerts for incoming requests</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={audibleAlarms}
                          onChange={(e) => setAudibleAlarms(e.target.checked)}
                          className="sr-only toggle"
                        />
                        <div className={`w-11 h-6 rounded-full transition-colors ${audibleAlarms ? "bg-[#006398]" : "bg-gray-300"}`}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow mt-1 ml-1 transition-transform flex items-center justify-center ${audibleAlarms ? "translate-x-5" : ""}`}>
                            {audibleAlarms && (
                              <svg className="w-2.5 h-2.5 text-[#006398]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <hr className="border-[#e5e7eb]" />

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[14px] font-semibold text-[#281715] tracking-[0.14px]">Alert Volume</label>
                      <span className="mono text-[14px] text-[#006398]">{volume}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-[11px] h-[13px] text-[#5c403c]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 10v4h4l5 5V5L7 10H3Z" />
                      </svg>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="flex-1 h-2 bg-[#e5e7eb] rounded-full appearance-none accent-[#006398]"
                      />
                      <svg className="w-[15px] h-[15px] text-[#5c403c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 5 6 9H2v6h4l5 4V5Z" /><path d="M19 8a5 5 0 0 1 0 8" />
                      </svg>
                    </div>
                  </div>
                </div>
              </section>

              {/* System Config */}
              <section className="bg-white border border-[#e5e7eb] rounded shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-1px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="bg-[#f9fafb] border-b border-[#e5e7eb] px-6 pt-4 pb-[17px]">
                  <h3 className="flex items-center gap-2 text-[20px] leading-7 font-semibold text-[#281715]">
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" /><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
                    </svg>
                    System Config
                  </h3>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[14px] font-semibold text-[#281715] tracking-[0.14px]">Interface Language</label>
                    <select className="border border-[#d1d5db] rounded-sm px-[13px] py-[9px] text-[16px] text-[#281715] bg-white">
                      <option>English (US)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[14px] font-semibold text-[#281715] tracking-[0.14px]">Timezone</label>
                    <select className="border border-[#d1d5db] rounded-sm px-[13px] py-[9px] text-[16px] text-[#281715] bg-white">
                      <option>(UTC-05:00) Eastern Time</option>
                      <option>(UTC+05:30) India Standard Time</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[14px] font-semibold text-[#281715] tracking-[0.14px]">Date Format</label>
                    <select className="border border-[#d1d5db] rounded-sm px-[13px] py-[9px] text-[16px] text-[#281715] bg-white">
                      <option>YYYY-MM-DD (ISO)</option>
                    </select>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
