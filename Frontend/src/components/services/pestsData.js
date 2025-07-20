// Mock data for pests - used as fallback when API fails
export const pestsData = [
  {
    id: "gch-8",
    name: "GCH-8",
    image: "/castor_pests/gch-8.jpg",
    details: {
      "Year of release": "2017",
      "Notified vide S.O. No. & date": "3359 15-10-2017",
      "Released at Central or State level": "Central",
      "Developed by": "ICAR-Indian Institute of Oilseeds Research, Hyderabad",
      "Pedigree / type of material": "DPC-9 x ICS-38",
      "Recommended states": "All castor growing states",
      "Recommended ecology": "Irrigated and rainfed conditions",
      Duration: "Medium",
      "Days to maturity for first picking": "125-135 DAS",
      "Growth habit": "Medium tall",
      "Average seed yield (kg/ha)": "3000",
    },
  },
  {
    id: "ych-2",
    name: "YCH-2",
    image: "/castor_pests/ych-2.jpg",
    details: {
      "Year of release": "2015",
      "Notified vide S.O. No. & date": "2228 09-07-2016",
      "Released at Central or State level": "State",
      "Developed by": "AICRP on Castor, Yethapur",
      "Pedigree / type of material": "YTP-6 x TMV-5",
      "Recommended states": "Tamil Nadu",
      "Recommended ecology": "Irrigated conditions",
      Duration: "Medium-long",
      "Days to maturity for first picking": "135-145 DAS",
      "Growth habit": "Tall",
      "Average seed yield (kg/ha)": "2700",
    },
  },
  {
    id: "ich-66",
    name: "ICH-66",
    image: "/castor_pests/ich-66.jpg",
    details: {
      "Year of release": "2019",
      "Notified vide S.O. No. & date": "4543 23-12-2019",
      "Released at Central or State level": "Central",
      "Developed by": "ICAR-Indian Institute of Oilseeds Research, Hyderabad",
      "Pedigree / type of material": "ICS-67 x IPC-11",
      "Recommended states": "All castor growing states",
      "Recommended ecology": "Irrigated and rainfed conditions",
      Duration: "Early-medium",
      "Days to maturity for first picking": "115-125 DAS",
      "Growth habit": "Medium height",
      "Average seed yield (kg/ha)": "2900",
    },
  },
  {
    id: "dch-519",
    name: "DCH-519",
    image: "/castor_pests/dch-519.jpg",
    details: {
      "Year of release": "2015",
      "Notified vide S.O. No. & date": "1789 11-06-2016",
      "Released at Central or State level": "State",
      "Developed by": "UAS, Dharwad",
      "Pedigree / type of material": "DCS-94 x DCS-89",
      "Recommended states": "Karnataka",
      "Recommended ecology": "Irrigated conditions",
      Duration: "Medium",
      "Days to maturity for first picking": "125-135 DAS",
      "Growth habit": "Tall",
      "Average seed yield (kg/ha)": "2800",
    },
  },
  {
    id: "tch-1",
    name: "TCH-1",
    image: "/castor_pests/tch-1.jpg",
    details: {
      "Year of release": "2016",
      "Notified vide S.O. No. & date": "2952 13-09-2016",
      "Released at Central or State level": "State",
      "Developed by": "ARS, Tindivanam, TNAU",
      "Pedigree / type of material": "TMV-6 x TMV-5",
      "Recommended states": "Tamil Nadu",
      "Recommended ecology": "Rainfed conditions",
      Duration: "Medium",
      "Days to maturity for first picking": "120-130 DAS",
      "Growth habit": "Medium tall",
      "Average seed yield (kg/ha)": "2500",
    },
  },
];

import { fetchpestsApi, fetchpestByIdApi, fetchpestPropertiesApi } from "./api";

// API function to get all pests
export const fetchpests = async () => {
  try {
    // Get all pests from API
    const pests = await fetchpestsApi();

    // Transform the data to match the expected format in the frontend
    return Promise.all(
      pests.map(async (pest) => {
        try {
          // Fetch properties for each pest
          const properties = await fetchpestPropertiesApi(pest._id);

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
            id: pest._id,
            name: pest.name,
            image: imageProperty
              ? imageProperty.value
              : "/default-pest-image.jpg",
            details: details,
          };
        } catch (error) {
          console.error(
            `Error fetching properties for pest ${pest._id}:`,
            error
          );
          // Return basic pest info without properties if fetching properties fails
          return {
            id: pest._id,
            name: pest.name,
            image: "/default-pest-image.jpg",
            details: { note: "Failed to load pest details" },
          };
        }
      })
    );
  } catch (error) {
    console.error("Error fetching pests:", error);
    // Fallback to mock data if API fails
    console.log("Falling back to mock data");
    return pestsData;
  }
};

// API function to get a specific pest by ID
export const fetchpestById = async (id) => {
  try {
    // Get pest and properties from API
    const { pest, properties } = await fetchpestByIdApi(id);

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
      id: pest._id,
      name: pest.name,
      image: imageProperty ? imageProperty.value : "/default-pest-image.jpg",
      details: details,
    };
  } catch (error) {
    console.error("Error fetching pest:", error);

    // Fallback to mock data if API fails
    const mockpest = pestsData.find((h) => h.id === id);
    if (mockpest) {
      console.log("Falling back to mock data for pest");
      return mockpest;
    }
    throw new Error("pest not found");
  }
};
