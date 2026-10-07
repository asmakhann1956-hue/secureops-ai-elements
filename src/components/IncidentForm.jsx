import { useState } from "react";
import {
  FaBuilding,
  FaUser,
  FaEnvelope,
  FaExclamationTriangle,
  FaServer,
  FaCalendarAlt,
  FaFileAlt,
  FaRobot,
  FaMagic,
  FaUndo,
} from "react-icons/fa";

const SAMPLE_INCIDENTS = [
  {
    company: "Apex Financial Systems",
    reporter: "Sarah Vance (Senior SOC Lead)",
    email: "security-ops@apexfinancial.com",
    incidentType: "Ransomware",
    severity: "Critical",
    system: "Primary Oracle DB & Active Directory Domain Controller",
    date: new Date().toISOString().slice(0, 16),
    description:
      "At 03:15 UTC, automated EDR triggered alerts for suspicious PowerShell executions followed by bulk file encryption using BlackCat/ALPHV variant extensions. Primary database volume unmounted and volume shadow copies deleted. Containment isolation initiated on VLAN 4.",
  },
  {
    company: "CloudVanguard Logistics",
    reporter: "David Miller (Incident Analyst)",
    email: "soc-triage@cloudvanguard.io",
    incidentType: "Phishing Attack",
    severity: "High",
    system: "Corporate Office 365 Tenant & Finance Mailboxes",
    date: new Date().toISOString().slice(0, 16),
    description:
      "Spear-phishing email masquerading as Microsoft Payroll Notification bypassed initial spam filters. Three accounts entered credentials into an adversary-in-the-middle (AitM) proxy page, bypassing MFA session cookies. Malicious OAuth app registration detected.",
  },
  {
    company: "HealthCore Medical Hub",
    reporter: "Elena Rostova (SecOps Specialist)",
    email: "infosec@healthcore.org",
    incidentType: "Data Breach",
    severity: "Critical",
    system: "Electronic Health Record (EHR) S3 Backup Repository",
    date: new Date().toISOString().slice(0, 16),
    description:
      "Anomalous outbound transfer of 48 GB encrypted archives detected originating from an internal staging IP to an unknown external endpoint. AWS CloudTrail logs indicate compromised IAM access key with elevated S3 read permissions.",
  },
];

function IncidentForm({ onGenerate, onNotify }) {
  const getInitialState = () => ({
    company: "",
    reporter: "",
    email: "",
    incidentType: "",
    severity: "",
    system: "",
    date: new Date().toISOString().slice(0, 16),
    description: "",
  });

  const [formData, setFormData] = useState(getInitialState);
  const [activeScenario, setActiveScenario] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    onGenerate(formData);
    if (onNotify) {
      onNotify(`Generated ${formData.severity} ${formData.incidentType} report`, "success");
    }
  };

  const handleLoadSample = (scenarioIndex = null) => {
    const sample =
      scenarioIndex !== null
        ? SAMPLE_INCIDENTS[scenarioIndex]
        : SAMPLE_INCIDENTS[Math.floor(Math.random() * SAMPLE_INCIDENTS.length)];

    setFormData({
      ...sample,
      date: new Date().toISOString().slice(0, 16),
    });
    setActiveScenario(`${sample.incidentType} (${sample.company})`);
    if (onNotify) {
      onNotify(`Loaded sample: ${sample.incidentType}`, "info");
    }
  };

  const handleReset = () => {
    setFormData(getInitialState());
    setActiveScenario("");
    if (onNotify) {
      onNotify("Form cleared", "info");
    }
  };

  const severityPillClass = formData.severity
    ? `preview-pill-${formData.severity.toLowerCase()}`
    : "";

  return (
    <section
      className="incident-form glass-card"
      id="incident-form-section"
      aria-labelledby="form-heading"
    >
      <div className="form-header-bar">
        <div>
          <h2 id="form-heading">Generate Incident Report</h2>
          <p className="form-subtitle">
            Provide incident parameters or load real-world sample telemetry.
          </p>
        </div>
        <div className="sample-actions-group">
          <button
            type="button"
            onClick={() => handleLoadSample()}
            className="sample-btn"
            title="Autofill form with realistic SOC incident telemetry"
            aria-label="Autofill sample incident data"
          >
            <FaMagic aria-hidden="true" /> Load Sample Data
          </button>
        </div>
      </div>

      {activeScenario && (
        <div className="scenario-pill-alert" role="status">
          <span>🎯 Scenario Loaded:</span>
          <strong>{activeScenario}</strong>
          <button
            type="button"
            onClick={() => setActiveScenario("")}
            className="pill-close"
            aria-label="Dismiss scenario pill"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleGenerate} noValidate={false}>
        {/* ================= COMPANY ================= */}
        <div className="input-group">
          <label htmlFor="company">
            <FaBuilding aria-hidden="true" /> Company Name
          </label>
          <input
            id="company"
            type="text"
            name="company"
            placeholder="e.g. Apex Financial Systems"
            value={formData.company}
            onChange={handleChange}
            required
            aria-required="true"
          />
        </div>

        {/* ================= REPORTER ================= */}
        <div className="input-group">
          <label htmlFor="reporter">
            <FaUser aria-hidden="true" /> Reporter Name
          </label>
          <input
            id="reporter"
            type="text"
            name="reporter"
            placeholder="e.g. Sarah Vance (SOC Lead)"
            value={formData.reporter}
            onChange={handleChange}
            required
            aria-required="true"
          />
        </div>

        {/* ================= EMAIL ================= */}
        <div className="input-group">
          <label htmlFor="email">
            <FaEnvelope aria-hidden="true" /> Reporter Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="security-ops@company.com"
            value={formData.email}
            onChange={handleChange}
            required
            aria-required="true"
          />
        </div>

        {/* ================= ROW: INCIDENT TYPE & SEVERITY ================= */}
        <div className="input-row-duo">
          <div className="input-group">
            <label htmlFor="incidentType">
              <FaExclamationTriangle aria-hidden="true" /> Incident Type
            </label>
            <select
              id="incidentType"
              name="incidentType"
              value={formData.incidentType}
              onChange={handleChange}
              required
              aria-required="true"
            >
              <option value="">Select Incident Type</option>
              <option value="Phishing Attack">Phishing Attack</option>
              <option value="Ransomware">Ransomware</option>
              <option value="Malware Infection">Malware Infection</option>
              <option value="Data Breach">Data Breach</option>
              <option value="DDoS Attack">DDoS Attack</option>
              <option value="Insider Threat">Insider Threat</option>
              <option value="Unauthorized Access">Unauthorized Access</option>
            </select>
          </div>

          <div className="input-group">
            <div className="label-with-preview">
              <label htmlFor="severity">Severity Level</label>
              {formData.severity && (
                <span className={`severity-preview-pill ${severityPillClass}`}>
                  {formData.severity}
                </span>
              )}
            </div>
            <select
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              required
              aria-required="true"
            >
              <option value="">Select Severity</option>
              <option value="Critical">🔴 Critical (P1)</option>
              <option value="High">🟠 High (P2)</option>
              <option value="Medium">🟡 Medium (P3)</option>
              <option value="Low">🟢 Low (P4)</option>
            </select>
          </div>
        </div>

        {/* ================= AFFECTED SYSTEM ================= */}
        <div className="input-group">
          <label htmlFor="system">
            <FaServer aria-hidden="true" /> Affected System / Host / Cloud Resource
          </label>
          <input
            id="system"
            type="text"
            name="system"
            placeholder="e.g. Finance Server Cluster, Domain Controller, AWS S3"
            value={formData.system}
            onChange={handleChange}
            required
            aria-required="true"
          />
        </div>

        {/* ================= INCIDENT DATE ================= */}
        <div className="input-group">
          <label htmlFor="date">
            <FaCalendarAlt aria-hidden="true" /> Incident Timestamp (UTC / Local)
          </label>
          <input
            id="date"
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            aria-required="true"
          />
        </div>

        {/* ================= DESCRIPTION ================= */}
        <div className="input-group">
          <div className="label-with-counter">
            <label htmlFor="description">
              <FaFileAlt aria-hidden="true" /> Incident Telemetry & Technical Summary
            </label>
            <span className="char-counter">
              {formData.description.length} chars
            </span>
          </div>
          <textarea
            id="description"
            name="description"
            rows="5"
            placeholder="Describe IoCs (IPs, hashes), affected accounts, attack progression, business impact, and containment actions..."
            value={formData.description}
            onChange={handleChange}
            required
            aria-required="true"
          />
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="form-button-group">
          <button
            type="submit"
            className="generate-btn"
            aria-label="Generate AI Incident Report"
          >
            <FaRobot aria-hidden="true" />
            Generate AI Report
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="reset-form-btn"
            title="Reset all form fields"
            aria-label="Reset form fields"
          >
            <FaUndo aria-hidden="true" /> Reset
          </button>
        </div>
      </form>
    </section>
  );
}

export default IncidentForm;