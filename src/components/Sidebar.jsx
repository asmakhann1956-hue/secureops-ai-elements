import { useState } from "react";
import {
  FaShieldAlt,
  FaTachometerAlt,
  FaExclamationTriangle,
  FaFileAlt,
  FaEnvelope,
  FaHistory,
  FaCog,
  FaCircle,
} from "react-icons/fa";

function Sidebar() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [showSettings, setShowSettings] = useState(false);
  const [classification, setClassification] = useState("TLP:AMBER (Restricted)");
  const [autoMitre, setAutoMitre] = useState(true);

  const handleNavClick = (tab, targetId) => {
    setActiveTab(tab);
    if (tab === "settings") {
      setShowSettings(true);
      return;
    }
    if (targetId) {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <aside className="sidebar" role="navigation" aria-label="Main Navigation">
        <div>
          {/* ================= LOGO ================= */}
          <div className="logo">
            <h2>
              <FaShieldAlt
                style={{
                  marginRight: "10px",
                  color: "#22d3ee",
                }}
                aria-hidden="true"
              />
              SecureOps AI
            </h2>
            <p>Enterprise Security Operations Center</p>
          </div>

          {/* ================= MENU ================= */}
          <nav aria-label="SOC Navigation Menu">
            <button
              type="button"
              className={`menu-item ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => handleNavClick("dashboard", "dashboard-metrics-section")}
              aria-label="Navigate to Dashboard Metrics"
            >
              <FaTachometerAlt aria-hidden="true" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              className={`menu-item ${activeTab === "incidents" ? "active" : ""}`}
              onClick={() => handleNavClick("incidents", "incident-form-section")}
              aria-label="Navigate to Incident Generator Form"
            >
              <FaExclamationTriangle aria-hidden="true" />
              <span>New Incident</span>
            </button>

            <button
              type="button"
              className={`menu-item ${activeTab === "reports" ? "active" : ""}`}
              onClick={() => handleNavClick("reports", "incident-report-section")}
              aria-label="Navigate to Incident Report"
            >
              <FaFileAlt aria-hidden="true" />
              <span>Incident Report</span>
            </button>

            <button
              type="button"
              className={`menu-item ${activeTab === "email" ? "active" : ""}`}
              onClick={() => handleNavClick("email", "incident-report-section")}
              aria-label="Navigate to Stakeholder Broadcast Preview"
            >
              <FaEnvelope aria-hidden="true" />
              <span>Broadcast Alert</span>
            </button>

            <button
              type="button"
              className={`menu-item ${activeTab === "audit" ? "active" : ""}`}
              onClick={() => handleNavClick("audit", "incident-report-section")}
              aria-label="Navigate to Incident Timeline Logs"
            >
              <FaHistory aria-hidden="true" />
              <span>Timeline Logs</span>
            </button>

            <button
              type="button"
              className={`menu-item ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => handleNavClick("settings", null)}
              aria-label="Open SOC Settings"
            >
              <FaCog aria-hidden="true" />
              <span>Settings</span>
            </button>
          </nav>

        {/* ================= LIVE SECURITY ================= */}

        <div className="sidebar-status">

          <h4>Live Security</h4>

          <div className="status-item">
            <span>🟢 AI Engine</span>
            <strong>Online</strong>
          </div>

          <div className="status-item">
            <span>🟢 Threat Feed</span>
            <strong>Connected</strong>
          </div>

          <div className="status-item">
            <span>🟢 Mail Gateway</span>
            <strong>Healthy</strong>
          </div>

          <div className="status-item">
            <span>🟡 Open Incidents</span>
            <strong>24</strong>
          </div>

          <div className="status-item">
            <span>🔴 Critical Alerts</span>
            <strong>6</strong>
          </div>

        </div>
                {/* ================= TODAY'S STATS ================= */}

        <div className="sidebar-stats">

          <div className="mini-card">
            <h5>98.7%</h5>
            <span>AI Accuracy</span>
          </div>

          <div className="mini-card">
            <h5>16</h5>
            <span>Reports</span>
          </div>

          <div className="mini-card">
            <h5>42</h5>
            <span>Threats</span>
          </div>

        </div>

      </div>

      {/* ================= FOOTER ================= */}

      <div className="sidebar-footer">

        <h4>SecureOps AI</h4>

        <p className="online">
          <FaCircle
            style={{
              fontSize: "10px",
              marginRight: "8px",
            }}
          />
          System Operational
        </p>

        <small
          style={{
            display: "block",
            marginTop: "14px",
            color: "#94a3b8",
            lineHeight: "1.8",
          }}
        >
          Version 1.0.0
          <br />
          Enterprise Edition
        </small>

      </div>
    </aside>

    {/* Settings Modal */}
    {showSettings && (
      <div
        className="modal-backdrop fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-heading"
      >
        <div className="settings-modal glass-card">
          <div className="modal-header">
            <h3 id="settings-heading">SOC Operational Preferences</h3>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setShowSettings(false)}
              aria-label="Close Settings modal"
            >
              ×
            </button>
          </div>

          <div className="modal-body">
            <div className="setting-row">
              <label htmlFor="classification-select">Default TLP Classification:</label>
              <select
                id="classification-select"
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
              >
                <option value="TLP:RED (Non-Shareable)">🔴 TLP:RED (Non-Shareable)</option>
                <option value="TLP:AMBER (Restricted)">🟠 TLP:AMBER (Restricted)</option>
                <option value="TLP:GREEN (Community)">🟢 TLP:GREEN (Community)</option>
                <option value="TLP:CLEAR (Public)">⚪ TLP:CLEAR (Public)</option>
              </select>
            </div>

            <div className="setting-row-checkbox">
              <input
                id="auto-mitre-check"
                type="checkbox"
                checked={autoMitre}
                onChange={(e) => setAutoMitre(e.target.checked)}
              />
              <label htmlFor="auto-mitre-check">Automate MITRE ATT&CK Mapping</label>
            </div>

            <div className="setting-info-box">
              <p>Telemetry Engine: <strong>SecureOps AI Enterprise</strong></p>
              <p>Standards Framework: <strong>NIST SP 800-61 & MITRE ATT&CK v14.1</strong></p>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="primary-btn modal-done-btn"
              onClick={() => setShowSettings(false)}
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}

export default Sidebar;