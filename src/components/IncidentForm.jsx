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
} from "react-icons/fa";

function IncidentForm({ onGenerate })  {
  const [formData, setFormData] = useState({
    company: "",
    reporter: "",
    email: "",
    incidentType: "",
    severity: "",
    system: "",
    date: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGenerate = (e) => {
    e.preventDefault();

   onGenerate(formData);
  };

  return (
    <div className="incident-form glass-card">

      <h2>Generate Incident Report</h2>

      <form onSubmit={handleGenerate}>
                {/* ================= COMPANY ================= */}

        <div className="input-group">
          <label>
            <FaBuilding /> Company Name
          </label>

          <input
            type="text"
            name="company"
            placeholder="e.g. ABC Bank Ltd."
            value={formData.company}
            onChange={handleChange}
            required
          />
        </div>

        {/* ================= REPORTER ================= */}

        <div className="input-group">
          <label>
            <FaUser /> Reporter Name
          </label>

          <input
            type="text"
            name="reporter"
            placeholder="Your Name"
            value={formData.reporter}
            onChange={handleChange}
            required
          />
        </div>

        {/* ================= EMAIL ================= */}

        <div className="input-group">
          <label>
            <FaEnvelope /> Reporter Email
          </label>

          <input
            type="email"
            name="email"
            placeholder="security@company.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
                {/* ================= INCIDENT TYPE ================= */}

        <div className="input-group">
          <label>
            <FaExclamationTriangle /> Incident Type
          </label>

          <select
            name="incidentType"
            value={formData.incidentType}
            onChange={handleChange}
            required
          >
            <option value="">Select Incident</option>
            <option value="Phishing Attack">Phishing Attack</option>
            <option value="Ransomware">Ransomware</option>
            <option value="Malware Infection">Malware Infection</option>
            <option value="Data Breach">Data Breach</option>
            <option value="DDoS Attack">DDoS Attack</option>
            <option value="Insider Threat">Insider Threat</option>
            <option value="Unauthorized Access">Unauthorized Access</option>
          </select>
        </div>

        {/* ================= SEVERITY ================= */}

        <div className="input-group">
          <label>Severity</label>

          <select
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            required
          >
            <option value="">Select Severity</option>
            <option value="Critical">🔴 Critical</option>
            <option value="High">🟠 High</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Low">🟢 Low</option>
          </select>
        </div>

        {/* ================= AFFECTED SYSTEM ================= */}

        <div className="input-group">
          <label>
            <FaServer /> Affected System
          </label>

          <input
            type="text"
            name="system"
            placeholder="e.g. Finance Server, Email Gateway"
            value={formData.system}
            onChange={handleChange}
            required
          />
        </div>

        {/* ================= INCIDENT DATE ================= */}

        <div className="input-group">
          <label>
            <FaCalendarAlt /> Incident Date
          </label>

          <input
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
                {/* ================= DESCRIPTION ================= */}

        <div className="input-group">
          <label>
            <FaFileAlt /> Incident Description
          </label>

          <textarea
            name="description"
            rows="6"
            placeholder="Describe what happened, affected users, business impact, actions taken, indicators of compromise, etc."
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        {/* ================= GENERATE BUTTON ================= */}

        <button type="submit" className="generate-btn">
          <FaRobot />
          Generate AI Report
        </button>

      </form>

    </div>
  );
}

export default IncidentForm;
const handleGenerate = (e) => {
  e.preventDefault();

  console.log(formData);

  onGenerate(formData);
};