import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  fetchMarketYears,
  fetchMarketDataForYear,
  fetchFiltersForYear,
} from "../../services/marketYearData";
import * as XLSX from "xlsx";
import "../../css/MarketData.css";
import "../../css/MarketYearData.css";
import "../../../css/MarketYearData.css";
import MultiSelectDropdown from "../../common/MultiSelectDropdown";

const MarketYearData = () => {
  const [marketYears, setMarketYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState("loading"); // 'api', 'mock', or 'loading'

  const [filters, setFilters] = useState({
    stateName: [],
    districtName: [],
    marketName: [],
    variety: "",
    reportedDateFrom: "",
    reportedDateTo: "",
  });

  const [uniqueValues, setUniqueValues] = useState({
    stateName: [],
    districtName: [],
    marketName: [],
    variety: [],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const itemsPerPageOptions = [10, 25, 50, 100];

  const resetFilters = () => {
    setFilters({
      stateName: [],
      districtName: [],
      marketName: [],
      variety: "",
      reportedDateFrom: "",
      reportedDateTo: "",
    });
    // Fetch all filters without any restrictions
    fetchFiltersForSelectedYear();
    // Fetch data after resetting filters
    setTimeout(() => fetchDataForSelectedYear(), 0);
  };

  // Fetch market years when the component mounts
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const data = await fetchMarketYears();
        setMarketYears(data);

        // Set the most recent year as the default selected year
        if (data && data.length > 0) {
          const sortedYears = [...data].sort((a, b) => b.year - a.year);
          setSelectedYear(sortedYears[0].year);
        }
      } catch (error) {
        console.error("Error fetching market years:", error);
        setError("Failed to load market years");
      }
    };

    fetchYears();
  }, []);

  // Fetch market data when selected year changes
  useEffect(() => {
    if (selectedYear) {
      setCurrentPage(1); // Reset to first page when year changes
      fetchDataForSelectedYear(1);
      fetchFiltersForSelectedYear();
    }
  }, [selectedYear]);

  const fetchDataForSelectedYear = async (page = currentPage) => {
    setLoading(true);
    setError(null);

    try {
      // Prepare filters for API request - convert empty strings to null
      const apiFilters = {
        page: page,
        limit: itemsPerPage,
      };

      Object.entries(filters).forEach(([key, value]) => {
        // Handle arrays (multi-select filters)
        if (Array.isArray(value) && value.length > 0) {
          // Join array values with commas for API query
          apiFilters[key] = value.join(",");
        } else if (value && !Array.isArray(value)) {
          // Handle single value filters
          apiFilters[key] = value;
        }
      });

      const response = await fetchMarketDataForYear(selectedYear, apiFilters);
      console.log("response", response);
      setMarketData(response.data || []);

      // Update pagination information
      if (response.total && response.totalPages) {
        setTotalItems(response.total);
        setTotalPages(response.totalPages);
        setCurrentPage(response.page || page);
      } else {
        // For mock data or when pagination info is not available
        setTotalItems(response.data.length);
        setTotalPages(1);
        setCurrentPage(1);
      }

      // Check if the data is from API or mock
      const isMockData = !response.success;
      setDataSource(isMockData ? "mock" : "api");
    } catch (error) {
      console.error(
        `Error fetching market data for year ${selectedYear}:`,
        error
      );
      setError(`Failed to load market data for year ${selectedYear}`);
      setMarketData([]);
      setTotalPages(1);
      setCurrentPage(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiltersForSelectedYear = async (cascadingFilters = {}) => {
    try {
      const filters = await fetchFiltersForYear(selectedYear, cascadingFilters);
      console.log("filters", filters);
      setUniqueValues(filters);
    } catch (error) {
      console.error(`Error fetching filters for year ${selectedYear}:`, error);
    }
  };

  // Handle year selection change
  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    // The MultiSelectDropdown component already provides the selected values array in value
    setFilters((prevFilters) => {
      const newFilters = {
        ...prevFilters,
        [name]: value,
      };

      // Implement cascading logic
      if (name === "stateName") {
        // Reset district and market when state changes
        newFilters.districtName = [];
        newFilters.marketName = [];

        // Fetch filtered districts based on selected states
        if (value.length > 0) {
          fetchFiltersForSelectedYear({ stateName: value });
        } else {
          fetchFiltersForSelectedYear();
        }
      } else if (name === "districtName") {
        // Reset market when district changes
        newFilters.marketName = [];

        // Fetch filtered markets based on selected states and districts
        const queryParams = {};
        if (newFilters.stateName.length > 0) {
          queryParams.stateName = newFilters.stateName;
        }
        if (value.length > 0) {
          queryParams.districtName = value;
        }

        if (Object.keys(queryParams).length > 0) {
          fetchFiltersForSelectedYear(queryParams);
        } else {
          fetchFiltersForSelectedYear();
        }
      }

      return newFilters;
    });
  };

  // Clear specific filter
  const clearFilter = (filterName) => {
    setFilters((prevFilters) => {
      const newFilters = {
        ...prevFilters,
        [filterName]: [],
      };

      // Implement cascading logic for clearing filters
      if (filterName === "stateName") {
        // Clear district and market when state is cleared
        newFilters.districtName = [];
        newFilters.marketName = [];
        // Fetch all filters without any restrictions
        fetchFiltersForSelectedYear();
      } else if (filterName === "districtName") {
        // Clear market when district is cleared
        newFilters.marketName = [];
        // Fetch filters based on remaining state selection
        if (newFilters.stateName.length > 0) {
          fetchFiltersForSelectedYear({ stateName: newFilters.stateName });
        } else {
          fetchFiltersForSelectedYear();
        }
      } else if (filterName === "marketName") {
        // Just clear market, keep current filters
        const queryParams = {};
        if (newFilters.stateName.length > 0) {
          queryParams.stateName = newFilters.stateName;
        }
        if (newFilters.districtName.length > 0) {
          queryParams.districtName = newFilters.districtName;
        }

        if (Object.keys(queryParams).length > 0) {
          fetchFiltersForSelectedYear(queryParams);
        } else {
          fetchFiltersForSelectedYear();
        }
      }

      return newFilters;
    });
  };

  // Apply filters
  const applyFilters = () => {
    fetchDataForSelectedYear();
  };

  // State to store unique values for dropdown filters

  // Extract unique values for dropdown filters
  useEffect(() => {
    if (marketData && marketData.length > 0) {
      // const extractedValues = {
      //   stateName: [...new Set(marketData.map((item) => item.stateName))],
      //   districtName: [...new Set(marketData.map((item) => item.districtName))],
      //   marketName: [...new Set(marketData.map((item) => item.marketName))],
      //   variety: [...new Set(marketData.map((item) => item.variety))],
      // };
      // // Sort the values alphabetically
      // Object.keys(extractedValues).forEach((key) => {
      //   extractedValues[key] = extractedValues[key].filter(Boolean).sort();
      // });
      // setUniqueValues(extractedValues);
    }
  }, [marketData]);

  // Download data as Excel
  const downloadExcel = () => {
    const ws_data = [];
    ws_data.push([
      "State",
      "District",
      "Market",
      "Variety",
      "Arrivals",
      "Min Price",
      "Max Price",
      "Modal Price",
      "Reported Date",
    ]);

    marketData.forEach((data) => {
      ws_data.push([
        data.stateName,
        data.districtName,
        data.marketName,
        data.variety,
        data.arrivals,
        data.minPrice,
        data.maxPrice,
        data.modalPrice,
        new Date(data.reportedDate).toLocaleDateString("en-GB"),
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Market Data ${selectedYear}`);
    XLSX.writeFile(wb, `market_data_${selectedYear}.xlsx`);
  };

  // Print table
  const printData = () => {
    let contentHTML = `<h1>Market Data - ${selectedYear}</h1>`;
    document.querySelectorAll(".market-year-data-table").forEach((table) => {
      contentHTML += table.outerHTML;
    });

    const newWin = window.open("");
    newWin.document.write(`
      <html>
        <head>
          <style>
            @media print {
              body {
                font-family: Arial, sans-serif;
              }
              table th, table td {
                border: 1px solid #000;
                padding: 5px;
                text-align: left;
                word-wrap: break-word;
              }
              table th {
                background-color: #f4f4f4;
                font-weight: bold;
              }
            }
          </style>
        </head>
        <body>
          ${contentHTML}
        </body>
      </html>
    `);

    newWin.document.close();
    newWin.print();
    newWin.close();
  };

  // Calculate paginated data
  const paginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return marketData.slice(startIndex, endIndex);
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchDataForSelectedYear(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
    setTimeout(() => fetchDataForSelectedYear(1), 0);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];

    if (totalPages <= 7) {
      // If total pages are 7 or less, show all page numbers
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);

      if (currentPage > 3) {
        // Add ellipsis if currentPage is far from the beginning
        pageNumbers.push("...");
      }

      // Add pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (currentPage < totalPages - 2) {
        // Add ellipsis if currentPage is far from the end
        pageNumbers.push("...");
      }

      // Always include last page
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <div className="market-year-data-container">
      <div className="relative flex items-center w-full my-4">
        <h1 className="text-3xl font-bold mb-0 absolute left-1/2 transform -translate-x-1/2">
          Market Data
        </h1>
        <Link
          to="/marketVisualizations"
          className="filter-button apply ml-auto"
        >
          Visualize
        </Link>
      </div>

      {dataSource === "mock" && (
        <div className="data-source-indicator mock">
          Note: Using mock data (API connection failed)
        </div>
      )}

      <div className="year-selector">
        <label htmlFor="year-select">Select Year: </label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={handleYearChange}
          className="year-select"
        >
          <option value="">Select Year</option>
          {marketYears.map((year) => (
            <option key={year._id} value={year.year}>
              {year.year}
            </option>
          ))}
        </select>
      </div>

      {selectedYear && (
        <div className="filter-section">
          <div className="filter-grid">
            <MultiSelectDropdown
              name="stateName"
              label="State:"
              value={filters.stateName}
              onChange={handleFilterChange}
              onClear={clearFilter}
              placeholder="All States"
              options={uniqueValues.stateName.map((state) => ({
                value: state,
                label: state,
              }))}
            />

            <MultiSelectDropdown
              name="districtName"
              label="District:"
              value={filters.districtName}
              onChange={handleFilterChange}
              onClear={clearFilter}
              placeholder="All Districts"
              options={uniqueValues.districtName
                // ?.filter(
                //   (district) =>
                //     filters.stateName.length === 0 ||
                //     marketData.some(
                //       (item) =>
                //         item.districtName === district &&
                //         filters.stateName.includes(item.stateName)
                //     )
                // )
                ?.map((district) => ({
                  value: district,
                  label: district,
                }))}
            />

            <MultiSelectDropdown
              name="marketName"
              label="Market:"
              value={filters.marketName}
              onChange={handleFilterChange}
              onClear={clearFilter}
              placeholder="All Markets"
              options={uniqueValues.marketName
                // ?.filter(
                //   (market) =>
                //     (filters.stateName.length === 0 ||
                //       marketData.some(
                //         (item) =>
                //           item.marketName === market &&
                //           filters.stateName.includes(item.stateName)
                //       )) &&
                //     (filters.districtName.length === 0 ||
                //       marketData.some(
                //         (item) =>
                //           item.marketName === market &&
                //           filters.districtName.includes(item.districtName)
                //       ))
                // )
                ?.map((market) => ({
                  value: market,
                  label: market,
                }))}
            />

            <div className="filter-item">
              <label htmlFor="variety">Variety:</label>
              <select
                id="variety"
                name="variety"
                value={filters.variety}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Varieties</option>
                {uniqueValues.variety?.map((variety) => (
                  <option key={variety} value={variety}>
                    {variety}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="reportedDateFrom">Date From:</label>
              <input
                type="date"
                id="reportedDateFrom"
                name="reportedDateFrom"
                value={filters.reportedDateFrom}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-item">
              <label htmlFor="reportedDateTo">Date To:</label>
              <input
                type="date"
                id="reportedDateTo"
                name="reportedDateTo"
                value={filters.reportedDateTo}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          <div className="filter-buttons">
            <button onClick={applyFilters} className="filter-button apply">
              Apply Filters
            </button>
            <button onClick={resetFilters} className="filter-button reset">
              Reset Filters
            </button>
          </div>
        </div>
      )}

      <div className="action-buttons">
        <button
          onClick={downloadExcel}
          disabled={!marketData.length}
          className="action-button"
        >
          Download Excel
        </button>
        <button
          onClick={printData}
          disabled={!marketData.length}
          className="action-button"
        >
          Print Data
        </button>
      </div>

      {loading ? (
        <div className="loading-message">
          Loading market data for {selectedYear}...
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : marketData.length === 0 ? (
        <div className="no-data-message">
          No market data available for the selected year.
        </div>
      ) : (
        <div className="market-data-table-container">
          <table className="market-year-data-table">
            <thead>
              <tr>
                <th>State</th>
                <th>District</th>
                <th>Market</th>
                <th>Variety</th>
                <th>Arrivals (Qtl)</th>
                <th>Min Price (₹/Qtl)</th>
                <th>Max Price (₹/Qtl)</th>
                <th>Modal Price (₹/Qtl)</th>
                <th>Reported Date</th>
              </tr>
            </thead>
            <tbody>
              {marketData.map((data) => (
                <tr key={data._id}>
                  <td>{data.stateName}</td>
                  <td>{data.districtName}</td>
                  <td>{data.marketName}</td>
                  <td>{data.variety}</td>
                  <td>{data.arrivals}</td>
                  <td>{data.minPrice}</td>
                  <td>{data.maxPrice}</td>
                  <td>{data.modalPrice}</td>
                  <td>
                    {new Date(data.reportedDate).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination controls */}
          <div className="pagination-controls">
            <div className="pagination-info">
              Page{" "}
              <strong>
                {currentPage} of {totalPages}
              </strong>{" "}
              ({totalItems} items)
            </div>
            <div className="pagination-actions">
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="items-per-page-select"
              >
                {itemsPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option} per page
                  </option>
                ))}
              </select>

              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Last
              </button>
            </div>

            {/* Page number buttons */}
            <div className="page-number-buttons">
              {getPageNumbers().map((number, index) =>
                number === "..." ? (
                  <span key={index} className="ellipsis">
                    ...
                  </span>
                ) : (
                  <button
                    key={number}
                    onClick={() => handlePageChange(number)}
                    className={`page-number-button ${
                      currentPage === number ? "active" : ""
                    }`}
                  >
                    {number}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketYearData;
