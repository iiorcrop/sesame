// Mock data for varieties - used as fallback when API fails
export const varietiesData = [
  {
    id: "gauch-1",
    name: "GAUCH-1 (VHB-44)",
    image: "/castor_varieties/gauch-1.jpg",
    details: {
      "Year of release": "1974",
      "Notified vide S.O. No. & date": "786 02-02-1976",
      "Released at Central or State level": "State",
      "Developed by": "Oilseeds Research Station, GAU, Junagadh",
      "Pedigree / type of material": "VP-1 x VI-9",
      "Recommended states": "Gujarat",
      "Recommended ecology": "Irrigated and rainfed conditions",
      Duration: "Early",
      "Days to maturity for first picking": "90 - 100 DAS",
      "Growth habit": "Medium",
      "Average seed yield (kg/ha)": "1520",
    },
  },
  {
    id: "gch-4",
    name: "GCH-4",
    image: "/castor_varieties/gch-4.jpg",
    details: {
      "Year of release": "1986",
      "Notified vide S.O. No. & date": "1135 30-11-1987",
      "Released at Central or State level": "State",
      "Developed by":
        "Main Castor & Mustard Research Station, GAU, S. K. Nagar",
      "Pedigree / type of material": "LRES-17 x JI-15",
      "Recommended states": "Gujarat",
      "Recommended ecology": "Irrigated and rainfed conditions",
      Duration: "Medium",
      "Days to maturity for first picking": "110 - 120 DAS",
      "Growth habit": "Tall",
      "Average seed yield (kg/ha)": "1800",
    },
  },
  {
    id: "gch-5",
    name: "GCH-5",
    image: "/castor_varieties/gch-5.jpg",
    details: {
      "Year of release": "1995",
      "Notified vide S.O. No. & date": "432 15-07-1996",
      "Released at Central or State level": "State",
      "Developed by":
        "Main Castor & Mustard Research Station, GAU, S. K. Nagar",
      "Pedigree / type of material": "VP-1 x JI-35",
      "Recommended states": "Gujarat",
      "Recommended ecology": "Irrigated conditions",
      Duration: "Medium",
      "Days to maturity for first picking": "115 - 130 DAS",
      "Growth habit": "Medium tall",
      "Average seed yield (kg/ha)": "2200",
    },
  },
  {
    id: "gch-6",
    name: "GCH-6",
    image: "/castor_varieties/gch-6.jpg",
    details: {
      "Year of release": "2004",
      "Notified vide S.O. No. & date": "1134 15-09-2004",
      "Released at Central or State level": "Central",
      "Developed by":
        "Main Castor & Mustard Research Station, SDAU, S. K. Nagar",
      "Pedigree / type of material": "SH-72 x JI-35",
      "Recommended states": "Gujarat, Rajasthan, Andhra Pradesh",
      "Recommended ecology": "Irrigated and rainfed conditions",
      Duration: "Medium",
      "Days to maturity for first picking": "110 - 120 DAS",
      "Growth habit": "Medium tall",
      "Average seed yield (kg/ha)": "2500",
    },
  },
  {
    id: "dcs-9",
    name: "DCS-9",
    image: "/castor_varieties/dcs-9.jpg",
    details: {
      "Year of release": "2004",
      "Notified vide S.O. No. & date": "1135 15-09-2004",
      "Released at Central or State level": "State",
      "Developed by": "AICRP on Castor, Directorate of Oilseeds Research",
      "Pedigree / type of material": "VP-1 x DPC-9",
      "Recommended states": "Andhra Pradesh",
      "Recommended ecology": "Rainfed conditions",
      Duration: "Medium",
      "Days to maturity for first picking": "100 - 110 DAS",
      "Growth habit": "Medium tall",
      "Average seed yield (kg/ha)": "1100",
    },
  },
  {
    id: "gch-7",
    name: "GCH-7",
    image: "/castor_varieties/gch-7.jpg",
    details: {
      "Year of release": "2011",
      "Notified vide S.O. No. & date": "2756 24-10-2012",
      "Released at Central or State level": "Central",
      "Developed by": "Castor & Mustard Research Station, SDAU, S. K. Nagar",
      "Pedigree / type of material": "MCI-7 x SH-72",
      "Recommended states": "Gujarat, Rajasthan, Tamil Nadu",
      "Recommended ecology": "Irrigated and rainfed conditions",
      Duration: "Medium",
      "Days to maturity for first picking": "120 - 130 DAS",
      "Growth habit": "Medium tall",
      "Average seed yield (kg/ha)": "2800",
    },
  },
];

import {
  fetchVarietiesApi,
  fetchVarietyByIdApi,
  fetchVarietyPropertiesApi,
} from "./api";

// API function to get all varieties
export const fetchVarieties = async () => {
  try {
    // Get all varieties from API
    const varieties = await fetchVarietiesApi();

    // Transform the data to match the expected format in the frontend
    return Promise.all(
      varieties.map(async (variety) => {
        try {
          // Fetch properties for each variety
          const properties = await fetchVarietyPropertiesApi(variety._id);

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
            image: imageProperty
              ? imageProperty.value
              : "/default-variety-image.jpg",
            details: details,
          };
        } catch (error) {
          console.error(
            `Error fetching properties for variety ${variety._id}:`,
            error
          );
          // Return basic variety info without properties if fetching properties fails
          return {
            id: variety._id,
            name: variety.name,
            image: "/default-variety-image.jpg",
            details: { note: "Failed to load variety details" },
          };
        }
      })
    );
  } catch (error) {
    console.error("Error fetching varieties:", error);
    // Fallback to mock data if API fails
    console.log("Falling back to mock data");
    return varietiesData;
  }
};

// API function to get a specific variety by ID
export const fetchVarietyById = async (id) => {
  try {
    // Get variety and properties from API
    const { variety, properties } = await fetchVarietyByIdApi(id);

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
  } catch (error) {
    console.error("Error fetching variety:", error);

    // Fallback to mock data if API fails
    const mockVariety = varietiesData.find((v) => v.id === id);
    if (mockVariety) {
      console.log("Falling back to mock data for variety");
      return mockVariety;
    }
    throw new Error("Variety not found");
  }
};
