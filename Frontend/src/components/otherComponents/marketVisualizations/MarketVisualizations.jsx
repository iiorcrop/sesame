import React, { useState, useEffect } from "react";
import {
  fetchMarketYears,
  fetchMarketDataForYear,
} from "../../services/marketYearData";
import PriceComparisonsChart from "./PriceComparisonsChart";
import PriceTrendsChart from "./PriceTrendsChart";
import StateComparisonsChart from "./StateComparisonsChart";
import VarietyComparisonChart from "./VarietyComparisonChart";
import { IoMdClose } from "react-icons/io";
import MultiSelectDropdown from "../../common/MultiSelectDropdown";
import "../../css/MarketVisualizations.css";
import "../../../css/MarketVisualizations.css";
import "../../../css/MultiSelectDropdown-viz.css";

const MarketVisualizations = () => {
  const [marketYears, setMarketYears] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [marketData, setMarketData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("priceTrends");

  const tabs = [
    { id: "priceTrends", label: "Price Trends" },
    { id: "priceComparisons", label: "Price Comparisons" },
    { id: "stateComparisons", label: "State Comparisons" },
    { id: "varietyComparisons", label: "Variety Comparisons" },
  ];

  // Fetch market years when component mounts
  useEffect(() => {
    const fetchYearsData = async () => {
      try {
        const years = await fetchMarketYears();

        // Sort years in descending order so most recent years appear at the top
        const sortedYears = [...years].sort((a, b) => b.year - a.year);
        setMarketYears(sortedYears);

        // Auto-select the last 3 years
        if (sortedYears && sortedYears.length > 0) {
          const lastThreeYears = sortedYears
            .slice(0, 3)
            .map((year) => year.year);
          setSelectedYears(lastThreeYears);
        }
      } catch (err) {
        console.error("Error fetching market years:", err);
        setError("Failed to load market years data");
      }
    };

    fetchYearsData();
  }, []);

  // Fetch data when selected years change
  useEffect(() => {
    const fetchDataForYears = async () => {
      if (selectedYears.length === 0) {
        setMarketData({});
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const yearDataPromises = selectedYears.map((year) =>
          fetchMarketDataForYear(year)
        );

        const results = await Promise.all(yearDataPromises);

        const newMarketData = {};
        results.forEach((result, index) => {
          if (result && result.data) {
            newMarketData[selectedYears[index]] = result.data;
          }
        });

        setMarketData(newMarketData);
        setError(null);
      } catch (err) {
        console.error("Error fetching market data:", err);
        setError("Failed to load market data");
      } finally {
        setLoading(false);
      }
    };

    fetchDataForYears();
  }, [selectedYears]);

  // We don't need the dropdown state and ref anymore as the MultiSelectDropdown handles this internally

  const handleYearChange = (e) => {
    // The MultiSelectDropdown component passes an event object with name and value properties
    const { value } = e.target;
    setSelectedYears(value);
  };

  const clearSelectedYears = () => {
    setSelectedYears([]);
  };

  const renderActiveTab = () => {
    // Show loading state if data is still loading
    if (loading) {
      return <div className="loading">Loading data...</div>;
    }

    // Show error message if there was an error
    if (error) {
      return <div className="error">{error}</div>;
    }

    // Show message if no years are selected
    if (selectedYears.length === 0) {
      return (
        <div className="no-data">
          Please select at least one year to view visualization
        </div>
      );
    }

    // Render the appropriate visualization based on active tab
    switch (activeTab) {
      case "priceTrends":
        return <PriceTrendsChart marketData={marketData} />;
      case "priceComparisons":
        return <PriceComparisonsChart marketData={marketData} />;
      case "stateComparisons":
        return <StateComparisonsChart marketData={marketData} />;
      case "varietyComparisons":
        return <VarietyComparisonChart marketData={marketData} />;
      default:
        return <div className="no-data">Select a visualization type</div>;
    }
  };

  return (
    <div className="market-viz-container">
      <h1 className="text-2xl font-bold mb-4">Market Data Visualizations</h1>

      <div className="chart-filters">
        <div className="filter-group">
          <MultiSelectDropdown
            name="years"
            label="Select Years:"
            value={selectedYears}
            onChange={handleYearChange}
            onClear={clearSelectedYears}
            placeholder="Select years"
            options={marketYears.map((year) => ({
              value: year.year,
              label: year.year.toString(),
            }))}
          />

          {/* Display selected years as tags for better visibility */}
          {selectedYears.length > 0 && (
            <div className="selected-years-tags">
              {selectedYears.map((year) => (
                <div key={year} className="selected-year-tag">
                  {year}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Visualization Type Tabs */}
      <div className="viz-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`viz-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="viz-description">
        {activeTab === "priceTrends" && (
          <p>
            This chart shows the price trends over time, allowing you to track
            how minimum, maximum, and modal prices have changed across selected
            years.
          </p>
        )}
        {activeTab === "priceComparisons" && (
          <p>
            Compare minimum, maximum, and modal prices across different years to
            identify pricing patterns and market behavior.
          </p>
        )}
        {activeTab === "stateComparisons" && (
          <p>
            Compare market prices across different states to identify regional
            pricing differences and market opportunities.
          </p>
        )}
        {activeTab === "varietyComparisons" && (
          <p>
            Compare different crop varieties to understand which varieties
            command better prices in the market.
          </p>
        )}
      </div>

      {/* Render the active visualization */}
      {renderActiveTab()}
    </div>
  );
};

export default MarketVisualizations;
