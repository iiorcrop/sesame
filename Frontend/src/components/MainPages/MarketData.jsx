import React, { useState, useEffect } from 'react';
import { fetchMarketData } from '../services/api'; // Import the API function
import * as XLSX from 'xlsx';  // Import XLSX for Excel Export
import '../css/MarketData.css';

const MarketData = () => {
  const [marketData, setMarketData] = useState([]); // State to store fetched market data
  const [loading, setLoading] = useState(true); // Loading state to show a loader or message while fetching
  const [filters, setFilters] = useState({
    stateName: '',
    districtName: '',
    marketName: '',
    variety: '',
    arrivals: '',
    minPrice: '',
    maxPrice: '',
    modalPrice: '',
    reportedDateFrom: '',
    reportedDateTo: '', // New field for "To Date"
  });

  const resetFilters = () => {
    setFilters({
      stateName: '',
      districtName: '',
      marketName: '',
      variety: '',
      arrivals: '',
      minPrice: '',
      maxPrice: '',
      modalPrice: '',
      reportedDateFrom: '',
      reportedDateTo: '',
    });
  };

  const [uniqueValues, setUniqueValues] = useState({
    stateName: [],
    districtName: [],
    marketName: [],
    variety: [],
    arrivals: [],
    minPrice: [],
    maxPrice: [],
    modalPrice: [],
    reportedDate: [],
  });

  // Function to fetch data when the component is mounted
  const fetchData = async () => {
    setLoading(true);  // Set loading to true when the fetch starts
    try {
      const data = await fetchMarketData();  // Fetch market data using the API function
      setMarketData(data);  // Set the state with the fetched market data
    } catch (error) {
      console.error('Error fetching market data:', error);  // Handle any errors
    } finally {
      setLoading(false);  // Set loading to false once fetching is done
    }
  };

  // Extract unique values for filtering
  const extractUniqueValues = () => {
    const unique = {
      stateName: [...new Set(marketData.map(item => item.stateName))],
      districtName: [...new Set(marketData.map(item => item.districtName))],
      marketName: [...new Set(marketData.map(item => item.marketName))],
      variety: [...new Set(marketData.map(item => item.variety))],
      arrivals: [...new Set(marketData.map(item => item.arrivals))],
      minPrice: [...new Set(marketData.map(item => item.minPrice))],
      maxPrice: [...new Set(marketData.map(item => item.maxPrice))],
      modalPrice: [...new Set(marketData.map(item => item.modalPrice))],
      reportedDate: [
        ...new Set(
          marketData.map(item =>
            new Date(item.reportedDate).toLocaleDateString('en-GB') // Format as DD/MM/YYYY
          )
        ),
      ],
    };
    setUniqueValues(unique);
  };

  // useEffect hook to call fetchData when the component mounts
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array to run only once when the component mounts

  useEffect(() => {
    if (marketData.length > 0) {
      extractUniqueValues();
    }
  }, [marketData]);

  // Filter the data based on filters set by the user
  const filteredData = marketData.filter(row => {
    const reportedDate = new Date(row.reportedDate);
    const reportedDateStr = reportedDate.toLocaleDateString('en-GB');

    // Check if the reported date falls within the specified date range
    const fromDate = filters.reportedDateFrom ? new Date(filters.reportedDateFrom) : null;
    const toDate = filters.reportedDateTo ? new Date(filters.reportedDateTo) : null;
    const isValidDateRange =
      (!fromDate || reportedDate >= fromDate) && (!toDate || reportedDate <= toDate);

    return (
      (!filters.stateName || row.stateName.toLowerCase().includes(filters.stateName.toLowerCase())) &&
      (!filters.districtName || row.districtName.toLowerCase().includes(filters.districtName.toLowerCase())) &&
      (!filters.marketName || row.marketName.toLowerCase().includes(filters.marketName.toLowerCase())) &&
      (!filters.variety || row.variety.toLowerCase().includes(filters.variety.toLowerCase())) &&
      (!filters.arrivals || row.arrivals.toString().includes(filters.arrivals)) &&
      (filters.minPrice === '' || row.minPrice >= Number(filters.minPrice)) &&  // Ensure comparison is numeric
      (filters.maxPrice === '' || row.maxPrice <= Number(filters.maxPrice)) &&  // Ensure comparison is numeric
      (filters.modalPrice === '' || row.modalPrice === Number(filters.modalPrice)) &&  // Ensure comparison is numeric
      (filters.reportedDateFrom || filters.reportedDateTo ? isValidDateRange : true) // Apply date range filter
    );
  });

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Download Excel
  const downloadExcel = () => {
    const ws_data = [];
    ws_data.push(['State', 'District', 'Market', 'Variety', 'Arrivals', 'Min Price', 'Max Price', 'Modal Price', 'Reported Date']);

    filteredData.forEach((data) => {
      ws_data.push([
        data.stateName,
        data.districtName,
        data.marketName,
        data.variety,
        data.arrivals,
        data.minPrice,
        data.maxPrice,
        data.modalPrice,
        new Date(data.reportedDate).toLocaleDateString('en-GB'),
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Market Data');
    XLSX.writeFile(wb, 'market_data.xlsx');
  };

  // Print Table Function
  const printData = () => {
    let contentHTML = '<h1>Market Data</h1>';
    document.querySelectorAll('.MarketData_table').forEach(table => {
      contentHTML += table.outerHTML;
    });

    const newWin = window.open('');
    newWin.document.write(`
      <html>
        <head>
          <style>
            @media print {
              body {
                font-family: Arial, sans-serif;
              }
              .MarketData_table th, .MarketData_table td {
                border: 1px solid #000;
                padding: 5px;
                text-align: left;
                word-wrap: break-word;
              }
              .MarketData_table th {
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="MarketData_container">
      <div className="MarketData_filterContainer">
        {Object.keys(filters).map((filterKey) => (
          <div key={filterKey} className="MarketData_filterWrapper">
            <label htmlFor={filterKey}>
              {filterKey.replace(/([A-Z])/g, ' $1').toUpperCase()}:
            </label>
            {filterKey === 'reportedDateFrom' || filterKey === 'reportedDateTo' ? (
              <input
                type="date"
                name={filterKey}
                value={filters[filterKey]}
                onChange={handleFilterChange}
                className="MarketData_filterSelect"
              />
            ) : (
              <select
                name={filterKey}
                value={filters[filterKey]}
                onChange={handleFilterChange}
                className="MarketData_filterSelect"
                id={filterKey}
              >
                <option value="">All</option>
                {uniqueValues[filterKey].map((value, idx) => (
                  <option key={idx} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}

        <button onClick={resetFilters} className="MarketData_resetButton">
          Reset Filters
        </button>
      </div>

      <div className="MarketData_btnsContainer">
        <button onClick={downloadExcel} className="MarketData_button">
          Download Excel
        </button>
        <button onClick={printData} className="MarketData_button">
          Print Table
        </button>
      </div>

      <div className="MarketData_tableContainer">
        {filteredData.length > 0 ? (
          <div className="MarketData_tableWrapper">
            <table className="MarketData_table">
              <thead>
                <tr>
                  <th>State</th>
                  <th>District</th>
                  <th>Market</th>
                  <th>Variety</th>
                  <th>Reported Date</th> {/* Moved this after Variety */}
                  <th>Arrivals</th>
                  <th>Min Price</th>
                  <th>Max Price</th>
                  <th>Modal Price</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((data) => (
                  <tr key={data._id}>
                    <td>{data.stateName}</td>
                    <td>{data.districtName}</td>
                    <td>{data.marketName}</td>
                    <td>{data.variety}</td>
                    <td>
                      {data.reportedDate ? new Date(data.reportedDate).toLocaleDateString('en-GB') : ''}
                    </td> {/* Moved this after Variety */}
                    <td>{data.arrivals}</td>
                    <td>₹{data.minPrice}</td>
                    <td>₹{data.maxPrice}</td>
                    <td>₹{data.modalPrice}</td>
                  </tr>
                ))}
              </tbody>


            </table>
          </div>
        ) : (
          <p>No market data available</p>
        )}
      </div>
    </div>
  );
};

export default MarketData;


/* import React, { useState, useEffect } from 'react';
import { fetchMarketData } from '../services/api'; // Import the API function
import * as XLSX from 'xlsx';  // Import XLSX for Excel Export
import '../css/MarketData.css';

const MarketData = () => {
  const [marketData, setMarketData] = useState([]); // State to store fetched market data
  const [loading, setLoading] = useState(true); // Loading state to show a loader or message while fetching
  const [filters, setFilters] = useState({
    stateName: '',
    districtName: '',
    marketName: '',
    variety: '',
    arrivals: '',
    minPrice: '',
    maxPrice: '',
    modalPrice: '',
    reportedDate: '',
  });

  const resetFilters = () => {
    setFilters({
      stateName: '',
      districtName: '',
      marketName: '',
      variety: '',
      arrivals: '',
      minPrice: '',
      maxPrice: '',
      modalPrice: '',
      reportedDate: '',
    });
  };

  const [uniqueValues, setUniqueValues] = useState({
    stateName: [],
    districtName: [],
    marketName: [],
    variety: [],
    arrivals: [],
    minPrice: [],
    maxPrice: [],
    modalPrice: [],
    reportedDate: [],
  });

  // Function to fetch data when the component is mounted
  const fetchData = async () => {
    setLoading(true);  // Set loading to true when the fetch starts
    try {
      const data = await fetchMarketData();  // Fetch market data using the API function
      setMarketData(data);  // Set the state with the fetched market data
    } catch (error) {
      console.error('Error fetching market data:', error);  // Handle any errors
    } finally {
      setLoading(false);  // Set loading to false once fetching is done
    }
  };

  // Extract unique values for filtering
  const extractUniqueValues = () => {
    const unique = {
      stateName: [...new Set(marketData.map(item => item.stateName))],
      districtName: [...new Set(marketData.map(item => item.districtName))],
      marketName: [...new Set(marketData.map(item => item.marketName))],
      variety: [...new Set(marketData.map(item => item.variety))],
      arrivals: [...new Set(marketData.map(item => item.arrivals))],
      minPrice: [...new Set(marketData.map(item => item.minPrice))],
      maxPrice: [...new Set(marketData.map(item => item.maxPrice))],
      modalPrice: [...new Set(marketData.map(item => item.modalPrice))],
      reportedDate: [
        ...new Set(
          marketData.map(item =>
            new Date(item.reportedDate).toLocaleDateString('en-GB') // Format as DD/MM/YYYY
          )
        ),
      ],
    };
    setUniqueValues(unique);
  };

  // useEffect hook to call fetchData when the component mounts
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array to run only once when the component mounts

  useEffect(() => {
    if (marketData.length > 0) {
      extractUniqueValues();
    }
  }, [marketData]);

  // Filter the data based on filters set by the user
  const filteredData = marketData.filter(row => {
    return (
      (!filters.stateName || row.stateName.toLowerCase().includes(filters.stateName.toLowerCase())) &&
      (!filters.districtName || row.districtName.toLowerCase().includes(filters.districtName.toLowerCase())) &&
      (!filters.marketName || row.marketName.toLowerCase().includes(filters.marketName.toLowerCase())) &&
      (!filters.variety || row.variety.toLowerCase().includes(filters.variety.toLowerCase())) &&
      (!filters.arrivals || row.arrivals.toString().includes(filters.arrivals)) &&
      (filters.minPrice === '' || row.minPrice >= Number(filters.minPrice)) &&  // Ensure comparison is numeric
      (filters.maxPrice === '' || row.maxPrice <= Number(filters.maxPrice)) &&  // Ensure comparison is numeric
      (filters.modalPrice === '' || row.modalPrice === Number(filters.modalPrice)) &&  // Ensure comparison is numeric
      (!filters.reportedDate || new Date(row.reportedDate).toLocaleDateString('en-GB').includes(filters.reportedDate)) // Ensuring format is DD/MM/YYYY
    );
  });


  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Download Excel
  const downloadExcel = () => {
    const ws_data = [];
    ws_data.push(['State', 'District', 'Market', 'Variety', 'Arrivals', 'Min Price', 'Max Price', 'Modal Price', 'Reported Date']);

    filteredData.forEach((data) => {
      ws_data.push([
        data.stateName,
        data.districtName,
        data.marketName,
        data.variety,
        data.arrivals,
        data.minPrice,
        data.maxPrice,
        data.modalPrice,
        new Date(data.reportedDate).toLocaleDateString('en-GB'),
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Market Data');
    XLSX.writeFile(wb, 'market_data.xlsx');
  };

  // Print Table Function
  const printData = () => {
    let contentHTML = '<h1>Market Data</h1>';
    document.querySelectorAll('.MarketData_table').forEach(table => {
      contentHTML += table.outerHTML;
    });

    const newWin = window.open('');
    newWin.document.write(`
      <html>
        <head>
          <style>
            @media print {
              body {
                font-family: Arial, sans-serif;
              }
              .MarketData_table th, .MarketData_table td {
                border: 1px solid #000;
                padding: 5px;
                text-align: left;
                word-wrap: break-word;
              }
              .MarketData_table th {
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="MarketData_container">
      <div className="MarketData_filterContainer">
        {Object.keys(filters).map((filterKey) => (
          <div key={filterKey} className="MarketData_filterWrapper">
            <label htmlFor={filterKey}>
              {filterKey.replace(/([A-Z])/g, ' $1').toUpperCase()}:
            </label>
            <select
              name={filterKey}
              value={filters[filterKey]}
              onChange={handleFilterChange}
              className="MarketData_filterSelect"
              id={filterKey}
            >
              <option value="">All</option>
              {filterKey === "arrivals" || filterKey === "minPrice" || filterKey === "maxPrice" || filterKey === "modalPrice" || filterKey === "reportedDate" ? (
                uniqueValues[filterKey].map((value, idx) => (
                  <option key={idx} value={value}>
                    {filterKey === "reportedDate" ? value : value}
                  </option>
                ))
              ) : (
                uniqueValues[filterKey].map((value, idx) => (
                  <option key={idx} value={value}>
                    {value}
                  </option>
                ))
              )}
            </select>
          </div>
        ))}

        <button onClick={resetFilters} className="MarketData_resetButton">
          Reset Filters
        </button>
      </div>

      <div className="MarketData_btnsContainer">
        <button onClick={downloadExcel} className="MarketData_button">
          Download Excel
        </button>
        <button onClick={printData} className="MarketData_button">
          Print Table
        </button>
      </div>

      <div className="MarketData_tableContainer">
        {filteredData.length > 0 ? (
          <div className="MarketData_tableWrapper">
            <table className="MarketData_table">
              <thead>
                <tr>
                  <th>State</th>
                  <th>District</th>
                  <th>Market</th>
                  <th>Variety</th>
                  <th>Arrivals</th>
                  <th>Min Price</th>
                  <th>Max Price</th>
                  <th>Modal Price</th>
                  <th>Reported Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((data) => (
                  <tr key={data._id}>
                    <td>{data.stateName}</td>
                    <td>{data.districtName}</td>
                    <td>{data.marketName}</td>
                    <td>{data.variety}</td>
                    <td>{data.arrivals}</td>
                    <td>₹{data.minPrice}</td>
                    <td>₹{data.maxPrice}</td>
                    <td>₹{data.modalPrice}</td>
                    <td>
                      {data.reportedDate ? new Date(data.reportedDate).toLocaleDateString('en-GB') : ''}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        ) : (
          <p>No market data available</p>
        )}
      </div>
    </div>
  );
};

export default MarketData;
 */

/* import React, { useState, useEffect } from 'react';
import { fetchMarketData } from '../Services/api'; // Import the API function
import * as XLSX from 'xlsx';  // Import XLSX for Excel Export
import '../css/MarketData.css'; 

const MarketData = () => {
  const [marketData, setMarketData] = useState([]); // State to store fetched market data
  const [loading, setLoading] = useState(true); // Loading state to show a loader or message while fetching
  const [filters, setFilters] = useState({
    stateName: '',
    districtName: '',
    marketName: '',
    variety: '',
    arrivals: '',
    minPrice: '',
    maxPrice: '',
    modalPrice: '',
    reportedDate: '',
  });

  const resetFilters = () => {
    setFilters({
      stateName: '',
      districtName: '',
      marketName: '',
      variety: '',
      arrivals: '',
      minPrice: '',
      maxPrice: '',
      modalPrice: '',
      reportedDate: '',
    });
  };

  const [uniqueValues, setUniqueValues] = useState({
    stateName: [],
    districtName: [],
    marketName: [],
    variety: [],
  });

  // Function to fetch data when the component is mounted
  const fetchData = async () => {
    setLoading(true);  // Set loading to true when the fetch starts
    try {
      const data = await fetchMarketData();  // Fetch market data using the API function
      setMarketData(data);  // Set the state with the fetched market data
    } catch (error) {
      console.error('Error fetching market data:', error);  // Handle any errors
    } finally {
      setLoading(false);  // Set loading to false once fetching is done
    }
  };

  // Extract unique values for filtering
  const extractUniqueValues = () => {
    const unique = {
      stateName: [...new Set(marketData.map(item => item.stateName))],
      districtName: [...new Set(marketData.map(item => item.districtName))],
      marketName: [...new Set(marketData.map(item => item.marketName))],
      variety: [...new Set(marketData.map(item => item.variety))],
    };
    setUniqueValues(unique);
  };

  // useEffect hook to call fetchData when the component mounts
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array to run only once when the component mounts

  useEffect(() => {
    if (marketData.length > 0) {
      extractUniqueValues();
    }
  }, [marketData]);

  // Filter the data based on filters set by the user
  const filteredData = marketData.filter(row => {
    return (
      (!filters.stateName || row.stateName.toLowerCase().includes(filters.stateName.toLowerCase())) &&
      (!filters.districtName || row.districtName.toLowerCase().includes(filters.districtName.toLowerCase())) &&
      (!filters.marketName || row.marketName.toLowerCase().includes(filters.marketName.toLowerCase())) &&
      (!filters.variety || row.variety.toLowerCase().includes(filters.variety.toLowerCase())) &&
      (!filters.arrivals || row.arrivals.toString().includes(filters.arrivals)) &&
      (!filters.minPrice || row.minPrice.toString().includes(filters.minPrice)) &&
      (!filters.maxPrice || row.maxPrice.toString().includes(filters.maxPrice)) &&
      (!filters.modalPrice || row.modalPrice.toString().includes(filters.modalPrice)) &&
      (!filters.reportedDate || new Date(row.reportedDate).toLocaleDateString().includes(filters.reportedDate))
    );
  });

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Download Excel
  const downloadExcel = () => {
    const ws_data = [];
    ws_data.push(['State', 'District', 'Market', 'Variety', 'Arrivals', 'Min Price', 'Max Price', 'Modal Price', 'Reported Date']);
    
    filteredData.forEach((data) => {
      ws_data.push([
        data.stateName,
        data.districtName,
        data.marketName,
        data.variety,
        data.arrivals,
        data.minPrice,
        data.maxPrice,
        data.modalPrice,
        new Date(data.reportedDate).toLocaleDateString(),
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Market Data');
    XLSX.writeFile(wb, 'market_data.xlsx');
  };

  // Print Table Function
  const printData = () => {
    // Create a container for the print content
    let contentHTML = '<h1 style="text-align:center;">Market Data</h1>'; // Title with center alignment
    document.querySelectorAll('.MarketData_table').forEach(table => {
      contentHTML += table.outerHTML; // Append the HTML of the tables
    });

    // Open a new window for the print dialog
    const newWin = window.open('');
    newWin.document.write(`
      <html>
        <head>
          <style>
            @media print {
              body {
                font-family: Arial, sans-serif;
                margin: 10mm;
              }
              h1 {
                margin-bottom: 5mm; 
              }
              .MarketData_table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 10mm;
                page-break-before: always;
              }
              .MarketData_table th, .MarketData_table td {
                border: 1px solid #000;
                padding: 5px;
                text-align: left;
                word-wrap: break-word;
              }
              .MarketData_table th {
                background-color: #f4f4f4;
                font-weight: bold;
              }
              @page {
                size: auto;
                margin: 0mm; 
              }
            }
          </style>
        </head>
        <body>
          ${contentHTML}
        </body>
      </html>
    `);

    // Close the document and trigger the print dialog
    newWin.document.close();
    newWin.print();
    newWin.close();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="MarketData_container">
      <div className="MarketData_filterContainer">
        {Object.keys(filters).map((filterKey) => (
          <div key={filterKey} className="MarketData_filterWrapper">
            <label htmlFor={filterKey}>
              {filterKey.replace(/([A-Z])/g, ' $1').toUpperCase()}:
            </label>
            <select
              name={filterKey}
              value={filters[filterKey]}
              onChange={handleFilterChange}
              className="MarketData_filterSelect"
              id={filterKey}
            >
              <option value="">All</option>
              {filterKey === "arrivals" || filterKey === "minPrice" || filterKey === "maxPrice" || filterKey === "modalPrice" || filterKey === "reportedDate" ? (
                <option value="">All</option> 
              ) : (
                uniqueValues[filterKey].map((value, idx) => (
                  <option key={idx} value={value}>
                    {value}
                  </option>
                ))
              )}
            </select>
          </div>
        ))}

        <button onClick={resetFilters} className="MarketData_resetButton">
          Reset Filters
        </button>
      </div>

      <div className="MarketData_btnsContainer">
        <button onClick={downloadExcel} className="MarketData_button">
          Download Excel
        </button>
        <button onClick={printData} className="MarketData_button">
          Print Table
        </button>
      </div>

      <div className="MarketData_tableContainer">
        {filteredData.length > 0 ? (
          <div className="MarketData_tableWrapper">
            <table className="MarketData_table">
              <thead>
                <tr>
                  <th>State</th>
                  <th>District</th>
                  <th>Market</th>
                  <th>Variety</th>
                  <th>Arrivals</th>
                  <th>Min Price</th>
                  <th>Max Price</th>
                  <th>Modal Price</th>
                  <th>Reported Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((data) => (
                  <tr key={data._id}>
                    <td>{data.stateName}</td>
                    <td>{data.districtName}</td>
                    <td>{data.marketName}</td>
                    <td>{data.variety}</td>
                    <td>{data.arrivals}</td>
                    <td>₹{data.minPrice}</td>
                    <td>₹{data.maxPrice}</td>
                    <td>₹{data.modalPrice}</td>
                    <td>{new Date(data.reportedDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No market data available</p>
        )}
      </div>
    </div>
  );
};

export default MarketData;
 */


/* import React, { useState, useEffect } from 'react';
import { fetchMarketData } from '../Services/api'; // Import the API function

const MarketData = () => {
  const [marketData, setMarketData] = useState([]); // State to store fetched market data
  const [loading, setLoading] = useState(true); // Loading state to show a loader or message while fetching

  // Function to fetch data when the component is mounted
  const fetchData = async () => {
    setLoading(true);  // Set loading to true when the fetch starts
    try {
      const data = await fetchMarketData();  // Fetch market data using the API function
      setMarketData(data);  // Set the state with the fetched market data
    } catch (error) {
      console.error('Error fetching market data:', error);  // Handle any errors
    } finally {
      setLoading(false);  // Set loading to false once fetching is done
    }
  };

  // useEffect hook to call fetchData when the component mounts
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array to run only once when the component mounts

  return (
    <div>
      {loading ? (  // Conditional rendering based on loading state
        <p>Loading market data...</p>
      ) : (
        // Render market data once it has been fetched
        marketData.length > 0 ? (
          marketData.map((data) => (
            <div key={data._id}>
              <p><strong>State:</strong> {data.stateName}</p>
              <p><strong>District:</strong> {data.districtName}</p>
              <p><strong>Market:</strong> {data.marketName}</p>
              <p><strong>Variety:</strong> {data.variety}</p>
              <p><strong>Arrivals:</strong> {data.arrivals}</p>
              <p><strong>Min Price:</strong> ₹{data.minPrice}</p>
              <p><strong>Max Price:</strong> ₹{data.maxPrice}</p>
              <p><strong>Modal Price:</strong> ₹{data.modalPrice}</p>
              <p><strong>Reported Date:</strong> {new Date(data.reportedDate).toLocaleDateString()}</p>
            </div>
          ))
        ) : (
          <p>No market data available</p>
        )
      )}
    </div>
  );
};

export default MarketData;
 */