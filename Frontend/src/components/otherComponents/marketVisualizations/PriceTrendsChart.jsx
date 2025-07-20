import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PriceTrendsChart = ({ marketData }) => {
  const [chartData, setChartData] = useState(null);
  const [selectedMarket, setSelectedMarket] = useState("");
  const [selectedVariety, setSelectedVariety] = useState("");
  const [marketOptions, setMarketOptions] = useState([]);
  const [varietyOptions, setVarietyOptions] = useState([]);

  // Extract unique markets and varieties from data
  useEffect(() => {
    const markets = new Set();
    const varieties = new Set();

    Object.values(marketData).forEach((yearData) => {
      yearData.forEach((item) => {
        if (item.marketName) markets.add(item.marketName);
        if (item.variety) varieties.add(item.variety);
      });
    });

    setMarketOptions(Array.from(markets).sort());
    setVarietyOptions(Array.from(varieties).sort());

    // Set default selections if available
    if (markets.size > 0) setSelectedMarket(Array.from(markets)[0]);
    if (varieties.size > 0) setSelectedVariety(Array.from(varieties)[0]);
  }, [marketData]);

  // Prepare chart data when selections change
  useEffect(() => {
    if (
      !selectedMarket ||
      !selectedVariety ||
      Object.keys(marketData).length === 0
    ) {
      setChartData(null);
      return;
    }

    // Prepare the dataset
    const filteredData = {};

    // Group data by month for each year
    Object.entries(marketData).forEach(([year, yearData]) => {
      const filteredYearData = yearData.filter(
        (item) =>
          item.marketName === selectedMarket && item.variety === selectedVariety
      );

      filteredData[year] = filteredYearData.sort(
        (a, b) => new Date(a.reportedDate) - new Date(b.reportedDate)
      );
    });

    // Now create datasets for the chart
    const datasets = [];
    const colors = {
      min: {
        borderColor: "rgba(53, 162, 235, 0.8)",
        backgroundColor: "rgba(53, 162, 235, 0.1)",
      },
      max: {
        borderColor: "rgba(255, 99, 132, 0.8)",
        backgroundColor: "rgba(255, 99, 132, 0.1)",
      },
      modal: {
        borderColor: "rgba(75, 192, 192, 0.8)",
        backgroundColor: "rgba(75, 192, 192, 0.1)",
      },
    };

    // Create a consistent set of labels (months)
    const allDates = [];
    Object.values(filteredData).forEach((yearData) => {
      yearData.forEach((item) => {
        if (item.reportedDate) {
          const date = new Date(item.reportedDate);
          const formattedDate = `${date.toLocaleString("default", {
            month: "short",
          })} ${date.getFullYear()}`;
          allDates.push(formattedDate);
        }
      });
    });

    // Sort and remove duplicates
    const labels = [...new Set(allDates)].sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA - dateB;
    });

    // Add datasets
    Object.entries(filteredData).forEach(([year, yearData]) => {
      // Create dataset for min price
      datasets.push({
        label: `Min Price (${year})`,
        data: labels.map((label) => {
          const item = yearData.find((item) => {
            const date = new Date(item.reportedDate);
            const formattedDate = `${date.toLocaleString("default", {
              month: "short",
            })} ${date.getFullYear()}`;
            return formattedDate === label;
          });
          return item ? item.minPrice : null;
        }),
        borderColor: colors.min.borderColor,
        backgroundColor: colors.min.backgroundColor,
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 3,
      });

      // Create dataset for max price
      datasets.push({
        label: `Max Price (${year})`,
        data: labels.map((label) => {
          const item = yearData.find((item) => {
            const date = new Date(item.reportedDate);
            const formattedDate = `${date.toLocaleString("default", {
              month: "short",
            })} ${date.getFullYear()}`;
            return formattedDate === label;
          });
          return item ? item.maxPrice : null;
        }),
        borderColor: colors.max.borderColor,
        backgroundColor: colors.max.backgroundColor,
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 3,
      });

      // Create dataset for modal price
      datasets.push({
        label: `Modal Price (${year})`,
        data: labels.map((label) => {
          const item = yearData.find((item) => {
            const date = new Date(item.reportedDate);
            const formattedDate = `${date.toLocaleString("default", {
              month: "short",
            })} ${date.getFullYear()}`;
            return formattedDate === label;
          });
          return item ? item.modalPrice : null;
        }),
        borderColor: colors.modal.borderColor,
        backgroundColor: colors.modal.backgroundColor,
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 3,
      });
    });

    setChartData({
      labels,
      datasets,
    });
  }, [marketData, selectedMarket, selectedVariety]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `Price Trends for ${selectedVariety} at ${selectedMarket}`,
        font: {
          size: 16,
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Month",
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
        <h2 className="chart-title">Price Trends Over Time</h2>
        <div className="chart-filters">
          <div className="filter-group">
            <label className="filter-label">Market:</label>
            <select
              className="filter-select"
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
            >
              {marketOptions.map((market) => (
                <option key={market} value={market}>
                  {market}
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
        </div>
      </div>

      <div style={{ height: "400px" }}>
        {chartData ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="no-data">
            {selectedMarket && selectedVariety
              ? "No data available for the selected market and variety"
              : "Select a market and variety to display price trends"}
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceTrendsChart;
