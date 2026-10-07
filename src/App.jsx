import { useState } from "react";
import "./App.css";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import DashboardCards from "./components/DashboardCards";
import IncidentForm from "./components/IncidentForm";
import IncidentReport from "./components/IncidentReport";

import { FaShieldAlt } from "react-icons/fa";

function App() {
  const [reportData, setReportData] = useState(null);
  const [reportCount, setReportCount] = useState(154);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleGenerateReport = (data) => {
    setReportData(data);
    setReportCount((prev) => prev + 1);
    showToast(`Executive report generated for ${data.company || "incident"}`, "success");
    setTimeout(() => {
      document.getElementById("incident-report-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <Navbar />

        {/* Global SOC Toast Notification */}
        {toast && (
          <div
            className={`soc-toast-banner toast-${toast.type} fade-in`}
            role="status"
            aria-live="polite"
          >
            <span className="toast-dot" aria-hidden="true">●</span>
            <span className="toast-msg">{toast.message}</span>
            <button
              type="button"
              className="toast-dismiss"
              onClick={() => setToast(null)}
              aria-label="Dismiss toast notification"
            >
              ×
            </button>
          </div>
        )}

        <section className="hero fade-in">
          <div className="hero-text">
            <h1>SecureOps AI</h1>

            <p>
              AI-powered Enterprise Security Operations Center for generating
              executive-ready incident reports, SOC notifications and security
              communication in seconds.
            </p>

            <div className="hero-buttons">
              <button
                className="primary-btn"
                onClick={() => {
                  document
                    .getElementById("incident-form-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Generate Report
              </button>

              <button
                className="secondary-btn"
                onClick={() => {
                  document
                    .getElementById("dashboard-metrics-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                View Dashboard
              </button>
            </div>
          </div>

          <div className="hero-graphic">
            <div className="hero-circle">
              <FaShieldAlt />
            </div>
          </div>
        </section>

        <DashboardCards reportCount={reportCount} />

        <div className="form-grid">
          <IncidentForm
            onGenerate={handleGenerateReport}
            onNotify={showToast}
          />

          <IncidentReport
            reportData={reportData}
            onNotify={showToast}
          />
        </div>
      </main>
    </div>
  );
}
export default App;