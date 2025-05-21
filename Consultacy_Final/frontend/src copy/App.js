import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/navbar";
import Login from "./Login/Login";
import Signup from "./Login/Signup";
import Production from "./Production/Production";
import Electrical from "./Electrical/ElectricalMaintenance";
import Admin from "./Admin/Admin";
import Home from "./Home/Home";
import ProductionSummary from "./Admin/ProductionSummary";
import ElectricalMaintenanceSummary from "./Admin/ElectricalMaintenanceSummary";
import "./App.css";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check localStorage for auth status on load
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(authStatus);
  }, []);

  const handleAuth = (status) => {
    setIsAuthenticated(status);
    localStorage.setItem("isAuthenticated", status.toString());
  };

  return (
    <Router>
      <div className="app-container">
        {/* Show navbar only if logged in */}
        {isAuthenticated && <Navbar />}

        <Routes>
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to="/home" /> : <Login onAuth={handleAuth} />} 
          />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/home" 
            element={isAuthenticated ? <Home /> : <Navigate to="/" />} 
          />
          <Route 
            path="/production" 
            element={isAuthenticated ? <Production /> : <Navigate to="/" />} 
          />
          <Route 
            path="/electrical" 
            element={isAuthenticated ? <Electrical /> : <Navigate to="/" />} 
          />
          <Route 
            path="/admin" 
            element={isAuthenticated ? <Admin /> : <Navigate to="/" />} 
          />
          <Route 
            path="/productionsummary" 
            element={isAuthenticated ? <ProductionSummary /> : <Navigate to="/" />} 
          />
          <Route 
            path="/electricalmaintenancesummary" 
            element={isAuthenticated ? <ElectricalMaintenanceSummary /> : <Navigate to="/" />} 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
