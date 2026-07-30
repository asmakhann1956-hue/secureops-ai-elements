import {
  FaBug,
  FaShieldVirus,
  FaExclamationTriangle,
  FaFileSignature,
} from "react-icons/fa";

function DashboardCards() {
  const cards = [
    {
      icon: <FaBug />,
      title: "Active Incidents",
      value: "24",
      color: "#3B82F6",
    },
    {
      icon: <FaShieldVirus />,
      title: "Threat Level",
      value: "HIGH",
      color: "#EF4444",
    },
    {
      icon: <FaExclamationTriangle />,
      title: "Critical Alerts",
      value: "08",
      color: "#F59E0B",
    },
    {
      icon: <FaFileSignature />,
      title: "Reports Generated",
      value: "154",
      color: "#10B981",
    },
  ];

  return (
    <div className="cards">
      {cards.map((card, index) => (
        <div className="card" key={index}>
          <div
            className="card-icon"
            style={{ background: card.color }}
          >
            {card.icon}
          </div>

          <div>
            <h3>{card.value}</h3>
            <p>{card.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DashboardCards;