import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAccessibility } from "../../../Context/AccessibilityContext";
import {
  fetchAPYYears,
  fetchAPYDataForYear,
  fetchAPYDataForMultipleYears,
} from "../../services/apyData";
import * as XLSX from "xlsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { IoIosArrowDown, IoIosArrowUp, IoMdClose } from "react-icons/io";
import "../../css/MarketData.css";
import "../../css/APYData.css";

const APYData = () => {
  const { fontSize } = useAccessibility();
  // Use local state for high contrast since it's not in the context
  const [highContrast, setHighContrast] = useState(false);

  // Load high contrast setting from localStorage
  useEffect(() => {
    const savedHighContrast = localStorage.getItem(
      "accessibility_highContrast"
    );
    if (savedHighContrast === "true") {
      setHighContrast(true);
    }
  }, []);

  const [apyYears, setAPYYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [apyData, setAPYData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState("loading"); // 'api', 'mock', or 'loading'
  const [statesList, setStatesList] = useState([]); // List of unique states for the dropdown

  const [filters, setFilters] = useState({
    states: [], // Now an array for multiple states
  });

  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const stateDropdownRef = useRef(null);

  const [chartView, setChartView] = useState("table"); // 'table', 'bar', 'line'
  const [chartData, setChartData] = useState([]);
  const [chartDataType, setChartDataType] = useState("area"); // 'area', 'production', 'productivity'

  // Year comparison state
  const [showYearComparison, setShowYearComparison] = useState(false);
  const [comparisonState, setComparisonState] = useState("");
  const [yearComparisonData, setYearComparisonData] = useState([]);
  const [yearComparisonDataType, setYearComparisonDataType] = useState("area");
  const [yearComparisonLoading, setYearComparisonLoading] = useState(false);
  const [yearComparisonError, setYearComparisonError] = useState(null);

  // Fetch APY years when the component mounts
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const data = await fetchAPYYears();
        setAPYYears(data);

        // Set the most recent year as the default selected year
        if (data && data.length > 0) {
          const sortedYears = [...data].sort((a, b) => {
            // Sort descending by year (assuming format "YYYY-YYYY")
            const yearA = a.year.split("-")[0];
            const yearB = b.year.split("-")[0];
            return yearB - yearA;
          });
          setSelectedYear(sortedYears[0].year);
        }
      } catch (error) {
        console.error("Error fetching APY years:", error);
        setError("Failed to load APY years");
      }
    };

    fetchYears();
  }, []);

  // Fetch APY data when selected year changes
  useEffect(() => {
    if (selectedYear) {
      fetchDataForSelectedYear();
    }
  }, [selectedYear]);

  // Update chart data when APY data changes
  useEffect(() => {
    if (apyData.length > 0) {
      prepareChartData();

      // Extract unique states for dropdown
      const uniqueStates = [
        ...new Set(apyData.map((item) => item.state)),
      ].sort();
      setStatesList(uniqueStates);
    }
  }, [apyData, chartDataType]);

  const prepareChartData = () => {
    // Prepare data for charts
    const chartData = apyData.map((item) => ({
      state: item.state,
      area: item.area,
      production: item.production,
      productivity: item.productivity,
    }));
    setChartData(chartData);
  };

  const fetchDataForSelectedYear = async () => {
    setLoading(true);
    setError(null);

    try {
      // Prepare filters for API request
      const apiFilters = {};

      // Handle multiple states
      if (filters.states && filters.states.length > 0) {
        // If using the backend can accept multiple states, you could adjust this
        // For now, we'll filter on the frontend if multiple states are selected
        apiFilters.states = filters.states;
      }

      const response = await fetchAPYDataForYear(selectedYear, apiFilters);
      let filteredData = response.data || [];

      // If multiple states are selected, filter the data on the frontend
      if (filters.states && filters.states.length > 0) {
        filteredData = filteredData.filter((item) =>
          filters.states.includes(item.state)
        );
      }

      setAPYData(filteredData);
      setDataSource(response.dataSource || "api");
    } catch (error) {
      console.error(`Error fetching APY data for year ${selectedYear}:`, error);
      setError(`Failed to fetch data for ${selectedYear}`);
      setAPYData([]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle year comparison view
  const toggleYearComparison = () => {
    setShowYearComparison(!showYearComparison);
    if (showYearComparison) {
      // Reset comparison data when closing
      setYearComparisonData([]);
      setYearComparisonError(null);
    }
  };

  // Handle year change
  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  // Handle state change for comparison
  const handleComparisonStateChange = (state) => {
    setComparisonState(state);
    if (state) {
      fetchYearComparisonData(state);
    } else {
      setYearComparisonData([]);
      setYearComparisonError(null);
    }
  };

  // Fetch data for year comparison with better error handling
  const fetchYearComparisonData = async (state = comparisonState) => {
    if (!state) {
      setYearComparisonError("Please select a state to compare");
      return;
    }

    setYearComparisonLoading(true);
    setYearComparisonError(null);

    try {
      // Get all years to compare
      const yearsList = apyYears.map((year) => year.year);

      if (yearsList.length === 0) {
        throw new Error("No years available for comparison");
      }

      // Fetch data for each year
      const results = await fetchAPYDataForMultipleYears(yearsList);

      if (!Array.isArray(results) || results.length === 0) {
        throw new Error("Failed to fetch comparison data");
      }

      // Process and transform the data for the selected state
      const stateData = [];

      results.forEach((result, index) => {
        if (!result || !result.data || !Array.isArray(result.data)) {
          console.warn(`No valid data returned for year ${yearsList[index]}`);
          return;
        }

        const yearData = result.data.find((item) => item.state === state);
        if (yearData) {
          stateData.push({
            year: yearsList[index],
            area: yearData.area || 0,
            production: yearData.production || 0,
            productivity: yearData.productivity || 0,
          });
        }
      });

      // Sort by year
      stateData.sort((a, b) => {
        const yearA = parseInt(a.year.split("-")[0]);
        const yearB = parseInt(b.year.split("-")[0]);
        return yearA - yearB;
      });

      setYearComparisonData(stateData);

      if (stateData.length === 0) {
        setYearComparisonError(`No data available for ${state} across years`);
      }
    } catch (error) {
      console.error(`Error fetching comparison data for ${state}:`, error);
      setYearComparisonError(
        `Failed to load comparison data for ${state}: ${error.message}`
      );
      setYearComparisonData([]);
    } finally {
      setYearComparisonLoading(false);
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    // Create the worksheet from the filtered data
    const worksheet = XLSX.utils.json_to_sheet(apyData);
    const workbook = XLSX.utils.book_new();

    // Create a title for the export that shows which states are included
    let sheetName = "APY Data";
    if (filters.states.length > 0) {
      if (filters.states.length <= 2) {
        sheetName = `${selectedYear} - ${filters.states.join(", ")}`;
      } else {
        sheetName = `${selectedYear} - Multiple States`;
      }
    } else {
      sheetName = `${selectedYear} - All States`;
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Set column widths
    const colWidths = [
      { wch: 20 }, // State
      { wch: 15 }, // Area
      { wch: 15 }, // Production
      { wch: 15 }, // Productivity
    ];
    worksheet["!cols"] = colWidths;

    // Include filters as a metadata sheet
    const metadataSheet = XLSX.utils.aoa_to_sheet([
      ["APY Data Export"],
      ["Generated on", new Date().toLocaleDateString()],
      ["Year", selectedYear],
      [
        "States",
        filters.states.length > 0 ? filters.states.join(", ") : "All States",
      ],
    ]);

    XLSX.utils.book_append_sheet(workbook, metadataSheet, "Export Info");

    XLSX.writeFile(workbook, `APY_Data_${selectedYear}.xlsx`);
  };

  // Toggle high contrast mode
  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem("accessibility_highContrast", newValue.toString());
  };

  // Function to get dynamic styles based on accessibility settings
  const getStyles = () => {
    // The fontSize from useAccessibility() is a percentage, convert it to em
    const fontSizeEm = fontSize / 100;

    return {
      fontSize: `${fontSizeEm}em`,
      highContrast: highContrast
        ? {
            backgroundColor: "#000",
            color: "#fff",
            borderColor: "#fff",
          }
        : {},
    };
  };

  const styles = getStyles();

  // Colors for the charts
  const CHART_COLORS = [
    "#8884d8",
    "#83a6ed",
    "#8dd1e1",
    "#82ca9d",
    "#a4de6c",
    "#d0ed57",
    "#ffc658",
    "#ff8042",
    "#ff6361",
    "#bc5090",
    "#58508d",
    "#003f5c",
  ];

  // Toggle state dropdown
  const toggleStateDropdown = useCallback(() => {
    setIsStateDropdownOpen(!isStateDropdownOpen);
  }, [isStateDropdownOpen]);

  // Toggle state selection
  const toggleStateSelection = useCallback((state) => {
    setFilters((prev) => {
      const newStates = prev.states.includes(state)
        ? prev.states.filter((s) => s !== state)
        : [...prev.states, state];
      return { ...prev, states: newStates };
    });
  }, []);

  // Select all states
  const handleSelectAllStates = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      states: [...statesList],
    }));
  }, [statesList]);

  // Deselect all states
  const handleDeselectAllStates = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      states: [],
    }));
  }, []);

  // Apply filters
  const handleApplyFilters = useCallback(() => {
    fetchDataForSelectedYear();
    setIsStateDropdownOpen(false); // Close dropdown after applying filters
  }, [selectedYear, filters]);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setFilters({
      states: [],
    });
    setIsStateDropdownOpen(false);
  }, []);

  // Change chart view
  const handleChartViewChange = useCallback((view) => {
    setChartView(view);
  }, []);

  // Change chart data type
  const handleChartDataTypeChange = useCallback((e) => {
    setChartDataType(e.target.value);
  }, []);

  // Update year comparison chart when data type changes
  useEffect(() => {
    if (showYearComparison && yearComparisonData.length > 0) {
      // No need to re-fetch data, just re-render with new data type
    }
  }, [yearComparisonDataType]);

  // Listen for comparison state change and auto-refresh data
  useEffect(() => {
    if (showYearComparison && comparisonState) {
      fetchYearComparisonData(comparisonState);
    }
  }, [comparisonState, showYearComparison]);

  // Hook to close state dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        stateDropdownRef.current &&
        !stateDropdownRef.current.contains(event.target)
      ) {
        setIsStateDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [stateDropdownRef]);

  // Helper function to format year range for display
  const formatYearRange = (yearRange) => {
    // If already in YYYY-YYYY format, return as is
    if (yearRange.includes("-")) {
      return yearRange;
    }

    // If just a year, return it
    return yearRange;
  };

  // Helper function to get display name for data types
  const getDataTypeDisplayName = (type) => {
    switch (type) {
      case "area":
        return "Area ('000 Hectare)";
      case "production":
        return "Production ('000 Tonne)";
      case "productivity":
        return "Productivity (Kg/Hectare)";
      default:
        return type;
    }
  };

  // Function to handle chart download (as an image)
  const handleChartDownload = useCallback(() => {
    // This is a simplified approach - in a real app you'd use a library
    // like html2canvas or react-component-export-image
    const chartElement = document.querySelector(
      ".recharts-responsive-container"
    );
    if (!chartElement) return;

    try {
      // Create prompt to save image
      alert(
        'To save the chart: Right-click on the chart and select "Save image as..."'
      );

      // In a real implementation you would use:
      // html2canvas(chartElement).then((canvas) => {
      //   const url = canvas.toDataURL('image/png');
      //   const link = document.createElement('a');
      //   link.download = `${comparisonState}-${yearComparisonDataType}-comparison.png`;
      //   link.href = url;
      //   link.click();
      // });
    } catch (error) {
      console.error("Failed to download chart:", error);
    }
  }, [comparisonState, yearComparisonDataType]);

  // Generate an accessible summary of the year comparison data
  const getAccessibleChartSummary = useCallback(() => {
    if (!yearComparisonData.length || !comparisonState) return "";

    let summary = `${comparisonState} ${getDataTypeDisplayName(
      yearComparisonDataType
    ).toLowerCase()} across years: `;

    yearComparisonData.forEach((item, index) => {
      const formattedYear = formatYearRange(item.year);
      const value = item[yearComparisonDataType]?.toLocaleString() || "no data";

      summary += `${formattedYear}: ${value}${
        index < yearComparisonData.length - 1 ? ", " : "."
      }`;
    });

    // Add trend information
    if (yearComparisonData.length > 1) {
      const firstValue = yearComparisonData[0][yearComparisonDataType] || 0;
      const lastValue =
        yearComparisonData[yearComparisonData.length - 1][
          yearComparisonDataType
        ] || 0;

      if (lastValue > firstValue) {
        summary += ` Overall trend shows an increase of ${(
          lastValue - firstValue
        ).toLocaleString()}.`;
      } else if (lastValue < firstValue) {
        summary += ` Overall trend shows a decrease of ${(
          firstValue - lastValue
        ).toLocaleString()}.`;
      } else {
        summary += ` No significant change over the period.`;
      }
    }

    return summary;
  }, [yearComparisonData, comparisonState, yearComparisonDataType]);

  return (
    <div className="apy-data-container" style={{ ...styles.highContrast }}>
      <h1 className="page-title" style={{ fontSize: styles.fontSize }}>
        Area, Production and Productivity of Sesame seed in India
      </h1>

      <div className="year-selector-container">
        <label htmlFor="year-selector" style={{ fontSize: styles.fontSize }}>
          Select Year:
        </label>
        <select
          id="year-selector"
          value={selectedYear}
          onChange={handleYearChange}
          className="year-selector"
          style={{ fontSize: styles.fontSize, ...styles.highContrast }}
        >
          {apyYears.map((year) => (
            <option key={year._id} value={year.year}>
              {year.year}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-container">
        <div className="filter-group">
          <label htmlFor="state-filter" style={{ fontSize: styles.fontSize }}>
            States:
          </label>
          <div
            ref={stateDropdownRef}
            className="multi-select-container"
            data-high-contrast={highContrast}
            data-font-size={
              Number(fontSize) > 110
                ? "larger"
                : Number(fontSize) > 100
                ? "large"
                : "normal"
            }
          >
            <div
              className={`multi-select-header ${
                isStateDropdownOpen ? "open" : ""
              }`}
              onClick={toggleStateDropdown}
              style={{ ...styles.highContrast }}
            >
              {filters.states.length === 0
                ? "All States"
                : `${filters.states.length} State${
                    filters.states.length > 1 ? "s" : ""
                  } Selected`}
              <span className="dropdown-icon">
                {isStateDropdownOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
              </span>
            </div>

            {isStateDropdownOpen && (
              <>
                <div
                  className="multi-select-dropdown"
                  style={{ ...styles.highContrast }}
                >
                  {statesList.map((state) => (
                    <div
                      key={state}
                      className={`multi-select-item ${
                        filters.states.includes(state) ? "selected" : ""
                      }`}
                      onClick={() => toggleStateSelection(state)}
                      style={{ fontSize: styles.fontSize }}
                    >
                      <input
                        type="checkbox"
                        checked={filters.states.includes(state)}
                        onChange={() => {}} // Handling in the div click
                        id={`state-checkbox-${state}`}
                      />
                      <label htmlFor={`state-checkbox-${state}`}>{state}</label>
                    </div>
                  ))}

                  <div className="multi-select-actions">
                    <button onClick={handleSelectAllStates}>Select All</button>
                    <button onClick={handleDeselectAllStates}>
                      Deselect All
                    </button>
                  </div>
                </div>
              </>
            )}

            {filters.states.length > 0 && (
              <div className="selected-options">
                {filters.states.slice(0, 3).map((state) => (
                  <div key={state} className="selected-option-tag">
                    {state}
                    <span
                      className="remove"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent dropdown toggle
                        toggleStateSelection(state);
                      }}
                    >
                      <IoMdClose />
                    </span>
                  </div>
                ))}
                {filters.states.length > 3 && (
                  <div className="selected-option-tag">
                    +{filters.states.length - 3} more
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="filter-buttons">
          <button
            onClick={handleApplyFilters}
            className="apply-button"
            style={{ fontSize: styles.fontSize, ...styles.highContrast }}
          >
            Apply Filters
          </button>
          <button
            onClick={handleResetFilters}
            className="reset-button"
            style={{ fontSize: styles.fontSize, ...styles.highContrast }}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="view-options">
        <div className="view-buttons">
          <button
            onClick={() => {
              setShowYearComparison(false);
              handleChartViewChange("table");
            }}
            className={`view-button ${
              chartView === "table" && !showYearComparison ? "active" : ""
            }`}
            style={{ fontSize: styles.fontSize, ...styles.highContrast }}
          >
            Table View
          </button>
          <button
            onClick={() => {
              setShowYearComparison(false);
              handleChartViewChange("bar");
            }}
            className={`view-button ${
              chartView === "bar" && !showYearComparison ? "active" : ""
            }`}
            style={{ fontSize: styles.fontSize, ...styles.highContrast }}
          >
            Bar Chart
          </button>
          <button
            onClick={() => {
              setShowYearComparison(false);
              handleChartViewChange("line");
            }}
            className={`view-button ${
              chartView === "line" && !showYearComparison ? "active" : ""
            }`}
            style={{ fontSize: styles.fontSize, ...styles.highContrast }}
          >
            Line Chart
          </button>
          <button
            onClick={() => {
              setShowYearComparison(true);
            }}
            className={`view-button ${showYearComparison ? "active" : ""}`}
            style={{ fontSize: styles.fontSize, ...styles.highContrast }}
            aria-label="Show year comparison chart"
            title="Compare data for a specific state across all years"
          >
            Year Comparison
          </button>
        </div>

        {!showYearComparison && chartView !== "table" && (
          <div className="chart-data-selector">
            <label
              htmlFor="chart-data-type"
              style={{ fontSize: styles.fontSize }}
            >
              Chart Data:
            </label>
            <select
              id="chart-data-type"
              value={chartDataType}
              onChange={handleChartDataTypeChange}
              className="filter-select"
              style={{ fontSize: styles.fontSize, ...styles.highContrast }}
            >
              <option value="area">Area ('000 Hectare)</option>
              <option value="production">Production ('000 Tonne)</option>
              <option value="productivity">Productivity (Kg/Hectare)</option>
            </select>
          </div>
        )}

        {showYearComparison && (
          <div className="comparison-controls">
            <div className="state-selector">
              <label
                htmlFor="comparison-state"
                style={{ fontSize: styles.fontSize }}
              >
                Select State:
              </label>
              <select
                id="comparison-state"
                value={comparisonState}
                onChange={(e) => handleComparisonStateChange(e.target.value)}
                className="filter-select"
                style={{ fontSize: styles.fontSize, ...styles.highContrast }}
              >
                <option value="">Select a state</option>
                {statesList.map((state) => (
                  <option key={`compare-${state}`} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div className="chart-data-selector">
              <label
                htmlFor="year-comparison-data-type"
                style={{ fontSize: styles.fontSize }}
              >
                Chart Data:
              </label>
              <select
                id="year-comparison-data-type"
                value={yearComparisonDataType}
                onChange={(e) => setYearComparisonDataType(e.target.value)}
                className="filter-select"
                style={{ fontSize: styles.fontSize, ...styles.highContrast }}
              >
                <option value="area">Area ('000 Hectare)</option>
                <option value="production">Production ('000 Tonne)</option>
                <option value="productivity">Productivity (Kg/Hectare)</option>
              </select>
            </div>
          </div>
        )}

        <button
          onClick={exportToExcel}
          className="export-button"
          style={{ fontSize: styles.fontSize, ...styles.highContrast }}
        >
          Export to Excel
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p style={{ fontSize: styles.fontSize }}>Loading APY data...</p>
        </div>
      ) : error ? (
        <div className="error-container" style={{ ...styles.highContrast }}>
          <p style={{ fontSize: styles.fontSize }}>{error}</p>
        </div>
      ) : apyData.length === 0 ? (
        <div className="no-data-container" style={{ ...styles.highContrast }}>
          <p style={{ fontSize: styles.fontSize }}>
            No APY data available for the selected year.
          </p>
        </div>
      ) : (
        <>
          {chartView === "table" ? (
            <div className="table-container" style={{ ...styles.highContrast }}>
              <table
                className="data-table"
                style={{ fontSize: styles.fontSize }}
              >
                <thead>
                  <tr>
                    <th className="text-black">State/UT</th>
                    <th className="text-black">Area ('000 Hectare)</th>
                    <th className="text-black">Production ('000 Tonne)</th>
                    <th className="text-black">Productivity (Kg/Hectare)</th>
                  </tr>
                </thead>
                <tbody>
                  {apyData.map((item) => (
                    <tr key={item._id}>
                      <td>{item.state}</td>
                      <td>{item.area?.toLocaleString() || "N/A"}</td>
                      <td>{item.production?.toLocaleString() || "N/A"}</td>
                      <td>{item.productivity?.toLocaleString() || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : chartView === "bar" ? (
            <div className="chart-container">
              <div className="chart-header">
                <h3
                  className="chart-title"
                  style={{ fontSize: styles.fontSize }}
                >
                  {chartDataType === "area"
                    ? "Area"
                    : chartDataType === "production"
                    ? "Production"
                    : "Productivity"}{" "}
                  by State ({selectedYear})
                </h3>
                <div className="chart-actions">
                  {/* Additional chart actions could be added here */}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="state"
                    angle={-45}
                    textAnchor="end"
                    tick={{ fontSize: styles.fontSize === "1em" ? 12 : 14 }}
                    height={80}
                  />
                  <YAxis
                    tick={{ fontSize: styles.fontSize === "1em" ? 12 : 14 }}
                    label={{
                      value:
                        chartDataType === "area"
                          ? "Area ('000 Hectare)"
                          : chartDataType === "production"
                          ? "Production ('000 Tonne)"
                          : "Productivity (Kg/Hectare)",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: styles.fontSize === "1em" ? 12 : 14 },
                    }}
                  />
                  <Tooltip />
                  <Legend
                    wrapperStyle={{
                      fontSize: styles.fontSize === "1em" ? 12 : 14,
                    }}
                  />
                  <Bar
                    dataKey={chartDataType}
                    name={
                      chartDataType === "area"
                        ? "Area ('000 Hectare)"
                        : chartDataType === "production"
                        ? "Production ('000 Tonne)"
                        : "Productivity (Kg/Hectare)"
                    }
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-container">
              <div className="chart-header">
                <h3
                  className="chart-title"
                  style={{ fontSize: styles.fontSize }}
                >
                  {chartDataType === "area"
                    ? "Area"
                    : chartDataType === "production"
                    ? "Production"
                    : "Productivity"}{" "}
                  by State ({selectedYear})
                </h3>
                <div className="chart-actions">
                  {/* Additional chart actions could be added here */}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="state"
                    angle={-45}
                    textAnchor="end"
                    tick={{ fontSize: styles.fontSize === "1em" ? 12 : 14 }}
                    height={80}
                  />
                  <YAxis
                    tick={{ fontSize: styles.fontSize === "1em" ? 12 : 14 }}
                    label={{
                      value:
                        chartDataType === "area"
                          ? "Area ('000 Hectare)"
                          : chartDataType === "production"
                          ? "Production ('000 Tonne)"
                          : "Productivity (Kg/Hectare)",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: styles.fontSize === "1em" ? 12 : 14 },
                    }}
                  />
                  <Tooltip />
                  <Legend
                    wrapperStyle={{
                      fontSize: styles.fontSize === "1em" ? 12 : 14,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey={chartDataType}
                    name={
                      chartDataType === "area"
                        ? "Area ('000 Hectare)"
                        : chartDataType === "production"
                        ? "Production ('000 Tonne)"
                        : "Productivity (Kg/Hectare)"
                    }
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {dataSource === "mock" && (
            <div
              className="mock-data-notice"
              style={{ fontSize: styles.fontSize }}
            >
              Note: The data displayed is mock data as the API request failed.
              The actual data may differ.
            </div>
          )}
        </>
      )}

      {/* Year comparison charts */}
      {showYearComparison && (
        <div className="year-comparison-container">
          <h2
            className="comparison-title"
            style={{ fontSize: styles.fontSize }}
          >
            {comparisonState
              ? `Yearly Comparison for ${comparisonState}`
              : "Select a State for Year Comparison"}
          </h2>

          <button
            onClick={() => fetchYearComparisonData()}
            className="fetch-comparison-data"
            style={{
              fontSize: styles.fontSize,
              ...styles.highContrast,
              marginTop: "10px",
              marginBottom: "15px",
            }}
          >
            {yearComparisonLoading ? "Loading..." : "Refresh Data"}
          </button>

          {yearComparisonLoading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p style={{ fontSize: styles.fontSize }}>
                Loading comparison data...
              </p>
            </div>
          )}

          {yearComparisonError && !yearComparisonLoading && (
            <div className="error-message" style={{ ...styles.highContrast }}>
              <p style={{ fontSize: styles.fontSize }}>{yearComparisonError}</p>
            </div>
          )}

          {!yearComparisonLoading &&
            !yearComparisonError &&
            yearComparisonData.length > 0 && (
              <div className="chart-container">
                <div className="chart-header">
                  <h3
                    className="chart-title"
                    style={{ fontSize: styles.fontSize }}
                  >
                    {getDataTypeDisplayName(yearComparisonDataType)} Trends for{" "}
                    {comparisonState} Across Years
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={yearComparisonData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="year"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: styles.fontSize === "1em" ? 12 : 14 }}
                      tickFormatter={formatYearRange}
                    />
                    <YAxis
                      tick={{ fontSize: styles.fontSize === "1em" ? 12 : 14 }}
                      label={{
                        value: getDataTypeDisplayName(yearComparisonDataType),
                        angle: -90,
                        position: "insideLeft",
                        style: {
                          fontSize: styles.fontSize === "1em" ? 12 : 14,
                        },
                      }}
                    />
                    <Tooltip
                      formatter={(value) => [
                        value.toLocaleString(),
                        getDataTypeDisplayName(yearComparisonDataType),
                      ]}
                      labelFormatter={formatYearRange}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: styles.fontSize === "1em" ? 12 : 14,
                      }}
                    />
                    <Bar
                      dataKey={yearComparisonDataType}
                      name={getDataTypeDisplayName(yearComparisonDataType)}
                    >
                      {yearComparisonData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="chart-description">
                  <p
                    style={{
                      fontSize: styles.fontSize,
                      marginTop: "10px",
                      textAlign: "center",
                    }}
                  >
                    This chart shows{" "}
                    {getDataTypeDisplayName(
                      yearComparisonDataType
                    ).toLowerCase()}{" "}
                    for {comparisonState} across all available years.
                  </p>
                  <p className="sr-only" aria-live="polite">
                    {getAccessibleChartSummary()}
                  </p>
                </div>
              </div>
            )}

          <div
            className="comparison-actions"
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              marginTop: "15px",
            }}
          >
            {yearComparisonData.length > 0 && (
              <button
                onClick={handleChartDownload}
                className="download-chart-button"
                style={{
                  fontSize: styles.fontSize,
                  ...styles.highContrast,
                  backgroundColor: "#4CAF50",
                }}
              >
                Download Chart
              </button>
            )}
            <button
              onClick={toggleYearComparison}
              className="close-comparison"
              style={{ fontSize: styles.fontSize, ...styles.highContrast }}
            >
              Close Comparison
            </button>
          </div>

          <button
            onClick={handleChartDownload}
            className="download-chart"
            style={{
              fontSize: styles.fontSize,
              ...styles.highContrast,
              marginTop: "10px",
            }}
          >
            Download Chart as Image
          </button>

          {/* Screen reader accessible summary */}
          <div className="sr-only">
            <p>{getAccessibleChartSummary()}</p>
          </div>
        </div>
      )}

      <div className="reference-note" style={{ fontSize: styles.fontSize }}>
        <p>
          <strong>Note:</strong> The Area, Production and Productivity of Sesame
          seed shows Anual statistics by state/UT for area under cultivation (in
          '000 Hectare), production (in '000 Tonne), and productivity (in
          Kg/Hectare).
        </p>
      </div>
    </div>
  );
};

export default APYData;
