import axios from "axios";

export const ENV = import.meta.env.VITE_ENV;

const getApiUrl = () => {
  console.log(ENV);

  if (ENV === "production") {
    console.log("Production environment detected");
    return import.meta.env.VITE_API_URL;
  }
  return `http://${window.location.hostname}:${
    import.meta.env.VITE_API_PORT || 5000
  }`;
};

const API_URL = getApiUrl() + "/api";

// Fetch all MSP data
export const fetchAllMSPData = async () => {
  try {
    const response = await axios.get(`${API_URL}/msp`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching MSP data:", error);
    throw error;
  }
};

// Fetch MSP chart data
export const fetchMSPChartData = async () => {
  try {
    const response = await axios.get(`${API_URL}/msp/chart`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching MSP chart data:", error);
    throw error;
  }
};

// Fetch MSP by year
export const fetchMSPByYear = async (year) => {
  try {
    const response = await axios.get(`${API_URL}/msp/${year}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching MSP for year ${year}:`, error);
    throw error;
  }
};

export default {
  fetchAllMSPData,
  fetchMSPChartData,
  fetchMSPByYear,
};
