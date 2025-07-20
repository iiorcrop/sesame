import React, { useState, useEffect } from "react";
import { fetchAllMSPData, fetchMSPChartData } from "../services/mspService";
import "../css/MSP.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { useMSP } from "../../Context/MSPContext";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Helper function to safely extract the first year from YYYY-YYYY format
const getYearStart = (yearRange) => {
  if (!yearRange) return 0;
  const parts = yearRange.split("-");
  return parts.length === 2 ? parseInt(parts[0], 10) : parseInt(yearRange, 10);
};

const MSPData = () => {
  const [mspData, setMSPData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [chartType, setChartType] = useState("line");
  const currentFiscalYear = (() => {
    const today = new Date();
    const year = today.getFullYear();
    return `${year}-${year + 1}`;
  })();
  const { setCurrentMSP } = useMSP();

  const [currentYear, setCurrentYear] = useState(currentFiscalYear);

  // Filter states
  const [yearRange, setYearRange] = useState({
    startYear: "",
    endYear: "",
  });

  // Get unique years from data - sorted by start year
  const getYears = () => {
    if (!mspData.length) return [];
    return [...new Set(mspData.map((item) => item.year))].sort(
      (a, b) => getYearStart(a) - getYearStart(b)
    );
  };

  // Calculate statistics
  const calculateStats = (data) => {
    if (!data || data.length === 0)
      return { avg: 0, min: 0, max: 0, latest: 0, growth: 0 };

    // Sort by year for calculations - using helper function to extract start year
    const sortedData = [...data].sort(
      (a, b) => getYearStart(a.year) - getYearStart(b.year)
    );

    const sum = sortedData.reduce((acc, item) => acc + item.mspValue, 0);
    const avg = sum / sortedData.length;
    const min = Math.min(...sortedData.map((item) => item.mspValue));
    const max = Math.max(...sortedData.map((item) => item.mspValue));
    const latest = sortedData[sortedData.length - 1].mspValue;

    // Calculate YoY growth if we have more than one year of data
    let growth = 0;
    if (sortedData.length > 1) {
      const previousValue = sortedData[sortedData.length - 2].mspValue;
      growth = ((latest - previousValue) / previousValue) * 100;
    }

    return { avg, min, max, latest, growth };
  };

  // Find MSP for the current year
  const getCurrentYearMSP = () => {
    // First try to find an exact match for the current year
    const msp = mspData.find((item) => item.year === currentYear);
    if (msp) return msp.mspValue;

    // If not found, try to find the most recent year
    if (mspData.length > 0) {
      const sortedData = [...mspData].sort(
        (a, b) => getYearStart(b.year) - getYearStart(a.year)
      );
      return sortedData[0].mspValue;
    }

    return "N/A";
  };

  // Fetch MSP data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchAllMSPData();

        // Sort by year - using helper function to extract start year
        const sortedData = [...data].sort((a, b) => {
          return getYearStart(a.year) - getYearStart(b.year);
        });

        setMSPData(sortedData);
        setFilteredData(sortedData);

        // Generate chart data
        generateChartData(sortedData);
      } catch (err) {
        setError("Failed to fetch MSP data. Please try again later.");
        console.error("Error fetching MSP data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters when filter values change
  useEffect(() => {
    if (mspData.length === 0) return;

    let filtered = [...mspData];

    // Filter by exact match with start year
    if (yearRange.startYear) {
      const startYearIndex = getYears().indexOf(yearRange.startYear);
      if (startYearIndex >= 0) {
        const years = getYears().slice(startYearIndex);
        filtered = filtered.filter((msp) => years.includes(msp.year));
      }
    }

    // Filter by exact match with end year
    if (yearRange.endYear) {
      const endYearIndex = getYears().indexOf(yearRange.endYear);
      if (endYearIndex >= 0) {
        const years = getYears().slice(0, endYearIndex + 1);
        filtered = filtered.filter((msp) => years.includes(msp.year));
      }
    }

    setFilteredData(filtered);
    generateChartData(filtered);
  }, [yearRange, mspData]);

  useEffect(() => {
    // After data is loaded and current year MSP is available, store in context
    if (!loading && mspData.length > 0) {
      setCurrentMSP(getCurrentYearMSP());
    }
    // eslint-disable-next-line
  }, [loading, mspData, currentYear]);

  // Generate chart data
  const generateChartData = (data) => {
    if (!data || data.length === 0) {
      setChartData(null);
      return;
    }

    // Sort by year - using helper function to extract start year
    const sortedData = [...data].sort((a, b) => {
      return getYearStart(a.year) - getYearStart(b.year);
    });

    setChartData({
      labels: sortedData.map((item) => item.year),
      datasets: [
        {
          label: "MSP Value (₹)",
          data: sortedData.map((item) => item.mspValue),
          borderColor: "#2e7d32",
          backgroundColor: "rgba(46, 125, 50, 0.2)",
          borderWidth: 2,
          pointBackgroundColor: "#2e7d32",
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true,
        },
      ],
    });
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setYearRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setYearRange({
      startYear: "",
      endYear: "",
    });
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: "Minimum Support Price Trends",
        font: {
          size: 18,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context) {
            return `MSP: ₹${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: "MSP Value (₹)",
          font: {
            size: 14,
            weight: "bold",
          },
        },
        ticks: {
          callback: function (value) {
            return "₹" + value;
          },
        },
      },
      x: {
        title: {
          display: true,
          text: "Year",
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  // Calculate statistics from the filtered data
  const stats = calculateStats(filteredData);

  // Format currency value
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(value)
      .replace("₹", "₹ ");
  };

  return (
    <div className="msp-container">
      <div className="msp-heading">
        <h1>Minimum Support Price (MSP) Information</h1>
        <p>Track historical MSP trends and current rates</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          {/* MSP Overview Section */}
          <div className="msp-overview">
            <div className="msp-info-card">
              <div className="msp-info-title">Current MSP Information</div>
              <p>
                The Minimum Support Price (MSP) for the current year is
                <span className="msp-value-highlight">
                  {" "}
                  {getCurrentYearMSP() !== "N/A"
                    ? formatCurrency(getCurrentYearMSP())
                    : "N/A"}
                </span>
                .
              </p>
              <p>
                <strong>What is MSP?</strong> Minimum Support Price (MSP) is a
                form of market intervention by the Government of India to insure
                agricultural producers against any sharp fall in farm prices.
              </p>
            </div>

            <h2>MSP Statistics</h2>
            <div
              className="msp-stats-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
                marginTop: "15px",
              }}
            >
              <div
                className="msp-stat-card"
                style={{
                  padding: "15px",
                  backgroundColor: "#f1f8e9",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ fontSize: "0.9rem", color: "#555" }}>
                  Average MSP
                </div>
                <div
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: "bold",
                    color: "#2e7d32",
                  }}
                >
                  {formatCurrency(stats.avg)}
                </div>
              </div>
              <div
                className="msp-stat-card"
                style={{
                  padding: "15px",
                  backgroundColor: "#f1f8e9",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ fontSize: "0.9rem", color: "#555" }}>
                  Lowest MSP
                </div>
                <div
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: "bold",
                    color: "#2e7d32",
                  }}
                >
                  {formatCurrency(stats.min)}
                </div>
              </div>
              <div
                className="msp-stat-card"
                style={{
                  padding: "15px",
                  backgroundColor: "#f1f8e9",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ fontSize: "0.9rem", color: "#555" }}>
                  Highest MSP
                </div>
                <div
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: "bold",
                    color: "#2e7d32",
                  }}
                >
                  {formatCurrency(stats.max)}
                </div>
              </div>
              <div
                className="msp-stat-card"
                style={{
                  padding: "15px",
                  backgroundColor: "#f1f8e9",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ fontSize: "0.9rem", color: "#555" }}>
                  Latest MSP
                </div>
                <div
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: "bold",
                    color: "#2e7d32",
                  }}
                >
                  {formatCurrency(stats.latest)}
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: stats.growth >= 0 ? "#2e7d32" : "#c62828",
                  }}
                >
                  {stats.growth >= 0 ? "↑" : "↓"}{" "}
                  {Math.abs(stats.growth).toFixed(2)}% from previous year
                </div>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="msp-filters-section">
            <h2>Filter MSP Data</h2>
            <div className="msp-filters">
              <div className="msp-filter-group">
                <label className="msp-filter-label">Start Year:</label>
                <select
                  className="msp-filter-input"
                  name="startYear"
                  value={yearRange.startYear}
                  onChange={handleFilterChange}
                >
                  <option value="">All Years</option>
                  {getYears().map((year) => (
                    <option key={`start-${year}`} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="msp-filter-group">
                <label className="msp-filter-label">End Year:</label>
                <select
                  className="msp-filter-input"
                  name="endYear"
                  value={yearRange.endYear}
                  onChange={handleFilterChange}
                >
                  <option value="">All Years</option>
                  {getYears().map((year) => (
                    <option key={`end-${year}`} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="msp-filter-group">
                <button className="msp-button secondary" onClick={resetFilters}>
                  Reset Filters
                </button>
              </div>

              <div className="msp-filter-group">
                <label className="msp-filter-label">Chart Type:</label>
                <select
                  className="msp-filter-input"
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                >
                  <option value="line">Line Chart</option>
                  <option value="bar">Bar Chart</option>
                </select>
              </div>
            </div>

            <div className="msp-filter-info">
              Showing {filteredData.length} of {mspData.length} records
            </div>
          </div>

          {/* Chart Section */}
          <div className="msp-chart-container">
            <h2 className="msp-chart-title">MSP Trend Analysis</h2>
            <div style={{ height: "400px" }}>
              {chartData ? (
                chartType === "line" ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <Bar data={chartData} options={chartOptions} />
                )
              ) : (
                <div className="no-chart-data">No chart data available</div>
              )}
            </div>
          </div>

          {/* Table Section */}
          <div className="msp-table-container">
            <h2>MSP Historical Data</h2>
            <table className="msp-table">
              <thead>
                <tr>
                  <th>S. No</th>
                  <th>Year</th>
                  <th>MSP Value (₹)</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center" }}>
                      No MSP data available for the selected filters
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => (
                    <tr
                      key={item._id}
                      className={item.year === currentYear ? "highlight" : ""}
                    >
                      <td>{String(index + 1).padStart(2, "0")}</td>
                      <td>{item.year}</td>
                      <td>{formatCurrency(item.mspValue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default MSPData;
