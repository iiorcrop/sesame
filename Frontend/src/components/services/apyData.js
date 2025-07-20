// apyData.js
import { fetchAPYYearsApi, fetchAPYDataForYearApi } from "./api";

// Mock data for APY years - used as fallback when API fails
export const apyYearsMockData = [
  {
    _id: "mock-apy-year-2022-2023",
    year: "2022-2023",
    description: "APY data for the year 2022-2023",
    createdAt: "2023-04-01T00:00:00.000Z",
  },
  {
    _id: "mock-apy-year-2021-2022",
    year: "2021-2022",
    description: "APY data for the year 2021-2022",
    createdAt: "2022-04-01T00:00:00.000Z",
  },
  {
    _id: "mock-apy-year-2020-2021",
    year: "2020-2021",
    description: "APY data for the year 2020-2021",
    createdAt: "2021-04-01T00:00:00.000Z",
  },
];

// Mock data for APY data - used as fallback when API fails
export const apyDataMockForYear = {
  "2022-2023": [
    {
      _id: "mock-apy-2022-2023-1",
      state: "Andhra Pradesh",
      area: 13,
      production: 2,
      productivity: 127,
      importedFrom: "Excel",
      createdAt: "2023-04-01T00:00:00.000Z",
    },
    {
      _id: "mock-apy-2022-2023-2",
      state: "Bihar",
      area: 35,
      production: 14,
      productivity: 393,
      importedFrom: "Excel",
      createdAt: "2023-04-01T00:00:00.000Z",
    },
    {
      _id: "mock-apy-2022-2023-3",
      state: "Karnataka",
      area: 22,
      production: 4,
      productivity: 199,
      importedFrom: "Excel",
      createdAt: "2023-04-01T00:00:00.000Z",
    },
    {
      _id: "mock-apy-2022-2023-4",
      state: "Madhya Pradesh",
      area: 263,
      production: 44,
      productivity: 169,
      importedFrom: "Excel",
      createdAt: "2023-04-01T00:00:00.000Z",
    },
    {
      _id: "mock-apy-2022-2023-5",
      state: "Maharashtra",
      area: 80,
      production: 14,
      productivity: 175,
      importedFrom: "Excel",
      createdAt: "2023-04-01T00:00:00.000Z",
    },
    {
      _id: "mock-apy-2022-2023-6",
      state: "Odisha",
      area: 56,
      production: 20,
      productivity: 354,
      importedFrom: "Excel",
      createdAt: "2023-04-01T00:00:00.000Z",
    },
  ],
  "2021-2022": [
    {
      _id: "mock-apy-2021-2022-1",
      state: "Andhra Pradesh",
      area: 12,
      production: 1.8,
      productivity: 120,
      importedFrom: "Excel",
      createdAt: "2022-04-01T00:00:00.000Z",
    },
    {
      _id: "mock-apy-2021-2022-2",
      state: "Bihar",
      area: 33,
      production: 13,
      productivity: 380,
      importedFrom: "Excel",
      createdAt: "2022-04-01T00:00:00.000Z",
    },
    {
      _id: "mock-apy-2021-2022-3",
      state: "Karnataka",
      area: 20,
      production: 3.8,
      productivity: 190,
      importedFrom: "Excel",
      createdAt: "2022-04-01T00:00:00.000Z",
    },
  ],
  "2020-2021": [
    {
      _id: "mock-apy-2020-2021-1",
      state: "Andhra Pradesh",
      area: 11,
      production: 1.7,
      productivity: 115,
      importedFrom: "Excel",
      createdAt: "2021-04-01T00:00:00.000Z",
    },
    {
      _id: "mock-apy-2020-2021-2",
      state: "Bihar",
      area: 31,
      production: 12,
      productivity: 370,
      importedFrom: "Excel",
      createdAt: "2021-04-01T00:00:00.000Z",
    },
  ],
};

// Function to fetch APY years
export const fetchAPYYears = async () => {
  try {
    const response = await fetchAPYYearsApi();

    // Check if response has the expected structure
    if (response?.data) {
      // Return the years array directly
      return response.data;
    }
    throw new Error("Failed to fetch APY years");
  } catch (error) {
    console.error("Error fetching APY years, using mock data:", error);
    return apyYearsMockData; // Fallback to mock data
  }
};

// Fetch APY data for multiple years - useful for comparison
export const fetchAPYDataForMultipleYears = async (years, filters = {}) => {
  try {
    const promises = years.map((year) => fetchAPYDataForYear(year, filters));
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error("Error fetching data for multiple years:", error);
    throw error;
  }
};

// Function to fetch APY data for a specific year
export const fetchAPYDataForYear = async (year, filters = {}) => {
  try {
    const response = await fetchAPYDataForYearApi(year, filters);
    if (response?.data) {
      return {
        success: true,
        data: response.data,
        total: response.count || response.data.length,
        page: response.page || 1,
        totalPages: response.totalPages || 1,
      };
    }
    throw new Error(`Failed to fetch APY data for year ${year}`);
  } catch (error) {
    console.error(
      `Error fetching APY data for year ${year}, using mock data:`,
      error
    );
    // Fallback to mock data
    const mockData = apyDataMockForYear[year] || [];
    return {
      success: true,
      data: mockData,
      total: mockData.length,
      page: 1,
      totalPages: 1,
      dataSource: "mock",
    };
  }
};
