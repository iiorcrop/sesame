// Mock data for diseases - used as fallback when API fails
export const diseasesData = [
  {
    id: "wilt",
    name: "Fusarium Wilt",
    image: "/castor_diseases/wilt.jpg",
    details: {
      "Scientific name": "Fusarium oxysporum f. sp. ricini",
      Symptoms: "Yellowing of leaves, wilting, browning of vascular tissues",
      "Affected parts": "Roots, stems, whole plant",
      Management: "Use resistant varieties, crop rotation, seed treatment",
      Occurrence: "Common in all castor growing areas",
      Severity: "High",
    },
  },
  {
    id: "leaf-spot",
    name: "Alternaria Leaf Spot",
    image: "/castor_diseases/leaf-spot.jpg",
    details: {
      "Scientific name": "Alternaria ricini",
      Symptoms: "Brown circular spots with concentric rings on leaves",
      "Affected parts": "Leaves, stems, capsules",
      Management:
        "Foliar sprays of fungicides, destruction of affected plant parts",
      Occurrence: "Common during humid conditions",
      Severity: "Moderate to high",
    },
  },
  {
    id: "root-rot",
    name: "Root Rot",
    image: "/castor_diseases/root-rot.jpg",
    details: {
      "Scientific name": "Macrophomina phaseolina",
      Symptoms: "Rotting of roots, wilting, chlorosis",
      "Affected parts": "Roots, crown area",
      Management: "Soil treatment, good drainage, crop rotation",
      Occurrence: "More common in dry conditions following wet periods",
      Severity: "High in conducive conditions",
    },
  },
  {
    id: "seedling-blight",
    name: "Seedling Blight",
    image: "/castor_diseases/seedling-blight.jpg",
    details: {
      "Scientific name": "Rhizoctonia solani",
      Symptoms: "Pre-emergence or post-emergence death of seedlings",
      "Affected parts": "Seeds, seedlings",
      Management: "Seed treatment with fungicides, proper planting depth",
      Occurrence: "Early season",
      Severity: "High in seedling stage",
    },
  },
  {
    id: "capsule-borer",
    name: "Capsule Borer",
    image: "/castor_diseases/capsule-borer.jpg",
    details: {
      "Scientific name": "Dichocrocis punctiferalis",
      Symptoms: "Holes in capsules, webbing and frass",
      "Affected parts": "Capsules, seeds",
      Management:
        "Timely spraying of insecticides, removal of affected capsules",
      Occurrence: "During capsule formation stage",
      Severity: "Can cause up to 30% yield loss",
    },
  },
];

import {
  fetchDiseasesApi,
  fetchDiseaseByIdApi,
  fetchDiseasePropertiesApi,
} from "./api";

// API function to get all diseases
export const fetchDiseases = async () => {
  try {
    // Get all diseases from API
    const diseases = await fetchDiseasesApi();

    // Transform the data to match the expected format in the frontend
    return Promise.all(
      diseases.map(async (disease) => {
        try {
          // Fetch properties for each disease
          const properties = await fetchDiseasePropertiesApi(disease._id);

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
            id: disease._id,
            name: disease.name,
            image: imageProperty
              ? imageProperty.value
              : "/default-disease-image.jpg",
            details: details,
          };
        } catch (error) {
          console.error(
            `Error fetching properties for disease ${disease._id}:`,
            error
          );
          // Return basic disease info without properties if fetching properties fails
          return {
            id: disease._id,
            name: disease.name,
            image: "/default-disease-image.jpg",
            details: { note: "Failed to load disease details" },
          };
        }
      })
    );
  } catch (error) {
    console.error("Error fetching diseases:", error);
    // Fallback to mock data if API fails
    console.log("Falling back to mock data");
    return diseasesData;
  }
};

// API function to get a specific disease by ID
export const fetchDiseaseById = async (id) => {
  try {
    // Get disease and properties from API
    const { disease, properties } = await fetchDiseaseByIdApi(id);

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
      id: disease._id,
      name: disease.name,
      image: imageProperty ? imageProperty.value : "/default-disease-image.jpg",
      details: details,
    };
  } catch (error) {
    console.error("Error fetching disease:", error);

    // Fallback to mock data if API fails
    const mockDisease = diseasesData.find((d) => d.id === id);
    if (mockDisease) {
      console.log("Falling back to mock data for disease");
      return mockDisease;
    }
    throw new Error("Disease not found");
  }
};
