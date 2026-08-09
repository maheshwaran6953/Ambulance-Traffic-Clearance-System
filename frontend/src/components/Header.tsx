import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

interface HeaderProps {
  showSearch?: boolean;
}

interface NotificationItem {
  id: string;
  title: string;
  time: string;
  type: "emergency" | "clearance" | "info";
  read: boolean;
}

export function Header({ showSearch = false }: HeaderProps) {
  const { user } = useAuth();
  const roleEmoji = user?.role === "Ambulance" ? "🚑" : user?.role === "Police" ? "👮" : "🧑💼";

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "Signal Junction A cleared for Emergency Vehicle KA-01-EQ-9901",
      time: "2 mins ago",
      type: "clearance",
      read: false,
    },
    {
      id: "2",
      title: "New Emergency Code 3 Broadcast from Central Hospital to General ER",
      time: "5 mins ago",
      type: "emergency",
      read: false,
    },
    {
      id: "3",
      title: "Inspector Anil marked On Duty at Junction 42",
      time: "12 mins ago",
      type: "info",
      read: false,
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [showAlertsOnly, setShowAlertsOnly] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifs = showAlertsOnly
    ? notifications.filter((n) => n.type === "emergency")
    : notifications;

  return (
    <header className="h-16 bg-[#fff8f7] border-b border-[#e6bdb8] shadow-sm flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center flex-1 min-w-0">
        <h2 className="text-[24px] md:text-[28px] leading-[34px] font-black text-[#b70011] whitespace-nowrap pr-8">
          Ambulance Traffic Clearance System
        </h2>
        {showSearch && (
          <div className="relative flex-1 max-w-[448px] hidden md:block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c403c]">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              placeholder="Search trips, officers, routes..."
              className="w-full pl-[41px] pr-4 py-[9px] bg-[#fff0ee] border border-[#e6bdb8] rounded text-[15px] placeholder-[#5c403c] focus:outline-none focus:ring-1 focus:ring-[#b70011]"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pl-4 relative">
        {/* Bell Notifications Toggle */}
        <button
          onClick={() => {
            setShowAlertsOnly(false);
            setIsOpen(!isOpen);
          }}
          className="relative p-2 rounded-xl hover:bg-[#fff0ee] transition-colors"
          title="Notifications"
        >
          <svg className="w-5 h-5 text-[#5c403c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#ba1a1a] text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Emergency Alert Icon Toggle */}
        <button
          onClick={() => {
            setShowAlertsOnly(true);
            setIsOpen(true);
          }}
          className="p-2 rounded-xl hover:bg-[#fff0ee] transition-colors text-[#dc2626]"
          title="Emergency Alerts"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2 2 20h20L12 2Z" />
            <path d="M12 9v5" /><path d="M12 17h.01" />
          </svg>
        </button>

        {/* Role Icon */}
        <div className="w-9 h-9 rounded-xl border border-[#e6bdb8] bg-[#ffe2de] flex items-center justify-center text-base">
          {roleEmoji}
        </div>

        {/* Notification Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 top-14 w-80 sm:w-96 bg-white border border-[#e6bdb8] rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#fff0ee] border-b border-[#e6bdb8] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[14px] text-[#281715]">
                  {showAlertsOnly ? "Emergency Alerts" : "System Notifications"}
                </span>
                {unreadCount > 0 && (
                  <span className="bg-[#b70011] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[12px] text-[#b70011] font-semibold hover:underline"
                  >
                    Mark read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-[#5c403c] hover:text-[#281715] p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-[#e6bdb8]">
              {filteredNotifs.length > 0 ? (
                filteredNotifs.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 flex items-start justify-between gap-3 transition-colors ${
                      !n.read ? "bg-[#fff8f7]" : "hover:bg-[#fff0ee]/50"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-base pt-0.5">
                        {n.type === "emergency" ? "🚨" : n.type === "clearance" ? "🟢" : "ℹ️"}
                      </span>
                      <div>
                        <p className={`text-[13px] leading-4 text-[#281715] ${!n.read ? "font-bold" : "font-medium"}`}>
                          {n.title}
                        </p>
                        <span className="mono text-[11px] text-[#5c403c] pt-1 block">{n.time}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeNotification(n.id)}
                      className="text-[#5c403c] hover:text-[#b70011] text-xs p-1"
                      title="Dismiss"
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-[#5c403c] text-[13px] italic">
                  No notifications to display.
                </div>
              )}
            </div>

            <div className="bg-[#fff8f7] border-t border-[#e6bdb8] px-4 py-2.5 text-center">
              <span className="text-[12px] text-[#5c403c] font-medium">Real-Time SignalR Notification Feed Active</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
