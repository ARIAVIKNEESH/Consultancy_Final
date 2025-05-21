// Production.js
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";

const allDepartments = [
  "MIXING",
  "BR_CDG",
  "PREDRG",
  "LH15",
  "COMBER",
  "DRG",
  "SMX",
  "SPG",
  "ACWDG",
  "PACKBAGS",
];

const Production = () => {
  const [leftDate, setLeftDate] = useState("");
  const [rightDate, setRightDate] = useState("");
  const [leftGraphData, setLeftGraphData] = useState([]);
  const [rightGraphData, setRightGraphData] = useState([]);
  const [mode, setMode] = useState("add");
  const [formEntries, setFormEntries] = useState([{ department: "", ondate_prod: 0, ondate_hands: 0 }]);
  const [cumulative, setCumulative] = useState({});

  // Fetch left graph data
  useEffect(() => {
    if (leftDate) {
      fetch(`http://localhost:5001/production/selected-date/${leftDate}`)
        .then(res => res.json())
        .then(data => {
          const chartData = allDepartments.map(dept => ({
            name: dept,
            Production: data[dept]?.ondate_prod || 0,
            Hands: data[dept]?.ondate_hands || 0,
          }));
          setLeftGraphData(chartData);
        })
        .catch(err => console.error(err));
    } else {
      setLeftGraphData([]);
    }
  }, [leftDate]);

  // Fetch right graph data
  useEffect(() => {
    if (rightDate) {
      fetch(`http://localhost:5001/production/selected-date/${rightDate}`)
        .then(res => res.json())
        .then(data => {
          const chartData = allDepartments.map(dept => ({
            name: dept,
            Production: data[dept]?.ondate_prod || 0,
            Hands: data[dept]?.ondate_hands || 0,
          }));
          setRightGraphData(chartData);
        })
        .catch(err => console.error(err));
    } else {
      setRightGraphData([]);
    }
  }, [rightDate]);

  // Fetch cumulative data for the month of rightDate
  useEffect(() => {
    if (rightDate) {
      const month = rightDate.slice(0, 7); // YYYY-MM
      fetch(`http://localhost:5001/cumulative/production/${month}`)
        .then(res => res.json())
        .then(data => setCumulative(data))
        .catch(err => console.error(err));
    } else {
      setCumulative({});
    }
  }, [rightDate]);

  // Load form entries and mode
  useEffect(() => {
    if (!leftDate) {
      setMode("add");
      setFormEntries([{ department: "", ondate_prod: 0, ondate_hands: 0 }]);
      return;
    }

    fetch(`http://localhost:5001/production/selected-date/${leftDate}`)
      .then(res => res.json())
      .then(data => {
        if (!data || Object.keys(data).length === 0) {
          setMode("add");
          setFormEntries([{ department: "", ondate_prod: 0, ondate_hands: 0 }]);
          return;
        }

        const entries = allDepartments
          .filter(dept => data[dept])
          .map(dept => ({
            department: dept,
            ondate_prod: data[dept].ondate_prod || 0,
            ondate_hands: data[dept].ondate_hands || 0,
          }));

        if (entries.length === 0) {
          setMode("add");
          setFormEntries([{ department: "", ondate_prod: 0, ondate_hands: 0 }]);
        } else {
          setMode("update");
          setFormEntries(entries);
        }
      })
      .catch(() => {
        setMode("add");
        setFormEntries([{ department: "", ondate_prod: 0, ondate_hands: 0 }]);
      });
  }, [leftDate]);

  const handleEntryChange = (index, field, value) => {
    setFormEntries(prev => {
      const updated = [...prev];
      updated[index][field] = field === "department" ? value : Math.max(0, Number(value));
      return updated;
    });
  };

  const addEntry = () => {
    if (formEntries.length >= allDepartments.length) return;
    setFormEntries(prev => [...prev, { department: "", ondate_prod: 0, ondate_hands: 0 }]);
  };

  const removeEntry = (index) => {
    setFormEntries(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!leftDate) {
      alert("Please select a date.");
      return;
    }

    const selectedDepartments = formEntries.map(entry => entry.department);
    if (selectedDepartments.some(dept => !dept) || new Set(selectedDepartments).size !== selectedDepartments.length) {
      alert("Please select unique departments for all entries.");
      return;
    }

    const payload = { date: leftDate };
    formEntries.forEach(({ department, ondate_prod, ondate_hands }) => {
      payload[department] = { ondate_prod, ondate_hands };
    });

    const endpoint = mode === "add" ? "/add" : "/update";

    fetch(`http://localhost:5001/production${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(() => {
        alert(`Data ${mode === "add" ? "added" : "updated"} successfully!`);
        setLeftDate(leftDate); // refresh form and chart
      })
      .catch(() => alert("Something went wrong. Please try again."));
  };

  const selectedDepartments = formEntries.map(entry => entry.department);

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col-md-6">
          <label className="form-label fw-bold">Select Left Date (Graph & Entry):</label>
          <input
            type="date"
            className="form-control"
            value={leftDate}
            onChange={(e) => setLeftDate(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label fw-bold">Select Right Date (Graph & Cumulative):</label>
          <input
            type="date"
            className="form-control"
            value={rightDate}
            onChange={(e) => setRightDate(e.target.value)}
          />
        </div>
      </div>

      {/* Graphs */}
      <div className="row mb-5">
        <div className="col-md-6">
          <h4>Production - {leftDate || "Left Date"}</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={leftGraphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Production" stroke="#007bff" />
              <Line type="monotone" dataKey="Hands" stroke="#28a745" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="col-md-6">
          <h4>Production - {rightDate || "Right Date"}</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={rightGraphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Production" stroke="#dc3545" />
              <Line type="monotone" dataKey="Hands" stroke="#17a2b8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Form & Table */}
      <div className="row">
        <div className="col-md-6">
          <h3>{mode === "add" ? "Add" : "Update"} Production</h3>
          <form onSubmit={handleSubmit} className="bg-light p-4 rounded shadow-sm">
            <div className="mb-3">
              <label className="form-label fw-bold">Entry Date:</label>
              <input
                type="date"
                className="form-control"
                value={leftDate}
                onChange={(e) => setLeftDate(e.target.value)}
              />
            </div>

            {formEntries.map((entry, i) => (
              <div key={i} className="card mb-3 p-3">
                <div className="mb-3">
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={entry.department}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && selectedDepartments.includes(val) && val !== entry.department) {
                        alert("Department already selected.");
                        return;
                      }
                      handleEntryChange(i, "department", val);
                    }}
                  >
                    <option value="">-- Select Department --</option>
                    {allDepartments.map(dept => (
                      <option
                        key={dept}
                        value={dept}
                        disabled={selectedDepartments.includes(dept) && dept !== entry.department}
                      >
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="row">
                  <div className="col">
                    <label className="form-label">OnDate Production</label>
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      value={entry.ondate_prod}
                      onChange={(e) => handleEntryChange(i, "ondate_prod", e.target.value)}
                    />
                  </div>
                  <div className="col">
                    <label className="form-label">OnDate Hands</label>
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      value={entry.ondate_hands}
                      onChange={(e) => handleEntryChange(i, "ondate_hands", e.target.value)}
                    />
                  </div>
                </div>
                {formEntries.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm mt-3"
                    onClick={() => removeEntry(i)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="btn btn-primary mb-3"
              onClick={addEntry}
              disabled={formEntries.length >= allDepartments.length}
            >
              + Add Department
            </button>

            <button type="submit" className="btn btn-success w-100">
              {mode === "add" ? "Add Data" : "Update Data"}
            </button>
          </form>
        </div>

        <div className="col-md-6">
          <h3>Cumulative - {rightDate?.slice(0, 7) || "Select a Date"}</h3>
          {rightDate && Object.keys(cumulative).length > 0 ? (
            <table className="table table-striped">
              <thead className="table-dark">
                <tr>
                  <th>Department</th>
                  <th>Cumulative Production</th>
                  <th>Cumulative Hands</th>
                </tr>
              </thead>
              <tbody>
                {allDepartments.map(dept => {
                  const row = cumulative[dept] || {};
                  return (
                    <tr key={dept}>
                      <td>{dept}</td>
                      <td>{row.ondate_prod ?? "-"}</td>
                      <td>{row.ondate_hands ?? "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>Please select a date to load cumulative data.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Production;
