import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const roleEmoji = user?.role === "Ambulance" ? "🚑" : user?.role === "Police" ? "👮" : "🧑💼";
  const userTitle = user?.name || "Dispatcher Alpha-1";

  const homePath =
    user?.role === "Ambulance"
      ? "/ambulance/dashboard"
      : user?.role === "Police"
      ? "/police/dashboard"
      : "/admin/dashboard";

  const navItems = [
    {
      label: "Home",
      path: homePath,
      icon: (
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9.5 12 3l9 6.5" /><path d="M5 10v10h14V10" />
        </svg>
      ),
    },
    {
      label: "Trips",
      path: "/trips",
      icon: (
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="8" width="14" height="8" rx="1" /><path d="M17 10h2l2 3v3h-4" /><circle cx="7" cy="18" r="1.5" /><circle cx="17" cy="18" r="1.5" />
        </svg>
      ),
    },
    {
      label: "Officers",
      path: "/officers",
      icon: (
        <svg className="w-[17px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Z" />
        </svg>
      ),
    },
    {
      label: "Statistics",
      path: "/statistics",
      icon: (
        <svg className="w-[22px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 17 9 8l4 5 3-4 5 8" />
        </svg>
      ),
    },
    {
      label: "Settings",
      path: "/settings",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.36a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.64 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.64 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.64 1.7 1.7 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.36 9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#fff8f7] border-r border-[#e6bdb8] flex flex-col justify-between py-6 z-20">
      <div>
        <div className="px-6 flex flex-col items-center text-center pb-8">
          <div className="w-16 h-16 rounded-xl bg-[#ffe2de] border border-[#e6bdb8] flex items-center justify-center text-2xl mb-4">
            {roleEmoji}
          </div>
          <p className="text-[20px] leading-7 font-semibold text-[#b70011]">{userTitle}</p>
          <p className="text-[14px] leading-6 text-[#5c403c]">{user?.role || "Senior Controller"}</p>
        </div>
        <nav className="px-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded text-[14px] font-semibold tracking-[0.14px] transition-colors ${
                  isActive
                    ? "bg-[#dc2626]/10 border-r-4 border-[#b70011] text-[#b70011]"
                    : "text-[#5c403c] hover:bg-[#fff0ee]"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-6 flex flex-col gap-3">
        {user?.role === "Ambulance" && (
          <button
            onClick={() => navigate("/ambulance/dashboard")}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#dc2626] hover:bg-[#c31f1f] rounded text-white text-[14px] font-bold tracking-[0.7px] uppercase shadow-sm transition-colors"
          >
            <svg className="w-4 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2 2 20h20L12 2Z" />
            </svg>
            New Emergency Trip
          </button>
        )}
        <button
          onClick={logout}
          className="w-full py-2.5 bg-[#5c403c]/10 hover:bg-[#5c403c]/20 text-[#5c403c] text-[13px] font-semibold rounded transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
