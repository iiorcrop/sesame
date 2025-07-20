// ------ Resources API ------
export const getResources = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/resource`, { params });
    return response.data.resources || [];
  } catch (error) {
    console.error("Error fetching resources:", error);
    throw error;
  }
};
// ------ Media API ------
export const getMedia = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/media`, { params });
    return response.data.media || [];
  } catch (error) {
    console.error("Error fetching media:", error);
    throw error;
  }
};
// ------ Recurring Events API ------
export const getRecurringEvents = async () => {
  try {
    const response = await axios.get(`${API_URL}/recurring-events`);
    return response.data;
  } catch (error) {
    console.error("Error fetching recurring events:", error);
    throw error;
  }
};

export const getRecurringEventById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/recurring-events/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching recurring event by ID:", error);
    throw error;
  }
};

export const getRecurringEventImagesByYear = async (id, year) => {
  try {
    const response = await axios.get(
      `${API_URL}/recurring-events/${id}/images/${year}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching recurring event images by year:", error);
    throw error;
  }
};
// ------ Offerings API ------
export const getOfferings = async (type = "awards") => {
  try {
    const response = await axios.get(`${API_URL}/offerings?type=${type}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching offerings:", error);
    throw error;
  }
};
// ------ Committees API ------
export const getCommittees = async () => {
  try {
    const response = await axios.get(`${API_URL}/committees`);
    return response.data;
  } catch (error) {
    console.error("Error fetching committees:", error);
    throw error;
  }
};
// ------ Anual Reports API ------
export const getAnualReports = async () => {
  try {
    const response = await axios.get(`${API_URL}/anual-reports`);
    return response.data;
  } catch (error) {
    console.error("Error fetching anual reports:", error);
    throw error;
  }
};
// ------ Videos API ------
export const getVideos = async () => {
  try {
    const response = await axios.get(`${API_URL}/videos`);
    return response.data;
  } catch (error) {
    console.error("Error fetching videos:", error);
    throw error;
  }
};
// ------ News APIs ------
export const getNews = async () => {
  try {
    const response = await axios.get(`${API_URL}/news`);
    return response.data;
  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
};

export const getNewsById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/news/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching news by ID:", error);
    throw error;
  }
};

export const createNews = async (newsData) => {
  try {
    const response = await axios.post(`${API_URL}/news`, newsData);
    return response.data;
  } catch (error) {
    console.error("Error creating news:", error);
    throw error;
  }
};

export const updateNews = async (id, newsData) => {
  try {
    const response = await axios.put(`${API_URL}/news/${id}`, newsData);
    return response.data;
  } catch (error) {
    console.error("Error updating news:", error);
    throw error;
  }
};

export const deleteNews = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/news/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting news:", error);
    throw error;
  }
};
// src/api.js
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

const getFileApiUrl = () => {
  if (ENV === "production") {
    return import.meta.env.VITE_FILE_API_URL;
  }
  return `http://${window.location.hostname}:${
    import.meta.env.VITE_FILE_API_PORT || 3000
  }`;
};

// Base URLs
const BASE_URL = getApiUrl(); // Update with your backend URL

const IMG_URL = getFileApiUrl(); // Update with your file server URL
const API_URL = `${BASE_URL}/api`;

/* ------ Slider and Card APIs ------ */
export const fetchFiles = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/castorSlider`);
    return response.data.images;
  } catch (error) {
    throw new Error("Error fetching files.");
  }
};

export const fetchImages = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/castorCard`);
    return response.data.images;
  } catch (error) {
    console.error("Error fetching images:", error);
    throw error;
  }
};

export const fetchCardImages = async (type) => {
  try {
    const response = await axios.get(`${API_URL}/${type}/images`);

    return response.data.data;
  } catch (error) {
    console.error("Error fetching card images:", error);
    throw error;
  }
};

/* ------ Basic Info APIs ------ */
export const fetchCastorInfo = async () => {
  try {
    const response = await axios.get(`${API_URL}/aboutinfo`);
    return response.data;
  } catch (error) {
    console.error("Error fetching castor info:", error);
    throw error;
  }
};

export const fetchMainItems = async () => {
  try {
    const response = await axios.get(`${API_URL}/main-item`);
    return response.data.mainItems;
  } catch (error) {
    console.error("Error fetching main items:", error);
    throw error;
  }
};

export const fetchSubItems = async () => {
  try {
    const response = await axios.get(`${API_URL}/sub-item`);
    return response.data.subItems;
  } catch (error) {
    console.error("Error fetching sub items:", error);
    throw error;
  }
};

export const fetchSubSubItems = async () => {
  try {
    const response = await axios.get(`${API_URL}/sub-sub-item`);
    return response.data.subSubItems;
  } catch (error) {
    console.error("Error fetching sub-sub items:", error);
    throw error;
  }
};

/* ------ Market Data ------ */
export const fetchMarketData = async () => {
  try {
    const response = await axios.get(`${API_URL}/marketData`);
    return response.data;
  } catch (error) {
    console.error("Error fetching market data:", error);
    throw error;
  }
};

/* ------ Social Media ------ */
export const addSocialMediaUrl = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/create-social-media`, data);
    return response.data;
  } catch (error) {
    console.error("Error adding social media URL:", error);
    throw error;
  }
};

export const fetchSocialMediaUrls = async () => {
  try {
    const response = await axios.post(`${API_URL}/create-social-media`, {
      action: "getAll",
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching social media URLs:", error);
    throw error;
  }
};

/* ------ Event Card ------ */
export const fetchEventImg = async (type) => {
  try {
    const response = await axios.get(`${IMG_URL}/api/images?category=${type}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching event image:", error);
    throw error;
  }
};

/* ------ Survey Form ------ */
export const fetchSurveyFormInput = async () => {
  try {
    const response = await axios.get(`${API_URL}/inputs/list`);
    return response.data;
  } catch (error) {
    console.error("Error fetching form inputs:", error);
    throw error;
  }
};

export const submitFormResponse = async (formData) => {
  try {
    const response = await axios.post(
      `${API_URL}/form-responses/submit`,
      formData
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting form:", error);
    throw error;
  }
};

/* ------ Title ------ */
export const fetchMaintitle = async () => {
  try {
    const response = await axios.get(`${API_URL}/web/title`);
    return response.data;
  } catch (error) {
    console.error("Error fetching main title:", error);
    throw error;
  }
};

/* ------ Varieties ------ */
export const fetchVarietiesApi = async () => {
  try {
    const response = await axios.get(`${API_URL}/varieties`);
    if (response.data?.success) return response.data.data;
    throw new Error("Failed to fetch varieties");
  } catch (error) {
    console.error("Error fetching varieties:", error);
    throw error;
  }
};

export const fetchVarietyByIdApi = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/varieties/${id}`);
    if (response.data?.success) return response.data.data;
    throw new Error("Variety not found");
  } catch (error) {
    console.error("Error fetching variety by ID:", error);
    throw error;
  }
};

export const fetchVarietyPropertiesApi = async (varietyId) => {
  try {
    const response = await axios.get(
      `${API_URL}/varieties/${varietyId}/properties`
    );
    if (response.data?.success) return response.data.data;
    throw new Error("Failed to fetch variety properties");
  } catch (error) {
    console.error("Error fetching variety properties:", error);
    throw error;
  }
};

/* ------ Diseases ------ */
export const fetchDiseasesApi = async () => {
  try {
    const response = await axios.get(`${API_URL}/diseases`);
    if (response.data?.success) return response.data.data;
    throw new Error("Failed to fetch diseases");
  } catch (error) {
    console.error("Error fetching diseases:", error);
    throw error;
  }
};

export const fetchDiseaseByIdApi = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/diseases/${id}`);
    if (response.data?.success) return response.data.data;
    throw new Error("Disease not found");
  } catch (error) {
    console.error("Error fetching disease by ID:", error);
    throw error;
  }
};

export const fetchDiseasePropertiesApi = async (diseaseId) => {
  try {
    const response = await axios.get(
      `${API_URL}/diseases/${diseaseId}/properties`
    );
    if (response.data?.success) return response.data.data;
    throw new Error("Failed to fetch disease properties");
  } catch (error) {
    console.error("Error fetching disease properties:", error);
    throw error;
  }
};

/* ------ pests ------ */
export const fetchpestsApi = async () => {
  try {
    const response = await axios.get(`${API_URL}/pests`);
    if (response.data?.success) return response.data.data;
    throw new Error("Failed to fetch pests");
  } catch (error) {
    console.error("Error fetching pests:", error);
    throw error;
  }
};

export const fetchpestByIdApi = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/pests/${id}`);
    if (response.data?.success) return response.data.data;
    throw new Error("pest not found");
  } catch (error) {
    console.error("Error fetching pest by ID:", error);
    throw error;
  }
};

export const fetchpestPropertiesApi = async (pestId) => {
  try {
    const response = await axios.get(`${API_URL}/pests/${pestId}/properties`);
    if (response.data?.success) return response.data.data;
    throw new Error("Failed to fetch pest properties");
  } catch (error) {
    console.error("Error fetching pest properties:", error);
    throw error;
  }
};

/* ------ Hybrids ------ */
export const fetchHybridsApi = async () => {
  try {
    const response = await axios.get(`${API_URL}/hybrids`);
    if (response.data?.success) return response.data.data;
    throw new Error("Failed to fetch hybrids");
  } catch (error) {
    console.error("Error fetching hybrids:", error);
    throw error;
  }
};

export const fetchHybridByIdApi = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/hybrids/${id}`);
    if (response.data?.success) return response.data.data;
    throw new Error("Hybrid not found");
  } catch (error) {
    console.error("Error fetching hybrid by ID:", error);
    throw error;
  }
};

export const fetchHybridPropertiesApi = async (hybridId) => {
  try {
    const response = await axios.get(
      `${API_URL}/hybrids/${hybridId}/properties`
    );
    if (response.data?.success) return response.data.data;
    throw new Error("Failed to fetch hybrid properties");
  } catch (error) {
    console.error("Error fetching hybrid properties:", error);
    throw error;
  }
};

/* ------ Market Year ------ */
export const fetchMarketYearsApi = async () => {
  try {
    const response = await axios.get(`${API_URL}/market-years`);
    if (response.data?.success) return response.data;
    throw new Error("Failed to fetch market years");
  } catch (error) {
    console.error("Error fetching market years:", error);
    throw error;
  }
};

export const fetchMarketYearApi = async (year) => {
  try {
    const response = await axios.get(`${API_URL}/market-years/${year}`);
    if (response.data?.success) return response.data;
    throw new Error(`Market year ${year} not found`);
  } catch (error) {
    console.error(`Error fetching market year ${year}:`, error);
    throw error;
  }
};

export const fetchMarketDataForYearApi = async (year, filters = {}) => {
  try {
    const response = await axios.get(
      `${API_URL}/market-years/${year}/market-data`,
      {
        params: filters,
      }
    );
    if (response.data?.success) return response.data;
    throw new Error(`Failed to fetch market data for year ${year}`);
  } catch (error) {
    console.error(`Error fetching market data for year ${year}:`, error);
    throw error;
  }
};

export const fetchFiltersForYearApi = async (year, queryParams = {}) => {
  try {
    // Build query string from parameters
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        params.append(key, Array.isArray(value) ? value.join(",") : value);
      }
    });

    const queryString = params.toString();
    const url = `${API_URL}/market-years/${year}/get-filters${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await axios.get(url);
    if (response.data?.success) return response.data;
    throw new Error(`Failed to fetch filters for year ${year}`);
  } catch (error) {
    console.error(`Error fetching filters for year ${year}:`, error);
    throw error;
  }
};

/* ------ APY Data APIs ------ */
export const fetchAPYYearsApi = async () => {
  try {
    const response = await axios.get(`${API_URL}/apy-years`);
    if (response.data?.success) return response.data;
    throw new Error("Failed to fetch APY years");
  } catch (error) {
    console.error("Error fetching APY years:", error);
    throw error;
  }
};

export const fetchAPYDataForYearApi = async (year, filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/apy-years/${year}/apy-data`, {
      params: filters,
    });
    if (response.data?.success) return response.data;
    throw new Error(`Failed to fetch APY data for year ${year}`);
  } catch (error) {
    console.error(`Error fetching APY data for year ${year}:`, error);
    throw error;
  }
};

export const getFlashEvents = async () => {
  try {
    const response = await axios.get(`${API_URL}/flash-events`);
    return response.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

/* ------ Events API ------ */
export const getEvents = async (page = 1, limit = 10, year = null) => {
  try {
    let url = `${API_URL}/events?page=${page}&limit=${limit}`;
    if (year) {
      url += `&year=${year}`;
    }
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

export const getEventById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/events/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    throw error;
  }
};

export const getEventYears = async () => {
  try {
    const response = await axios.get(`${API_URL}/events/years`);
    return response.data;
  } catch (error) {
    console.error("Error fetching event years:", error);
    throw error;
  }
};

/* ------ Image Utils ------ */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // If it's already a full URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // If it's a relative path, construct full URL
  if (imagePath.startsWith("/")) {
    return `${IMG_URL}${imagePath}`;
  }

  // Default construction
  return `${IMG_URL}/${imagePath}`;
};

export const getEventImageUrl = (eventImage) => {
  return getImageUrl(eventImage);
};

export const getAddress = async () => {
  try {
    const response = await axios.get(`${API_URL}/address`);
    return response;
  } catch (error) {
    console.error("Error fetching address:", error);
    throw error;
  }
};

// fetch Flash News
export const getFlashNews = async () => {
  try {
    const response = await axios.get(`${API_URL}/flash-news`);
    return response;
  } catch (error) {
    console.error("Error fetching flash news:", error);
    throw error;
  }
};

export const fetchStaffDetails = async () => {
  try {
    const response = await axios.get(`${API_URL}/staff-details`);
    return response.data;
  } catch (error) {
    console.error("Error fetching staff details:", error);
    throw error;
  }
};
