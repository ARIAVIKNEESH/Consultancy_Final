import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";  // Add some CSS for styling

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear authentication status from localStorage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("authToken");

    // Redirect to login page
    navigate("/");
    window.location.reload();  // Optional: force re-render to reset state
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 shadow-sm">
      <div className="container-fluid">
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="navbar-brand" to="/Home">HOME</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/production">Production</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/electrical">Electrical</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/Admin">Admin</Link>
            </li>
          </ul>

          {/* Logout button */}
          <button 
            className="btn btn-outline-danger" 
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
