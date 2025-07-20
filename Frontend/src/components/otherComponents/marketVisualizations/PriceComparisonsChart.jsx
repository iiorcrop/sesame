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

const PriceComparisonsChart = ({ marketData }) => {
  const [chartData, setChartData] = useState(null);
  const [selectedMarket, setSelectedMarket] = useState("");
  const [selectedVariety, setSelectedVariety] = useState("");
  const [priceType, setPriceType] = useState("average"); // average, min, max, or modal
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
    const years = Object.keys(marketData).sort();
    const datasets = [];

    // Filter data based on selections
    const filteredData = {};
    years.forEach((year) => {
      filteredData[year] = marketData[year].filter(
        (item) =>
          item.marketName === selectedMarket && item.variety === selectedVariety
      );
    });

    // Calculate average prices for each price type by year
    const averageMinPrices = {};
    const averageMaxPrices = {};
    const averageModalPrices = {};

    years.forEach((year) => {
      const yearData = filteredData[year];
      if (yearData && yearData.length > 0) {
        // Calculate averages
        const sumMin = yearData.reduce(
          (acc, item) => acc + Number(item.minPrice || 0),
          0
        );
        const sumMax = yearData.reduce(
          (acc, item) => acc + Number(item.maxPrice || 0),
          0
        );
        const sumModal = yearData.reduce(
          (acc, item) => acc + Number(item.modalPrice || 0),
          0
        );

        averageMinPrices[year] = sumMin / yearData.length;
        averageMaxPrices[year] = sumMax / yearData.length;
        averageModalPrices[year] = sumModal / yearData.length;
      } else {
        averageMinPrices[year] = 0;
        averageMaxPrices[year] = 0;
        averageModalPrices[year] = 0;
      }
    });

    // Create datasets based on selected price type
    if (priceType === "average" || priceType === "all") {
      // For "all" or "average", we'll show all three price types
      datasets.push({
        label: "Min Price",
        data: years.map((year) => averageMinPrices[year]),
        backgroundColor: "rgba(53, 162, 235, 0.7)",
        borderColor: "rgba(53, 162, 235, 1)",
        borderWidth: 1,
      });

      datasets.push({
        label: "Max Price",
        data: years.map((year) => averageMaxPrices[year]),
        backgroundColor: "rgba(255, 99, 132, 0.7)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      });

      datasets.push({
        label: "Modal Price",
        data: years.map((year) => averageModalPrices[year]),
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      });
    } else if (priceType === "min") {
      datasets.push({
        label: "Min Price",
        data: years.map((year) => averageMinPrices[year]),
        backgroundColor: "rgba(53, 162, 235, 0.7)",
        borderColor: "rgba(53, 162, 235, 1)",
        borderWidth: 1,
      });
    } else if (priceType === "max") {
      datasets.push({
        label: "Max Price",
        data: years.map((year) => averageMaxPrices[year]),
        backgroundColor: "rgba(255, 99, 132, 0.7)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      });
    } else if (priceType === "modal") {
      datasets.push({
        label: "Modal Price",
        data: years.map((year) => averageModalPrices[year]),
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      });
    }

    setChartData({
      labels: years,
      datasets,
    });
  }, [marketData, selectedMarket, selectedVariety, priceType]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `Price Comparisons for ${selectedVariety} at ${selectedMarket}`,
        font: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Year",
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
        <h2 className="chart-title">Year-wise Price Comparisons</h2>
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
          <div className="filter-group">
            <label className="filter-label">Price Type:</label>
            <select
              className="filter-select"
              value={priceType}
              onChange={(e) => setPriceType(e.target.value)}
            >
              <option value="all">All Price Types</option>
              <option value="min">Minimum Price</option>
              <option value="max">Maximum Price</option>
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
            {selectedMarket && selectedVariety
              ? "No data available for the selected market and variety"
              : "Select a market and variety to display price comparisons"}
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceComparisonsChart;
