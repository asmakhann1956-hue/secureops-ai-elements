import { useState } from "react";
import {
  FaFileAlt,
  FaShieldAlt,
  FaEnvelope,
  FaDownload,
  FaCopy,
  FaCheck,
  FaExclamationTriangle,
  FaClock,
  FaTasks,
  FaWrench,
  FaBullseye,
  FaInfoCircle,
  FaCode,
  FaPrint,
} from "react-icons/fa";
import jsPDF from "jspdf";
import emailjs from "@emailjs/browser";

// Dynamic MITRE ATT&CK & Playbook mapping based on Incident Type
const INCIDENT_INTELLIGENCE = {
  "Phishing Attack": {
    tactics: [
      { id: "T1566.001", name: "Spearphishing Attachment" },
      { id: "T1566.002", name: "Spearphishing Link" },
      { id: "T1556", name: "Modify Authentication Process" },
      { id: "T1539", name: "Steal Web Session Cookie" },
    ],
    containment: [
      "Quarantine malicious messages globally across all inbound mailbox queues.",
      "Revoke compromised Azure AD / Okta session tokens and force password + MFA rotation.",
      "Block malicious sender domains, sender IPs, and credential harvest URLs at boundary firewalls.",
      "Review mailbox forwarding and Inbox auto-deletion rules created within the last 48 hours.",
    ],
    remediation: [
      "Submit sender infrastructure to threat feeds (VirusTotal, AlienVault OTX, AbuseIPDB).",
      "Trigger targeted micro-training for recipients exposed to phishing payloads.",
      "Deploy FIDO2 / Passkey phishing-resistant MFA across the affected operational tier.",
    ],
  },
  Ransomware: {
    tactics: [
      { id: "T1486", name: "Data Encrypted for Impact" },
      { id: "T1490", name: "Inhibit System Recovery" },
      { id: "T1059.001", name: "PowerShell Execution" },
      { id: "T1021.002", name: "SMB/Windows Admin Shares" },
    ],
    containment: [
      "Sever network connection (VLAN quarantine / physical un-plugging) of affected endpoints.",
      "Disable lateral movement protocols (SMBv1/v2, RDP port 3389, WinRM) at switch ACLs.",
      "Halt automated cloud storage synchronization to prevent corrupted sync loops.",
      "Capture RAM snapshots and forensic disk images prior to system state destruction.",
    ],
    remediation: [
      "Verify integrity of immutable off-site backups and validate air-gapped snapshots.",
      "Re-image impacted endpoints from clean gold master baseline builds.",
      "Execute deep-dive credential audit across Enterprise and Domain Admins.",
    ],
  },
  "Malware Infection": {
    tactics: [
      { id: "T1204", name: "User Execution" },
      { id: "T1055", name: "Process Injection" },
      { id: "T1547", name: "Boot or Logon Autostart" },
      { id: "T1071.001", name: "Web Protocols C2" },
    ],
    containment: [
      "Isolate infected host via EDR isolation command.",
      "Kill unauthorized parent and spawned child processes matching malicious hashes.",
      "Blacklist C2 server domain and fallback IP ranges at perimeter proxies.",
      "Prevent persistence execution by scrubbing scheduled tasks and registry Run keys.",
    ],
    remediation: [
      "Perform thorough full-disk rootkit scans across all adjoining subnet nodes.",
      "Upgrade endpoint protection sensor definitions and enable behavior blockers.",
      "Audit software distribution servers for unauthorized binary tampered files.",
    ],
  },
  "Data Breach": {
    tactics: [
      { id: "T1041", name: "Exfiltration Over C2 Channel" },
      { id: "T1530", name: "Data from Cloud Storage Object" },
      { id: "T1078", name: "Valid Accounts" },
      { id: "T1020", name: "Automated Exfiltration" },
    ],
    containment: [
      "Revoke compromised API keys, IAM credentials, and service principals immediately.",
      "Restrict outbound egress bandwidth and block targeted destination IPs at edge routers.",
      "Enable heightened SIEM log streaming on all databases and cloud storage buckets.",
      "Freeze write access to audit trail repositories to safeguard evidentiary chain of custody.",
    ],
    remediation: [
      "Quantify scope of impacted Personally Identifiable Information (PII) or secrets.",
      "Initiate legal, regulatory compliance (GDPR/HIPAA/SEC), and breach notification workflows.",
      "Implement DLP (Data Loss Prevention) controls and strict cloud object access control lists.",
    ],
  },
  "DDoS Attack": {
    tactics: [
      { id: "T1498.001", name: "Direct Network Flood" },
      { id: "T1499.003", name: "Endpoint Denial: Application Exhaustion" },
    ],
    containment: [
      "Engage Cloudflare / AWS Shield / Akamai DDoS scrubbing center mitigation pipelines.",
      "Apply geo-blocking and rate-limiting rules for anomalous SYN, UDP, or HTTP GET bursts.",
      "Switch web services to aggressive cache / 'Under Attack' JS challenge mode.",
      "Coordinate with upstream Tier 1 Transit ISPs to blackhole volumetric UDP flood sources.",
    ],
    remediation: [
      "Conduct post-incident origin IP disclosure audit to prevent direct backend bypasses.",
      "Scale horizontal auto-scaling ingress instances and configure dynamic caching headers.",
      "Refine synthetic traffic alerting thresholds to detect slowloris or low-and-slow probes.",
    ],
  },
};

const DEFAULT_INTELLIGENCE = {
  tactics: [
    { id: "T1078", name: "Valid Accounts" },
    { id: "T1082", name: "System Information Discovery" },
    { id: "T1046", name: "Network Service Discovery" },
  ],
  containment: [
    "Isolate identified affected systems and hosts from the enterprise network.",
    "Block suspect inbound and outbound IP addresses, domains, and ports at the firewall.",
    "Disable or suspend user credentials and service accounts linked to the incident.",
    "Preserve volatility memory captures and immutable system event logs for forensics.",
    "Alert on-duty SOC shift leads and escalate to the Incident Command team.",
  ],
  remediation: [
    "Rebuild and patch affected host systems using verified clean baseline images.",
    "Enforce mandatory credential resets across all affected directories and resources.",
    "Conduct enterprise-wide IOC hunt to ensure absence of secondary persistence.",
    "Review detection coverage and write updated Sigma / SIEM correlation rules.",
  ],
};

function IncidentReport({ reportData, onNotify }) {
  const [copied, setCopied] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  const intelligence =
    (reportData?.incidentType && INCIDENT_INTELLIGENCE[reportData.incidentType]) ||
    DEFAULT_INTELLIGENCE;

  // Format dynamic timeline
  const incidentDateObj = reportData?.date ? new Date(reportData.date) : new Date();
  const formatTimeOffset = (minutes) => {
    const d = new Date(incidentDateObj.getTime() + minutes * 60000);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const dynamicTimeline = [
    {
      time: formatTimeOffset(0),
      label: "Initial Anomaly Detected",
      desc: `Automated detection triggered on ${reportData?.system || "monitored system"}.`,
    },
    {
      time: formatTimeOffset(7),
      label: "SOC Triage & Escalation",
      desc: `Alert confirmed as ${reportData?.severity || "Active"} severity by ${reportData?.reporter || "SOC Analyst"}.`,
    },
    {
      time: formatTimeOffset(25),
      label: "Network & Asset Isolation",
      desc: `Containment policy applied to isolate ${reportData?.system || "assets"} from VLAN.`,
    },
    {
      time: formatTimeOffset(55),
      label: "Forensic Evidence Acquisition",
      desc: "Live memory dumps and event log bundles exported to secured forensics sandbox.",
    },
    {
      time: formatTimeOffset(90),
      label: "Interim Executive Briefing",
      desc: "Preliminary impact matrix compiled and remediation playbooks dispatched.",
    },
  ];

  // ================= COPY TO CLIPBOARD =================
  const copyReportText = async () => {
    if (!reportData) return;
    const text = `=====================================================
SECUREOPS AI - CYBERSECURITY INCIDENT REPORT
=====================================================
Company:          ${reportData.company || "N/A"}
Reporter:         ${reportData.reporter || "N/A"} (${reportData.email || "N/A"})
Incident Type:    ${reportData.incidentType || "N/A"}
Severity:         ${reportData.severity || "N/A"}
Affected System:  ${reportData.system || "N/A"}
Timestamp:        ${reportData.date || new Date().toISOString()}
Classification:   CONFIDENTIAL - SOC TACTICAL
=====================================================
EXECUTIVE SUMMARY:
A cybersecurity incident categorized as ${reportData.incidentType} with ${reportData.severity} severity was detected affecting ${reportData.system}. Incident response playbooks were executed to mitigate business interruption and protect data integrity.

TECHNICAL TELEMETRY & DESCRIPTION:
${reportData.description || "No technical description recorded."}

CONTAINMENT ACTIONS:
${intelligence.containment.map((item, idx) => `[${idx + 1}] ${item}`).join("\n")}

RECOMMENDATIONS & REMEDIATION:
${intelligence.remediation.map((item, idx) => `[${idx + 1}] ${item}`).join("\n")}
=====================================================
Generated by SecureOps AI Operations Center
Date: ${new Date().toLocaleString()}
`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (onNotify) {
        onNotify("Report copied to clipboard", "success");
      }
      setTimeout(() => setCopied(false), 3000);
    } catch {
      alert("Failed to copy to clipboard");
    }
  };

  // ================= EXPORT JSON (STIX) =================
  const exportJSON = () => {
    if (!reportData) return;
    const exportPayload = {
      spec_version: "2.1",
      type: "incident-report",
      id: `incident--${Date.now()}`,
      created: new Date().toISOString(),
      company: reportData.company || "N/A",
      reporter: {
        name: reportData.reporter || "N/A",
        email: reportData.email || "N/A",
      },
      incident_type: reportData.incidentType || "Security Incident",
      severity: reportData.severity || "Medium",
      affected_system: reportData.system || "N/A",
      incident_date: reportData.date || new Date().toISOString(),
      description: reportData.description || "",
      mitre_attack_techniques: intelligence.tactics,
      containment_playbook: intelligence.containment,
      remediation_recommendations: intelligence.remediation,
      classification: "TLP:AMBER - CONFIDENTIAL",
      generated_by: "SecureOps AI Operations Center",
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SecureOps-${(reportData.incidentType || "Incident").replace(/\s+/g, "_")}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (onNotify) {
      onNotify("STIX/JSON telemetry exported", "success");
    }
  };

  // ================= PRINT REPORT =================
  const handlePrint = () => {
    window.print();
  };

  // ================= DOWNLOAD FORMATTED PDF =================
  const downloadPDF = () => {
    if (!reportData) return;
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Top Header Banner
    pdf.setFillColor(15, 23, 42); // Dark Navy #0f172a
    pdf.rect(0, 0, pageWidth, 32, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("SECUREOPS AI | INCIDENT REPORT", 16, 18);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(148, 163, 184);
    pdf.text("AUTOMATED CYBERSECURITY INCIDENT RESPONSE & SOC BRIEFING", 16, 25);

    // Severity Badge
    const sev = (reportData.severity || "MEDIUM").toUpperCase();
    let badgeColor = [59, 130, 246]; // Blue
    if (sev.includes("CRITICAL")) badgeColor = [239, 68, 68]; // Red
    else if (sev.includes("HIGH")) badgeColor = [249, 115, 22]; // Orange
    else if (sev.includes("LOW")) badgeColor = [16, 185, 129]; // Green

    pdf.setFillColor(...badgeColor);
    pdf.roundedRect(pageWidth - 52, 10, 38, 12, 2, 2, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text(`SEV: ${sev}`, pageWidth - 49, 18);

    // Section 1: Metadata Grid
    let yPos = 42;
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(14, yPos, pageWidth - 28, 48, 2, 2, "FD");

    pdf.setFontSize(10);
    pdf.setTextColor(51, 65, 85);

    const leftCol = [
      ["Company", reportData.company || "N/A"],
      ["Reporter", reportData.reporter || "N/A"],
      ["Contact Email", reportData.email || "N/A"],
    ];

    const rightCol = [
      ["Incident Type", reportData.incidentType || "N/A"],
      ["Target Resource", reportData.system || "N/A"],
      ["Date / Time", reportData.date ? new Date(reportData.date).toLocaleString() : "N/A"],
    ];

    leftCol.forEach(([k, v], idx) => {
      pdf.setFont("helvetica", "bold");
      pdf.text(`${k}:`, 18, yPos + 10 + idx * 13);
      pdf.setFont("helvetica", "normal");
      pdf.text(String(v), 50, yPos + 10 + idx * 13);
    });

    rightCol.forEach(([k, v], idx) => {
      pdf.setFont("helvetica", "bold");
      pdf.text(`${k}:`, 110, yPos + 10 + idx * 13);
      pdf.setFont("helvetica", "normal");
      const truncatedVal = pdf.splitTextToSize(String(v), 80);
      pdf.text(truncatedVal[0] || "", 145, yPos + 10 + idx * 13);
    });

    // Section 2: Executive Summary & Description
    yPos += 58;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(15, 23, 42);
    pdf.text("1. Incident Summary & Technical Telemetry", 16, yPos);

    yPos += 5;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.5);
    pdf.setTextColor(71, 85, 105);

    const descLines = pdf.splitTextToSize(
      reportData.description || "No specific technical telemetry provided.",
      pageWidth - 32
    );
    pdf.text(descLines, 16, yPos);
    yPos += descLines.length * 5 + 8;

    // Section 3: Containment Actions
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(15, 23, 42);
    pdf.text("2. Containment Playbook Actions Executed", 16, yPos);

    yPos += 6;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(71, 85, 105);

    intelligence.containment.slice(0, 4).forEach((item) => {
      pdf.text(`[x]  ${item}`, 18, yPos);
      yPos += 5.5;
    });

    yPos += 6;
    // Section 4: Security Recommendations
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(15, 23, 42);
    pdf.text("3. Recommended Remediation & Prevention", 16, yPos);

    yPos += 6;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(71, 85, 105);

    intelligence.remediation.slice(0, 4).forEach((item) => {
      pdf.text(`*  ${item}`, 18, yPos);
      yPos += 5.5;
    });

    // Footer
    const footerY = 285;
    pdf.setDrawColor(203, 213, 225);
    pdf.line(14, footerY - 4, pageWidth - 14, footerY - 4);

    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text(
      `Classification: CONFIDENTIAL | Generated by SecureOps AI on ${new Date().toLocaleString()}`,
      16,
      footerY
    );
    pdf.text("Page 1 of 1", pageWidth - 32, footerY);

    const filename = `SecureOps-Incident-${(reportData.incidentType || "Report").replace(
      /\s+/g,
      "_"
    )}-${Date.now()}.pdf`;
    pdf.save(filename);
    if (onNotify) {
      onNotify("Executive PDF report generated", "success");
    }
  };

  // ================= SEND EMAIL =================
  const sendEmail = async () => {
    if (!reportData) return;
    setSendingEmail(true);
    setEmailStatus(null);

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_hk77361";
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_fswmrwo";
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "YGVBX1L9aILCU6sCd";

    try {
      const templateParams = {
        company: reportData?.company || "N/A",
        reporter: reportData?.reporter || "N/A",
        email: reportData?.email || "N/A",
        incidentType: reportData?.incidentType || "Security Incident",
        severity: reportData?.severity || "High",
        system: reportData?.system || "Internal Systems",
        description: reportData?.description || "No description provided",
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      setEmailStatus({ type: "success", text: "Email notification dispatched successfully!" });
      if (onNotify) {
        onNotify("Stakeholder alert email dispatched", "success");
      }
    } catch (error) {
      console.error(error);
      setEmailStatus({
        type: "error",
        text: `Email delivery failed: ${error?.text || error?.message || "Check EmailJS setup"}`,
      });
      if (onNotify) {
        onNotify("Email dispatch failed - verify configuration", "error");
      }
    } finally {
      setSendingEmail(false);
      setTimeout(() => setEmailStatus(null), 5000);
    }
  };

  // ================= EMPTY STATE =================
  if (!reportData) {
    return (
      <section
        className="incident-report glass-card empty-report-card"
        id="incident-report-section"
        aria-labelledby="empty-report-heading"
      >
        <div className="empty-state-content">
          <div className="empty-icon-circle" aria-hidden="true">
            <FaShieldAlt />
          </div>
          <h3 id="empty-report-heading">Awaiting Incident Submission</h3>
          <p>
            Complete the form on the left or click <strong>Load Sample Data</strong> to generate
            an AI-powered executive report, MITRE ATT&CK mapping, containment checklist, and PDF
            export.
          </p>
          <div className="empty-state-badges">
            <span>✨ Automated Severity Classification</span>
            <span>🛡️ MITRE ATT&CK Tagging</span>
            <span>📄 Print-Ready Executive PDF</span>
          </div>
        </div>
      </section>
    );
  }

  const severityClass = (reportData.severity || "medium").toLowerCase();

  return (
    <section
      className="incident-report glass-card fade-in"
      id="incident-report-section"
      aria-labelledby="report-main-heading"
    >
      {/* ================= HEADER & ACTIONS ================= */}
      <div className="report-header">
        <div className="report-title-block">
          <h2 id="report-main-heading">
            <FaFileAlt aria-hidden="true" /> Incident Report
          </h2>
          <span className={`severity-badge badge-${severityClass}`}>
            {reportData.severity || "Medium"} Severity
          </span>
        </div>

        <div className="report-actions">
          <button
            className={`action-pill-btn copy-btn ${copied ? "copied" : ""}`}
            onClick={copyReportText}
            title="Copy full report as formatted text"
            aria-label="Copy report text to clipboard"
          >
            {copied ? <FaCheck aria-hidden="true" /> : <FaCopy aria-hidden="true" />}
            {copied ? "Copied!" : "Copy Report"}
          </button>

          <button
            className="action-pill-btn json-btn"
            onClick={exportJSON}
            title="Export incident telemetry as JSON / STIX format"
            aria-label="Export incident telemetry as JSON"
          >
            <FaCode aria-hidden="true" />
            JSON
          </button>

          <button
            className="action-pill-btn print-btn"
            onClick={handlePrint}
            title="Print executive briefing"
            aria-label="Print executive briefing"
          >
            <FaPrint aria-hidden="true" />
            Print
          </button>

          <button
            className="action-pill-btn email-btn"
            onClick={sendEmail}
            disabled={sendingEmail}
            title="Send email alert via EmailJS"
            aria-label="Send email notification"
          >
            <FaEnvelope aria-hidden="true" />
            {sendingEmail ? "Sending..." : "Send Email"}
          </button>

          <button
            className="action-pill-btn download-btn"
            onClick={downloadPDF}
            title="Download executive PDF"
            aria-label="Download executive PDF"
          >
            <FaDownload aria-hidden="true" />
            Download PDF
          </button>
        </div>
      </div>

      {emailStatus && (
        <div className={`status-alert ${emailStatus.type}`}>
          {emailStatus.type === "success" ? <FaCheck /> : <FaExclamationTriangle />}
          <span>{emailStatus.text}</span>
        </div>
      )}

      <div className="report-content">
        {/* ================= EXECUTIVE SUMMARY ================= */}
        <section className="report-section">
          <h3>
            <FaShieldAlt /> Executive Summary
          </h3>
          <p>
            A cybersecurity incident classified under{" "}
            <strong className="highlight-text">{reportData?.incidentType}</strong> has been
            triaged by SecureOps AI with a{" "}
            <span className={`severity-tag-inline tag-${severityClass}`}>
              {reportData?.severity}
            </span>{" "}
            impact rating. The primary asset affected is{" "}
            <strong>{reportData?.system || "Enterprise Infrastructure"}</strong> at{" "}
            <strong>{reportData?.company || "Organization"}</strong>. Active containment
            countermeasures have been triggered to limit lateral exposure and data exfiltration.
          </p>
        </section>

        {/* ================= INCIDENT DETAILS TABLE ================= */}
        <section className="report-section">
          <h3>
            <FaInfoCircle /> Incident Details
          </h3>
          <div className="table-wrapper">
            <table className="report-table">
              <tbody>
                <tr>
                  <td>Company Target</td>
                  <td>{reportData.company}</td>
                  <td>Target System / Resource</td>
                  <td>{reportData.system}</td>
                </tr>
                <tr>
                  <td>Incident Type</td>
                  <td>
                    <span className="type-pill">{reportData.incidentType}</span>
                  </td>
                  <td>Severity Tier</td>
                  <td>
                    <span className={`severity-pill pill-${severityClass}`}>
                      {reportData.severity}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Reporter Name</td>
                  <td>{reportData.reporter}</td>
                  <td>Reporter Email</td>
                  <td>
                    <a href={`mailto:${reportData.email}`}>{reportData.email}</a>
                  </td>
                </tr>
                <tr>
                  <td>Reported Timestamp</td>
                  <td>{reportData.date ? new Date(reportData.date).toLocaleString() : "N/A"}</td>
                  <td>Current SOC Status</td>
                  <td>
                    <span className="status-badge-pulse">● Active Containment</span>
                  </td>
                </tr>
                <tr>
                  <td>Incident Summary</td>
                  <td colSpan="3" className="description-cell">
                    {reportData.description}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ================= MITRE ATT&CK TAGS ================= */}
        <section className="report-section">
          <h3>
            <FaBullseye /> Relevant MITRE ATT&CK® Techniques
          </h3>
          <div className="tags">
            {intelligence.tactics.map((tac) => (
              <span key={tac.id} className="mitre-tag">
                <strong>{tac.id}</strong>: {tac.name}
              </span>
            ))}
          </div>
        </section>

        {/* ================= INCIDENT TIMELINE ================= */}
        <section className="report-section">
          <h3>
            <FaClock /> Incident Timeline
          </h3>
          <div className="timeline-container">
            <ul className="timeline">
              {dynamicTimeline.map((item, index) => (
                <li key={index} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-info">
                    <span className="timeline-time">{item.time}</span>
                    <strong className="timeline-title">{item.label}</strong>
                    <p className="timeline-desc">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ================= CONTAINMENT ACTIONS ================= */}
        <section className="report-section">
          <h3>
            <FaTasks /> Containment Actions Executed
          </h3>
          <ul className="action-checklist">
            {intelligence.containment.map((action, idx) => (
              <li key={idx} className="checklist-item done">
                <span className="check-icon">✔</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ================= RECOVERY & REMEDIATION ================= */}
        <section className="report-section">
          <h3>
            <FaWrench /> Recommended Remediation Playbook
          </h3>
          <ul className="action-checklist">
            {intelligence.remediation.map((rec, idx) => (
              <li key={idx} className="checklist-item pending">
                <span className="bullet-icon">✦</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ================= AI GENERATED EMAIL PREVIEW ================= */}
        <section className="report-section">
          <h3>
            <FaEnvelope /> Stakeholder Incident Broadcast Preview
          </h3>
          <div className="email-preview">
            <div className="email-preview-header">
              <div>
                <strong>Subject:</strong> [SECURITY ALERT] - [{reportData?.severity?.toUpperCase()}]{" "}
                {reportData?.incidentType} on {reportData?.system}
              </div>
              <span className="email-tag">EmailJS Ready</span>
            </div>
            <div className="email-preview-body">
              <p>Dear Stakeholders & Security Response Team,</p>
              <br />
              <p>
                An incident of <strong>{reportData?.severity}</strong> severity involving{" "}
                <strong>{reportData?.incidentType}</strong> has been logged for{" "}
                <strong>{reportData?.system}</strong> at {reportData?.company}.
              </p>
              <br />
              <p>
                <strong>Summary of IoC / Observation:</strong>
                <br />
                <em>{reportData?.description}</em>
              </p>
              <br />
              <p>
                The SOC team is executing immediate isolation, credential rotation, and containment
                protocols. Please refrain from altering affected host configurations.
              </p>
              <br />
              <p>
                Regards,
                <br />
                <strong>SecureOps AI Security Operations Center</strong>
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="report-footer">
        <p>
          <strong>Classification:</strong> Confidential / TLP:AMBER
        </p>
        <p>
          <strong>SOC Engine:</strong> SecureOps AI v1.0
        </p>
        <p>
          <strong>Generated On:</strong> {new Date().toLocaleString()}
        </p>
      </div>
    </section>
  );
}

export default IncidentReport;