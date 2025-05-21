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
import Swal from "sweetalert2";
import "./Electrical.css";

const sections = ["TOP_APRON", "MIDDLE_APRON", "BOTTOM_APRON"];

const machineTypes = {
  TOP_APRON: ["LR", "JEETS", "TOYODA", "Rieter", "Trützschler", "Savio"],
  MIDDLE_APRON: ["SUESSEN", "TOYODA", "Rieter", "LR", "Schlafhorst"],
  BOTTOM_APRON: ["JEETS", "TOYODA", "Rieter", "Trützschler", "Savio", "Other"],
};

const ElectricalMaintenance = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [cumulativeData, setCumulativeData] = useState([]);
  const [selectedSection, setSelectedSection] = useState(sections[0]);
  const [formData, setFormData] = useState(
    sections.reduce((acc, section) => {
      acc[section] = { type: "", date: "" };
      return acc;
    }, {})
  );

  const calculateLife = (date) => {
    if (!date) return { days: 0, months: 0, nextSchedule: "-" };
    const currentDate = new Date();
    const inputDate = new Date(date);
    const diffTime = Math.abs(currentDate - inputDate);
    const lifeInDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const lifeInMonths = (lifeInDays / 30.44).toFixed(2);
    const nextSchedule = new Date(inputDate);
    nextSchedule.setFullYear(nextSchedule.getFullYear() + 2);
    const formattedNext = nextSchedule.toISOString().split("T")[0];
    return { days: lifeInDays, months: lifeInMonths, nextSchedule: formattedNext };
  };

  const fetchCumulativeData = async () => {
    try {
      const response = await fetch("http://localhost:5001/electrical-all");
      const data = await response.json();
      if (response.ok) {
        const formattedData = data.data.flatMap((record) =>
          Object.entries(record.sections).map(([section, details]) => ({
            date: record.date,
            section,
            type: details.type,
            lifeInDays: details.lifeInDays,
            lifeInMonths: details.lifeInMonths,
            nextSchedule: details.nextSchedule,
          }))
        );
        setCumulativeData(formattedData);
      } else {
        console.error("Fetch failed:", data.message);
      }
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };

  useEffect(() => {
    fetchCumulativeData();
  }, []);

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedSections = sections.reduce((acc, section) => {
      const { type, date } = formData[section];
      const { days, months, nextSchedule } = calculateLife(date);
      acc[section] = { type, date, lifeInDays: days, lifeInMonths: months, nextSchedule };
      return acc;
    }, {});

    try {
      const response = await fetch("http://localhost:5001/add-electrical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          sections: formattedSections,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        Swal.fire({ title: "Success!", text: result.message, icon: "success", timer: 2000 });

        const newData = Object.entries(formattedSections).map(([section, details]) => ({
          date: selectedDate,
          section,
          type: details.type,
          lifeInDays: details.lifeInDays,
          lifeInMonths: details.lifeInMonths,
          nextSchedule: details.nextSchedule,
        }));

        setCumulativeData((prev) => [...prev, ...newData]);
      } else {
        Swal.fire({ title: "Error", text: result.message, icon: "error", timer: 2000 });
      }
    } catch (error) {
      console.error("Submit error:", error);
      Swal.fire({ title: "Error", text: "Submission failed", icon: "error", timer: 2000 });
    }
  };

  const filteredData = cumulativeData.filter((item) => item.section === selectedSection);

  return (
    <div className="container-fluid p-5">
      {/* ✅ Form */}
      <div className="row">
        <div className="col-md-6">
          <h3 className="text-primary mb-4">Enter Maintenance Data</h3>
          <form className="bg-light p-4 rounded shadow-lg" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label">Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="form-control"
                required
              />
            </div>

            {sections.map((section) => (
              <div key={section} className="card mb-3 p-3 shadow-sm">
                <h5 className="text-success">{section}</h5>

                {/* ✅ Dropdown for Type */}
                <div className="mb-3">
                  <label className="form-label">Type:</label>
                  <select
                    value={formData[section]?.type || ""}
                    onChange={(e) => handleChange(section, "type", e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="">Select Machine Type</option>
                    {machineTypes[section].map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Date:</label>
                  <input
                    type="date"
                    value={formData[section]?.date || ""}
                    onChange={(e) => handleChange(section, "date", e.target.value)}
                    className="form-control"
                    required
                  />
                </div>
              </div>
            ))}

            <button type="submit" className="btn btn-primary w-100 mt-3">
              Submit
            </button>
          </form>
        </div>

        {/* ✅ Table */}
        <div className="col-md-6">
          <h3 className="text-primary mb-3">Cumulative Data</h3>
          <div className="mb-3">
            <label>Select Section:</label>
            <select
              className="form-select"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              {sections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>

          {filteredData.length > 0 ? (
            <table className="table table-bordered table-striped rounded shadow-sm">
              <thead className="table-dark">
                <tr>
                  <th>Date</th>
                  <th>Section</th>
                  <th>Type</th>
                  <th>Days</th>
                  <th>Months</th>
                  <th>Next Schedule</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.date}</td>
                    <td>{item.section}</td>
                    <td>{item.type}</td>
                    <td>{item.lifeInDays}</td>
                    <td>{item.lifeInMonths}</td>
                    <td>{item.nextSchedule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="alert alert-warning">No data for selected section.</div>
          )}
        </div>
      </div>

      {/* ✅ Graph */}
      <div className="row mt-5">
        <div className="col-12">
          <h3 className="text-primary text-center mb-3">Graph Visualization - {selectedSection}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="lifeInDays" stroke="#8884d8" name="Life (Days)" />
              <Line type="monotone" dataKey="lifeInMonths" stroke="#82ca9d" name="Life (Months)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ElectricalMaintenance;
