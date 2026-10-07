import { useState, useEffect, useRef } from "react";
import { FaBell, FaUserShield, FaWifi, FaClock, FaCheckCircle } from "react-icons/fa";

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "Suspicious EDR Detection",
    desc: "Unsigned binary execution detected in staging subnet",
    time: "2m ago",
    severity: "critical",
  },
  {
    id: 2,
    title: "Firewall Rule Updated",
    desc: "Blacklisted 14 high-risk IP ranges at perimeter gateway",
    time: "15m ago",
    severity: "info",
  },
  {
    id: 3,
    title: "Scheduled Backup Success",
    desc: "Air-gapped database snapshot validated successfully",
    time: "1h ago",
    severity: "success",
  },
];

function Navbar() {
  const [useUTC, setUseUTC] = useState(false);
  const [time, setTime] = useState("");
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        useUTC
          ? now.toUTCString().slice(17, 25) + " UTC"
          : now.toLocaleTimeString()
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [useUTC]);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.length;

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <header className="navbar" role="banner">
      <div className="nav-title-group">
        <h1>Security Operations Center</h1>
        <p>Monitor, Analyze & Communicate Security Incidents</p>
      </div>

      <div className="nav-right">
        <button
          type="button"
          className="nav-time-badge"
          onClick={() => setUseUTC(!useUTC)}
          title={`Click to switch to ${useUTC ? "Local Time" : "UTC Time"}`}
          aria-label={`Current time: ${time}. Click to toggle timezone.`}
        >
          <FaClock aria-hidden="true" />
          <span>{time}</span>
        </button>

        <div className="nav-live-pill" role="status" aria-label="System status: live">
          <FaWifi className="pulse-icon" aria-hidden="true" />
          <span>SOC FEED: LIVE</span>
        </div>

        {/* Notifications Popover */}
        <div className="notif-container" ref={notifRef}>
          <button
            type="button"
            className="nav-icon-badge-wrapper"
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            aria-expanded={showNotifMenu}
            aria-haspopup="true"
            aria-label={`${unreadCount} alerts. Click to toggle notification center.`}
            title={`${unreadCount} Unacknowledged Alerts`}
          >
            <FaBell className="nav-icon" aria-hidden="true" />
            {unreadCount > 0 && <span className="badge-bubble">{unreadCount}</span>}
          </button>

          {showNotifMenu && (
            <div className="notif-dropdown glass-card fade-in" role="dialog" aria-label="Alerts">
              <div className="notif-dropdown-header">
                <h3>SOC Alerts ({unreadCount})</h3>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={clearNotifications}
                    className="notif-clear-btn"
                    aria-label="Clear all notifications"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="notif-dropdown-body">
                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <FaCheckCircle className="check-all-icon" aria-hidden="true" />
                    <p>All clear. No active alerts.</p>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div key={item.id} className={`notif-item sev-${item.severity}`}>
                      <div className="notif-item-top">
                        <strong className="notif-item-title">{item.title}</strong>
                        <span className="notif-item-time">{item.time}</span>
                      </div>
                      <p className="notif-item-desc">{item.desc}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="profile" role="region" aria-label="Analyst Profile">
          <FaUserShield className="profile-icon" aria-hidden="true" />
          <div>
            <h4>Lead SecOps Analyst</h4>
            <span className="online-indicator">● Active Session</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;