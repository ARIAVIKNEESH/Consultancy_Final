import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Admin.css";

const Admin = () => {
  const [productionData, setProductionData] = useState([]);
  const [electricalData, setElectricalData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const dummyProduction = [
      { date: "2025-04-01", quantity: 100, downtime: 2 },
      { date: "2025-04-02", quantity: 120, downtime: 1.5 },
      { date: "2025-04-03", quantity: 90, downtime: 3 },
      { date: "2025-04-04", quantity: 110, downtime: 1 },
    ];

    const dummyElectrical = [
      { date: "2025-04-01", breakdowns: 2, repaired: 1 },
      { date: "2025-04-02", breakdowns: 3, repaired: 2 },
      { date: "2025-04-03", breakdowns: 1, repaired: 1 },
      { date: "2025-04-04", breakdowns: 4, repaired: 3 },
    ];

    const fetchProductionSummary = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/admin/production-summary");
        const data = await res.json();
        setProductionData(data.length > 0 ? data : dummyProduction);
      } catch (error) {
        console.error("Error fetching production summary:", error);
        setProductionData(dummyProduction);
      }
    };

    const fetchElectricalSummary = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/admin/electrical-summary");
        const data = await res.json();
        setElectricalData(data.length > 0 ? data : dummyElectrical);
      } catch (error) {
        console.error("Error fetching electrical summary:", error);
        setElectricalData(dummyElectrical);
      }
    };

    fetchProductionSummary();
    fetchElectricalSummary();
  }, []);

  const handleProductionClick = () => navigate("/productionsummary");
  const handleElectricalClick = () => navigate("/electricalmaintenancesummary");

  return (
    <div className="container-fluid p-4">
      <h2 className="text-center text-primary mb-4">Admin Dashboard Summary</h2>
      <div className="row">
        <div className="col-md-6 mb-4" onClick={handleProductionClick} style={{ cursor: "pointer" }}>
          <h4 className="text-success mb-3">Production Summary</h4>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={productionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#8884d8" name="Production Qty" />
              <Bar dataKey="downtime" fill="#FF8042" name="Downtime (Hands)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="col-md-6 mb-4" onClick={handleElectricalClick} style={{ cursor: "pointer" }}>
          <h4 className="text-success mb-3">Electrical Maintenance Summary</h4>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={electricalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="breakdowns" fill="#82ca9d" name="Life in Days" />
              <Bar dataKey="repaired" fill="#8884d8" name="Life in Months" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Admin;