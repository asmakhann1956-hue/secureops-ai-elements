import { FaBell, FaMoon, FaUserCircle } from "react-icons/fa";

function Navbar() {
  return (
    <div className="navbar">
      <div>
        <h1>Security Operations Center</h1>
        <p>Monitor, Analyze & Communicate Security Incidents</p>
      </div>

      <div className="nav-right">
        <FaBell className="nav-icon" />
        <FaMoon className="nav-icon" />
        <div className="profile">
          <FaUserCircle className="profile-icon" />
          <div>
            <h4>Security Analyst</h4>
            <span>Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;