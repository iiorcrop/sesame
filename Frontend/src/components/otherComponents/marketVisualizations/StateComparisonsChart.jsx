import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StateComparisonsChart = ({ marketData }) => {
  const [chartData, setChartData] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedVariety, setSelectedVariety] = useState("");
  const [priceType, setPriceType] = useState("modal"); // min, max, or modal
  const [yearOptions, setYearOptions] = useState([]);
  const [varietyOptions, setVarietyOptions] = useState([]);

  // Extract unique years and varieties from data
  useEffect(() => {
    const years = Object.keys(marketData).sort();
    const varieties = new Set();

    Object.values(marketData).forEach((yearData) => {
      yearData.forEach((item) => {
        if (item.variety) varieties.add(item.variety);
      });
    });

    setYearOptions(years);
    setVarietyOptions(Array.from(varieties).sort());

    // Set default selections if available
    if (years.length > 0) setSelectedYear(years[years.length - 1]); // Latest year
    if (varieties.size > 0) setSelectedVariety(Array.from(varieties)[0]);
  }, [marketData]);

  // Prepare chart data when selections change
  useEffect(() => {
    if (!selectedYear || !selectedVariety || !marketData[selectedYear]) {
      setChartData(null);
      return;
    }

    // Filter data for selected year and variety
    const filteredData = marketData[selectedYear].filter(
      (item) => item.variety === selectedVariety
    );

    // Get unique states from filtered data
    const stateData = {};
    filteredData.forEach((item) => {
      if (!item.stateName) return;

      if (!stateData[item.stateName]) {
        stateData[item.stateName] = {
          minPrices: [],
          maxPrices: [],
          modalPrices: [],
        };
      }

      stateData[item.stateName].minPrices.push(Number(item.minPrice || 0));
      stateData[item.stateName].maxPrices.push(Number(item.maxPrice || 0));
      stateData[item.stateName].modalPrices.push(Number(item.modalPrice || 0));
    });

    // Calculate averages for each state
    const states = Object.keys(stateData).sort();
    let dataValues = [];
    let backgroundColor = [];
    const colorPalette = [
      "rgba(255, 99, 132, 0.7)",
      "rgba(54, 162, 235, 0.7)",
      "rgba(255, 206, 86, 0.7)",
      "rgba(75, 192, 192, 0.7)",
      "rgba(153, 102, 255, 0.7)",
      "rgba(255, 159, 64, 0.7)",
      "rgba(199, 199, 199, 0.7)",
      "rgba(83, 102, 255, 0.7)",
      "rgba(255, 99, 255, 0.7)",
      "rgba(0, 162, 235, 0.7)",
    ];

    states.forEach((state, index) => {
      const stateInfo = stateData[state];
      let avgPrice = 0;

      if (priceType === "min") {
        avgPrice =
          stateInfo.minPrices.reduce((acc, val) => acc + val, 0) /
          stateInfo.minPrices.length;
      } else if (priceType === "max") {
        avgPrice =
          stateInfo.maxPrices.reduce((acc, val) => acc + val, 0) /
          stateInfo.maxPrices.length;
      } else {
        // modal is default
        avgPrice =
          stateInfo.modalPrices.reduce((acc, val) => acc + val, 0) /
          stateInfo.modalPrices.length;
      }

      dataValues.push(avgPrice);
      backgroundColor.push(colorPalette[index % colorPalette.length]);
    });

    setChartData({
      labels: states,
      datasets: [
        {
          label: `${
            priceType.charAt(0).toUpperCase() + priceType.slice(1)
          } Price`,
          data: dataValues,
          backgroundColor: backgroundColor,
          borderWidth: 1,
        },
      ],
    });
  }, [marketData, selectedYear, selectedVariety, priceType]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `${selectedYear} State Comparison: ${selectedVariety} (${
          priceType.charAt(0).toUpperCase() + priceType.slice(1)
        } Price)`,
        font: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "State",
        },
      },
      y: {
        title: {
          display: true,
          text: "Price (₹)",
        },
        beginAtZero: false,
      },
    },
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2 className="chart-title">State-wise Price Comparison</h2>
        <div className="chart-filters">
          <div className="filter-group">
            <label className="filter-label">Year:</label>
            <select
              className="filter-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Variety:</label>
            <select
              className="filter-select"
              value={selectedVariety}
              onChange={(e) => setSelectedVariety(e.target.value)}
            >
              {varietyOptions.map((variety) => (
                <option key={variety} value={variety}>
                  {variety}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Price Type:</label>
            <select
              className="filter-select"
              value={priceType}
              onChange={(e) => setPriceType(e.target.value)}
            >
              <option value="min">Min Price</option>
              <option value="max">Max Price</option>
              <option value="modal">Modal Price</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ height: "400px" }}>
        {chartData ? (
          <Bar data={chartData} options={options} />
        ) : (
          <div className="no-data">
            {selectedYear && selectedVariety
              ? "No data available for the selected year and variety"
              : "Select a year and variety to display state comparisons"}
          </div>
        )}
      </div>
    </div>
  );
};

export default StateComparisonsChart;
