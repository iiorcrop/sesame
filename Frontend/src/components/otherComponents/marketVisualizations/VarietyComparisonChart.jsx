import React, { useState, useEffect } from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const VarietyComparisonChart = ({ marketData }) => {
  const [chartData, setChartData] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [priceType, setPriceType] = useState("modal"); // min, max, or modal
  const [yearOptions, setYearOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);

  // Extract unique years and states from data
  useEffect(() => {
    const years = Object.keys(marketData).sort();
    const states = new Set();

    Object.values(marketData).forEach((yearData) => {
      yearData.forEach((item) => {
        if (item.stateName) states.add(item.stateName);
      });
    });

    setYearOptions(years);
    setStateOptions(Array.from(states).sort());

    // Set default selections if available
    if (years.length > 0) setSelectedYear(years[years.length - 1]); // Latest year
    if (states.size > 0) setSelectedState(Array.from(states)[0]);
  }, [marketData]);

  // Prepare chart data when selections change
  useEffect(() => {
    if (!selectedYear || !selectedState || !marketData[selectedYear]) {
      setChartData(null);
      return;
    }

    // Filter data for selected year and state
    const filteredData = marketData[selectedYear].filter(
      (item) => item.stateName === selectedState
    );

    // Get data grouped by variety
    const varietyData = {};
    filteredData.forEach((item) => {
      if (!item.variety) return;

      if (!varietyData[item.variety]) {
        varietyData[item.variety] = {
          minPrices: [],
          maxPrices: [],
          modalPrices: [],
        };
      }

      varietyData[item.variety].minPrices.push(Number(item.minPrice || 0));
      varietyData[item.variety].maxPrices.push(Number(item.maxPrice || 0));
      varietyData[item.variety].modalPrices.push(Number(item.modalPrice || 0));
    });

    // Calculate averages for each variety
    const varieties = Object.keys(varietyData);

    if (varieties.length === 0) {
      setChartData(null);
      return;
    }

    // Calculate the average price for each variety based on price type
    const dataValues = varieties.map((variety) => {
      const data = varietyData[variety];
      let avgPrice = 0;

      if (priceType === "min") {
        avgPrice =
          data.minPrices.reduce((acc, val) => acc + val, 0) /
          data.minPrices.length;
      } else if (priceType === "max") {
        avgPrice =
          data.maxPrices.reduce((acc, val) => acc + val, 0) /
          data.maxPrices.length;
      } else {
        // modal is default
        avgPrice =
          data.modalPrices.reduce((acc, val) => acc + val, 0) /
          data.modalPrices.length;
      }

      return avgPrice;
    });

    // Find max price to normalize the data (radar chart works better with normalized data)
    const maxPrice = Math.max(...dataValues);
    const normalizedData = dataValues.map((value) => (value / maxPrice) * 100);

    setChartData({
      labels: varieties,
      datasets: [
        {
          label: `${
            priceType.charAt(0).toUpperCase() + priceType.slice(1)
          } Price (%)`,
          data: normalizedData,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          pointBackgroundColor: "rgba(75, 192, 192, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(75, 192, 192, 1)",
          fill: true,
        },
      ],
    });
  }, [marketData, selectedYear, selectedState, priceType]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `${selectedYear} Variety Comparison in ${selectedState} (${
          priceType.charAt(0).toUpperCase() + priceType.slice(1)
        } Price)`,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.raw.toFixed(
              1
            )}% of highest price`;
          },
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2 className="chart-title">Variety Comparison Chart</h2>
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
            <label className="filter-label">State:</label>
            <select
              className="filter-select"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              {stateOptions.map((state) => (
                <option key={state} value={state}>
                  {state}
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

      <div className="viz-description">
        <p>
          This radar chart shows the relative price comparison between different
          varieties as a percentage of the highest priced variety. A higher
          percentage indicates a higher price commanded by that variety in the
          market.
        </p>
      </div>

      <div style={{ height: "500px" }}>
        {chartData ? (
          <Radar data={chartData} options={options} />
        ) : (
          <div className="no-data">
            {selectedYear && selectedState
              ? "No data available for the selected year and state"
              : "Select a year and state to display variety comparisons"}
          </div>
        )}
      </div>
    </div>
  );
};

export default VarietyComparisonChart;
