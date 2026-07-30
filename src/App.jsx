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

  const handleGenerateReport = (data) => {
    setReportData(data);
  };

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <Navbar />
                <section className="hero fade-in">
          <div className="hero-text">
            <h1>SecureOps AI</h1>

            <p>
              AI-powered Enterprise Security Operations Center for generating
              executive-ready incident reports, SOC notifications and security
              communication in seconds.
            </p>

            <div className="hero-buttons">
              <button className="primary-btn">
                Generate Report
              </button>

              <button className="secondary-btn">
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

        <DashboardCards />

        <div className="form-grid">

          <IncidentForm
            onGenerate={handleGenerateReport}
          />

          <IncidentReport
            reportData={reportData}
          />

        </div>
              </main>
    </div>
  );
}
export default App;