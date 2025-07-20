/**
 * Comprehensive service for hybrids data
 * Provides both raw API access and transformed data for the frontend
 */

import {
  fetchHybridsApi,
  fetchHybridByIdApi,
  fetchHybridPropertiesApi,
} from "./api";
import { hybridsData } from "./hybridsData";

/**
 * Fetch all hybrids in raw format directly from API
 * @returns {Promise<Array>} Array of hybrid objects
 */
export const getRawHybrids = async () => {
  try {
    return await fetchHybridsApi();
  } catch (error) {
    console.error("Error in getRawHybrids:", error);
    throw error;
  }
};

/**
 * Fetch raw hybrid data by ID directly from API
 * @param {string} id The hybrid ID
 * @returns {Promise<Object>} Hybrid data with hybrid and properties properties
 */
export const getRawHybridById = async (id) => {
  try {
    return await fetchHybridByIdApi(id);
  } catch (error) {
    console.error("Error in getRawHybridById:", error);
    throw error;
  }
};

/**
 * Fetch raw properties for a hybrid directly from API
 * @param {string} hybridId The hybrid ID
 * @returns {Promise<Array>} Array of property objects
 */
export const getRawHybridProperties = async (hybridId) => {
  try {
    return await fetchHybridPropertiesApi(hybridId);
  } catch (error) {
    console.error("Error in getRawHybridProperties:", error);
    throw error;
  }
};

/**
 * Fetch all hybrids with fallback to mock data
 * @returns {Promise<Array>} Array of hybrid objects in frontend format
 */
export const getHybrids = async () => {
  try {
    // Try API first
    const apiHybrids = await fetchHybridsApi();
    return transformHybridsData(apiHybrids);
  } catch (error) {
    console.warn("API failed, using mock data:", error);
    return hybridsData;
  }
};

/**
 * Fetch hybrid by ID with properties, with fallback to mock data
 * @param {string} id The hybrid ID
 * @returns {Promise<Object>} Hybrid object in frontend format with properties
 */
export const getHybridById = async (id) => {
  try {
    // Try API first
    const apiResponse = await fetchHybridByIdApi(id);
    return transformHybridData(apiResponse);
  } catch (error) {
    console.warn("API failed, using mock data:", error);
    const mockHybrid = hybridsData.find((h) => h.id === id);
    if (!mockHybrid) {
      throw new Error(`Hybrid with id ${id} not found`);
    }
    return mockHybrid;
  }
};

/**
 * Transform API hybrid data to frontend format
 * @param {Array} apiHybrids Raw API hybrid data
 * @returns {Array} Transformed hybrid data for frontend
 */
const transformHybridsData = (apiHybrids) => {
  return apiHybrids.map((hybrid) => ({
    id: hybrid._id,
    name: hybrid.name,
    description: hybrid.description,
    image: null, // Will be populated from properties
    details: {}, // Will be populated from properties
    createdAt: hybrid.createdAt,
    updatedAt: hybrid.updatedAt,
  }));
};

/**
 * Transform API hybrid data with properties to frontend format
 * @param {Object} apiResponse API response with hybrid and properties
 * @returns {Object} Transformed hybrid data for frontend
 */
const transformHybridData = (apiResponse) => {
  const { hybrid, properties } = apiResponse;

  // Convert properties array to details object and extract image
  const details = {};
  let image = null;

  properties.forEach((prop) => {
    if (prop.valueType === "image" && prop.name === "image") {
      image = prop.value;
    } else {
      details[prop.name] = prop.value;
    }
  });

  return {
    id: hybrid._id,
    name: hybrid.name,
    description: hybrid.description,
    image,
    details,
    createdAt: hybrid.createdAt,
    updatedAt: hybrid.updatedAt,
  };
};

/**
 * Get hybrid properties in raw format
 * @param {string} hybridId The hybrid ID
 * @returns {Promise<Array>} Array of property objects
 */
export const getHybridProperties = async (hybridId) => {
  try {
    return await fetchHybridPropertiesApi(hybridId);
  } catch (error) {
    console.error("Error fetching hybrid properties:", error);
    throw error;
  }
};

/**
 * Get only image properties for hybrids
 * @returns {Promise<Array>} Array of image URLs
 */
export const getHybridImages = async () => {
  try {
    const hybrids = await fetchHybridsApi();
    const imagePromises = hybrids.map(async (hybrid) => {
      try {
        const properties = await fetchHybridPropertiesApi(hybrid._id);
        const imageProperty = properties.find(
          (prop) => prop.valueType === "image" && prop.name === "image"
        );
        return imageProperty ? imageProperty.value : null;
      } catch (error) {
        console.warn(`Failed to fetch properties for hybrid ${hybrid._id}`);
        return null;
      }
    });

    const images = await Promise.all(imagePromises);
    return images.filter((img) => img !== null);
  } catch (error) {
    console.error("Error fetching hybrid images:", error);
    // Return mock images as fallback
    return hybridsData.map((hybrid) => hybrid.image).filter(Boolean);
  }
};
