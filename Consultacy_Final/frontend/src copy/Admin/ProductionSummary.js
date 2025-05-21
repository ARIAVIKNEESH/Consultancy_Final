import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

import "./ProductionSummary.css";

const departments = [
  "All",
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

const ProductionSummary = () => {
  const [month, setMonth] = useState("");
  const [data, setData] = useState({});
  const [filteredData, setFilteredData] = useState({});
  const [selectedDept, setSelectedDept] = useState("All");

  useEffect(() => {
    if (month) fetchData(month);
  }, [month]);

  const fetchData = async (selectedMonth) => {
    try {
      const res = await axios.get(`http://localhost:5001/cumulative/production/${selectedMonth}`);
      setData(res.data || {});
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const filterData = useCallback(() => {
    if (selectedDept === "All") {
      setFilteredData(data);
    } else {
      setFilteredData({
        [selectedDept]: data[selectedDept],
      });
    }
  }, [selectedDept, data]);

  useEffect(() => {
    filterData();
  }, [filterData]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Production Summary Report", 14, 16);
    const tableData = Object.entries(filteredData).map(([dept, values]) => [
      dept,
      values.ondate_prod || 0,
      values.ondate_hands || 0,
    ]);
    doc.autoTable({
      head: [["Department", "Production", "Hands"]],
      body: tableData,
      startY: 20,
    });
    doc.save("production_summary.pdf");
  };

  const exportExcel = () => {
    const exportData = Object.entries(filteredData).map(([dept, values]) => ({
      Department: dept,
      Production: values.ondate_prod || 0,
      Hands: values.ondate_hands || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Production Summary");
    XLSX.writeFile(workbook, "production_summary.xlsx");
  };

  return (
    <div className="summary-container">
      <h2>Production Summary</h2>
      <div className="summary-filters">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        <button onClick={exportPDF}>Export PDF</button>
        <button onClick={exportExcel}>Export Excel</button>
      </div>

      <table className="summary-table">
        <thead>
          <tr>
            <th>Department</th>
            <th>Production</th>
            <th>Hands</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(filteredData).map(([dept, values]) => (
            <tr key={dept}>
              <td>{dept}</td>
              <td>{values?.ondate_prod || 0}</td>
              <td>{values?.ondate_hands || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductionSummary;
