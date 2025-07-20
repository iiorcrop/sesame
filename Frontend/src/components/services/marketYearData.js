// marketYearData.js
import {
  fetchMarketYearsApi,
  fetchMarketYearApi,
  fetchMarketDataForYearApi,
  fetchFiltersForYearApi,
} from "./api";

// Mock data for market years - used as fallback when API fails
export const marketYearsMockData = [
  {
    _id: "mock-year-2023",
    year: "2023",
    description: "Market data for the year 2023",
    createdAt: "2023-01-01T00:00:00.000Z",
  },
  {
    _id: "mock-year-2022",
    year: "2022",
    description: "Market data for the year 2022",
    createdAt: "2022-01-01T00:00:00.000Z",
  },
  {
    _id: "mock-year-2021",
    year: "2021",
    description: "Market data for the year 2021",
    createdAt: "2021-01-01T00:00:00.000Z",
  },
];

// Mock data for market data - used as fallback when API fails
export const marketDataMockForYear = {
  2023: [
    {
      _id: "mock-data-2023-1",
      stateName: "Karnataka",
      districtName: "Bangalore",
      marketName: "Bangalore APMC",
      variety: "GCH-4",
      arrivals: "500",
      minPrice: "6000",
      maxPrice: "6500",
      modalPrice: "6250",
      reportedDate: "2023-06-15T00:00:00.000Z",
    },
    {
      _id: "mock-data-2023-2",
      stateName: "Gujarat",
      districtName: "Rajkot",
      marketName: "Rajkot APMC",
      variety: "GCH-7",
      arrivals: "750",
      minPrice: "5800",
      maxPrice: "6300",
      modalPrice: "6000",
      reportedDate: "2023-06-10T00:00:00.000Z",
    },
  ],
  2022: [
    {
      _id: "mock-data-2022-1",
      stateName: "Karnataka",
      districtName: "Bangalore",
      marketName: "Bangalore APMC",
      variety: "GCH-4",
      arrivals: "450",
      minPrice: "5800",
      maxPrice: "6300",
      modalPrice: "6000",
      reportedDate: "2022-06-15T00:00:00.000Z",
    },
    {
      _id: "mock-data-2022-2",
      stateName: "Gujarat",
      districtName: "Rajkot",
      marketName: "Rajkot APMC",
      variety: "GCH-7",
      arrivals: "700",
      minPrice: "5600",
      maxPrice: "6100",
      modalPrice: "5800",
      reportedDate: "2022-06-10T00:00:00.000Z",
    },
  ],
  2021: [
    {
      _id: "mock-data-2021-1",
      stateName: "Karnataka",
      districtName: "Bangalore",
      marketName: "Bangalore APMC",
      variety: "GCH-4",
      arrivals: "400",
      minPrice: "5600",
      maxPrice: "6100",
      modalPrice: "5800",
      reportedDate: "2021-06-15T00:00:00.000Z",
    },
    {
      _id: "mock-data-2021-2",
      stateName: "Gujarat",
      districtName: "Rajkot",
      marketName: "Rajkot APMC",
      variety: "GCH-7",
      arrivals: "650",
      minPrice: "5400",
      maxPrice: "5900",
      modalPrice: "5600",
      reportedDate: "2021-06-10T00:00:00.000Z",
    },
  ],
};

// Get all market years
export const fetchMarketYears = async () => {
  try {
    const response = await fetchMarketYearsApi();
    return response.data;
  } catch (error) {
    console.error("Error fetching market years:", error);
    // Fallback to mock data
    console.log("Falling back to mock market years data");
    return marketYearsMockData;
  }
};

// Get a specific market year by year
export const fetchMarketYear = async (year) => {
  try {
    const response = await fetchMarketYearApi(year);
    return response.data;
  } catch (error) {
    console.error(`Error fetching market year ${year}:`, error);
    // Fallback to mock data
    console.log(`Falling back to mock data for market year ${year}`);
    const mockYear = marketYearsMockData.find((y) => y.year === year);
    if (mockYear) {
      return mockYear;
    }
    throw new Error(`Market year ${year} not found`);
  }
};

// Get market data for a specific year
export const fetchMarketDataForYear = async (year, filters = {}) => {
  try {
    return await fetchMarketDataForYearApi(year, filters);
  } catch (error) {
    console.error(`Error fetching market data for year ${year}:`, error);
    // Fallback to mock data
    console.log(`Falling back to mock market data for year ${year}`);
    let mockData = marketDataMockForYear[year];

    if (mockData) {
      // Apply filters to mock data (simplified filtering)
      if (filters) {
        if (filters.stateName) {
          mockData = mockData.filter((item) =>
            item.stateName
              .toLowerCase()
              .includes(filters.stateName.toLowerCase())
          );
        }
        if (filters.districtName) {
          mockData = mockData.filter((item) =>
            item.districtName
              .toLowerCase()
              .includes(filters.districtName.toLowerCase())
          );
        }
        if (filters.marketName) {
          mockData = mockData.filter((item) =>
            item.marketName
              .toLowerCase()
              .includes(filters.marketName.toLowerCase())
          );
        }
        if (filters.variety) {
          mockData = mockData.filter((item) =>
            item.variety.toLowerCase().includes(filters.variety.toLowerCase())
          );
        }
        if (filters.reportedDateFrom) {
          const fromDate = new Date(filters.reportedDateFrom);
          mockData = mockData.filter(
            (item) => new Date(item.reportedDate) >= fromDate
          );
        }
        if (filters.reportedDateTo) {
          const toDate = new Date(filters.reportedDateTo);
          mockData = mockData.filter(
            (item) => new Date(item.reportedDate) <= toDate
          );
        }
      }

      // Handle pagination for mock data
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const total = mockData.length;
      const totalPages = Math.ceil(total / limit);

      // Get the current page of data
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = mockData.slice(startIndex, endIndex);

      return {
        success: false, // Indicate this is mock data
        count: paginatedData.length,
        total: total,
        page: page,
        totalPages: totalPages,
        data: paginatedData,
      };
    }
    throw new Error(`Market data for year ${year} not found`);
  }
};

export const fetchFiltersForYear = async (year, queryParams = {}) => {
  try {
    const response = await fetchFiltersForYearApi(year, queryParams);
    return response.filters;
  } catch (error) {
    console.error(`Error fetching filters for year ${year}:`, error);
    // Fallback to empty filters
    return {
      stateName: [],
      districtName: [],
      marketName: [],
      variety: [],
    };
  }
};
