import {
  FaBug,
  FaShieldVirus,
  FaExclamationTriangle,
  FaFileSignature,
} from "react-icons/fa";

function DashboardCards({ reportCount = 154 }) {
  const cards = [
    {
      icon: <FaBug aria-hidden="true" />,
      title: "Active Incidents",
      value: "24",
      accent: "#3B82F6",
      tag: "Live Feed",
    },
    {
      icon: <FaShieldVirus aria-hidden="true" />,
      title: "Threat Level",
      value: "HIGH",
      accent: "#EF4444",
      tag: "DEFCON 2",
    },
    {
      icon: <FaExclamationTriangle aria-hidden="true" />,
      title: "Critical Alerts",
      value: "08",
      accent: "#F59E0B",
      tag: "Needs Triage",
    },
    {
      icon: <FaFileSignature aria-hidden="true" />,
      title: "Reports Generated",
      value: reportCount,
      accent: "#10B981",
      tag: "Live Counter",
    },
  ];

  return (
    <section
      className="dashboard-cards"
      id="dashboard-metrics-section"
      aria-label="SOC Metrics Summary"
    >
      {cards.map((card, index) => (
        <div className="card" key={index}>
          <div
            className="card-icon"
            style={{
              background: `${card.accent}22`,
              color: card.accent,
              border: `1px solid ${card.accent}44`,
            }}
          >
            {card.icon}
          </div>

          <div className="card-info">
            <div className="card-top-row">
              <h3>{card.value}</h3>
              <span
                className="card-tag"
                style={{
                  background: `${card.accent}18`,
                  color: card.accent,
                  borderColor: `${card.accent}33`,
                }}
              >
                {card.tag}
              </span>
            </div>
            <p>{card.title}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

export default DashboardCards;