import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { roleHomePath } from "../api/mockData";

export function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const user = await login({ username, password });
      navigate(roleHomePath(user.role));
    } catch {
      // Error handled via useAuth().error
    }
  }

  function handleQuickLogin(roleUser: string) {
    setUsername(roleUser);
    setPassword("Password123!");
  }

  return (
    <div className="bg-[#f9fafb] min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px] flex flex-col gap-8">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 flex items-center justify-center text-[#dc2626]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9">
              <path d="M3 15h1.5a2.5 2.5 0 0 1 5 0h5a2.5 2.5 0 0 1 5 0H21v-4a2 2 0 0 0-2-2h-1l-2-4H9L7 9H5a2 2 0 0 0-2 2v4Z" opacity=".15" />
              <path d="M19 8h-2.28l-1.6-3.2A2 2 0 0 0 13.34 4H9.66a2 2 0 0 0-1.78.8L6.28 8H4a2 2 0 0 0-2 2v5a1 1 0 0 0 1 1h1.05a2.5 2.5 0 0 0 4.9 0h5.1a2.5 2.5 0 0 0 4.9 0H20a1 1 0 0 0 1-1v-3a4 4 0 0 0-2-3.46V8h0Zm-9.34-2h3.68l1 2H8.66l1-2ZM7 17a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm10 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
              <path d="M11 9h2v2h2v2h-2v2h-2v-2H9v-2h2V9Z" fill="white" />
            </svg>
          </div>
          <h1 className="text-[28px] font-black leading-[34px] text-[#281715] text-center tracking-[-0.7px]">
            Ambulance Traffic Clearance<br />System
          </h1>
        </div>

        {/* Login Card */}
        <div className="w-full bg-white border border-[#e6bdb8] rounded-lg shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-1px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* Card Header */}
          <div className="bg-[rgba(255,240,238,0.5)] border-b border-[#e6bdb8] px-8 pt-8 pb-[25px] flex flex-col items-center gap-2">
            <h2 className="text-[20px] font-semibold leading-7 text-[#281715]">Welcome Back</h2>
            <p className="text-[16px] leading-6 text-[#5c403c]">Sign in to access your dashboard</p>
          </div>

          {/* Card Body / Form */}
          <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-6">
              
              {/* Username */}
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-[#281715] tracking-[0.14px]">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Enter ambulance1 / police1 / admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-[41px] pr-[13px] py-[15px] rounded-[2px] border border-[#e6bdb8] text-[16px] text-[#281715] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#b70011]/30 focus:border-[#b70011]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[14px] font-semibold text-[#281715] tracking-[0.14px]">Password</label>
                  <a href="#" className="text-[12px] font-medium text-[#006398] hover:underline">Forgot?</a>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-[13px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-[41px] pr-[41px] py-[15px] rounded-[2px] border border-[#e6bdb8] text-[16px] text-[#281715] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#b70011]/30 focus:border-[#b70011]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="bg-[#ffe2de] border border-[#dc2626]/40 text-[#dc2626] p-3 rounded text-[13px] font-medium">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#dc2626] hover:bg-[#c31f1f] transition-colors text-white text-[14px] font-semibold tracking-[0.14px] py-[13px] rounded-[2px] shadow-sm disabled:opacity-50"
              >
                {isLoading ? "Authenticating…" : "Sign In"}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
                </svg>
              </button>
            </div>

            {/* Divider */}
            <div className="relative w-full flex items-center justify-center">
              <div className="absolute inset-x-0 top-1/2 border-t border-[#e6bdb8]"></div>
              <span className="relative bg-white px-2 text-[12px] font-medium tracking-[0.6px] uppercase text-[#5c403c]">
                Quick Login Roles
              </span>
            </div>

            {/* Quick Login Roles */}
            <div className="grid grid-cols-3 gap-3 w-full">
              <button
                type="button"
                onClick={() => handleQuickLogin("ambulance1")}
                className="flex flex-col items-center justify-center gap-2 border border-[#e6bdb8] rounded py-[13px] hover:bg-[#fff0ee] transition-colors"
              >
                <span className="text-[#dc2626] text-lg">✱</span>
                <span className="text-[12px] font-medium text-[#281715] text-center leading-[15px]">
                  Ambulance<br />Crew
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("police1")}
                className="flex flex-col items-center justify-center gap-2 border border-[#e6bdb8] rounded py-[13px] hover:bg-[#fff0ee] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-5 text-[#006398]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Z" />
                </svg>
                <span className="text-[12px] font-medium text-[#281715] text-center leading-[15px]">
                  Police<br />Officer
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("admin")}
                className="flex flex-col items-center justify-center gap-2 border border-[#e6bdb8] rounded py-[13px] hover:bg-[#fff0ee] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-5 text-[#00825a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
                </svg>
                <span className="text-[12px] font-medium text-[#281715] text-center leading-[15px]">
                  System<br />Admin
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 items-center text-center">
          <p className="text-[12px] text-[#5c403c]">
            Need help? Contact IT Support at <a href="mailto:support@atcs.gov" className="font-medium text-[#006398]">support@atcs.gov</a>
          </p>
          <p className="text-[12px] text-[#5c403c] opacity-70">Secure Connection Established • System v2.4.1</p>
        </div>
      </div>
    </div>
  );
}
