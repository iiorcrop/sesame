/**
 * Comprehensive service for varieties data
 * Provides both raw API access and transformed data for the frontend
 */

import {
  fetchVarietiesApi,
  fetchVarietyByIdApi,
  fetchVarietyPropertiesApi,
} from "./api";
import { varietiesData } from "./varietiesData";

/**
 * Fetch all varieties in raw format directly from API
 * @returns {Promise<Array>} Array of variety objects
 */
export const getRawVarieties = async () => {
  try {
    return await fetchVarietiesApi();
  } catch (error) {
    console.error("Error in getRawVarieties:", error);
    throw error;
  }
};

/**
 * Fetch raw variety data by ID directly from API
 * @param {string} id The variety ID
 * @returns {Promise<Object>} Variety data with variety and properties properties
 */
export const getRawVarietyById = async (id) => {
  try {
    return await fetchVarietyByIdApi(id);
  } catch (error) {
    console.error("Error in getRawVarietyById:", error);
    throw error;
  }
};

/**
 * Fetch raw properties for a variety directly from API
 * @param {string} varietyId The variety ID
 * @returns {Promise<Array>} Array of property objects
 */
export const getRawVarietyProperties = async (varietyId) => {
  try {
    return await fetchVarietyPropertiesApi(varietyId);
  } catch (error) {
    console.error("Error in getRawVarietyProperties:", error);
    throw error;
  }
};

/**
 * Transform raw variety data to the format expected by frontend components
 * @param {Object} variety Raw variety object
 * @param {Array} properties Raw properties array
 * @returns {Object} Transformed variety object
 */
export const transformVarietyData = (variety, properties) => {
  // Find name and image properties
  const nameProperty = properties.find((p) => p.name === "name");
  const imageProperty = properties.find((p) => p.name === "image");

  // Create details object from other properties
  const details = {};
  properties.forEach((prop) => {
    if (prop.name !== "name" && prop.name !== "image") {
      details[prop.name] = prop.value;
    }
  });

  return {
    id: variety._id,
    name: variety.name,
    image: imageProperty ? imageProperty.value : "/default-variety-image.jpg",
    details: details,
  };
};

/**
 * Enhanced fetchVarieties with better error handling and more features
 * @param {Object} options Additional options
 * @returns {Promise<Array>} Array of transformed variety objects
 */
export const getVarieties = async (options = {}) => {
  const { useFallback = true } = options;

  try {
    // Get all varieties
    const varieties = await fetchVarietiesApi();

    const transformedData = await Promise.all(
      varieties.map(async (variety) => {
        try {
          // Fetch properties for each variety
          const properties = await fetchVarietyPropertiesApi(variety._id);
          return transformVarietyData(variety, properties);
        } catch (error) {
          console.warn(
            `Error fetching properties for variety ${variety.name}:`,
            error
          );
          // Return basic variety data without full properties
          return {
            id: variety._id,
            name: variety.name,
            image: "/default-variety-image.jpg",
            details: { error: "Failed to load variety details" },
          };
        }
      })
    );

    return transformedData;
  } catch (error) {
    console.error("Error fetching varieties:", error);

    // Return fallback data if requested and available
    if (useFallback && varietiesData) {
      console.warn("Using fallback variety data");
      return varietiesData;
    }

    // Re-throw if no fallback or fallback not wanted
    throw error;
  }
};

/**
 * Enhanced fetchVarietyById with better error handling
 * @param {string} id The variety ID
 * @param {Object} options Additional options
 * @returns {Promise<Object>} Transformed variety object
 */
export const getVarietyById = async (id, options = {}) => {
  const { useFallback = true } = options;

  try {
    // Get variety details from API
    const { variety, properties } = await fetchVarietyByIdApi(id);
    return transformVarietyData(variety, properties);
  } catch (error) {
    console.error(`Error fetching variety with ID ${id}:`, error);

    // Check for fallback data if requested
    if (useFallback && varietiesData) {
      console.warn("Checking fallback data for variety");
      const fallbackVariety = varietiesData.find((v) => v.id === id);

      if (fallbackVariety) {
        return fallbackVariety;
      }
    }

    // Re-throw if no fallback or fallback not available
    throw error;
  }
};
