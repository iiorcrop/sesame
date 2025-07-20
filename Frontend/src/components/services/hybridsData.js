// Mock data for hybrids - used as fallback when API fails
export const hybridsData = [
  {
    id: "hybrid-1",
    name: "High Yield Hybrid H-1",
    image:
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop&crop=center",
    details: {
      "Year of release": "2020",
      "Developed by": "Agricultural Research Institute",
      "Pedigree / type of material": "Parent Line A x Parent Line B",
      "Recommended states": "Gujarat, Rajasthan, Maharashtra",
      "Recommended ecology": "Irrigated and rainfed conditions",
      Duration: "Medium",
      "Days to maturity": "120 - 130 DAS",
      "Growth habit": "Semi-dwarf",
      "Average seed yield (kg/ha)": "2200",
      "Disease resistance": "Resistant to rust, moderate resistance to blight",
      "Special features": "High oil content, drought tolerant",
    },
  },
  {
    id: "hybrid-2",
    name: "Early Maturing Hybrid EM-2",
    image:
      "https://images.unsplash.com/photo-1592982635311-41ba979bc2c9?w=400&h=300&fit=crop&crop=center",
    details: {
      "Year of release": "2019",
      "Developed by": "National Seed Research Center",
      "Pedigree / type of material": "Elite Line C x Improved Line D",
      "Recommended states": "Punjab, Haryana, Uttar Pradesh",
      "Recommended ecology": "Irrigated conditions",
      Duration: "Early",
      "Days to maturity": "90 - 100 DAS",
      "Growth habit": "Dwarf",
      "Average seed yield (kg/ha)": "1800",
      "Disease resistance": "High resistance to powdery mildew",
      "Special features": "Early maturity, uniform plant height",
    },
  },
  {
    id: "hybrid-3",
    name: "Drought Resistant Hybrid DR-3",
    image:
      "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=400&h=300&fit=crop&crop=center",
    details: {
      "Year of release": "2021",
      "Developed by": "Dryland Agriculture Research Station",
      "Pedigree / type of material":
        "Drought Tolerant Line E x Heat Resistant Line F",
      "Recommended states": "Rajasthan, Karnataka, Andhra Pradesh",
      "Recommended ecology": "Rainfed and water-stressed conditions",
      Duration: "Long",
      "Days to maturity": "140 - 150 DAS",
      "Growth habit": "Medium tall",
      "Average seed yield (kg/ha)": "1600",
      "Disease resistance": "Moderate resistance to major diseases",
      "Special features": "Excellent drought tolerance, deep root system",
    },
  },
  {
    id: "hybrid-4",
    name: "High Oil Content Hybrid HO-4",
    image:
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=300&fit=crop&crop=center",
    details: {
      "Year of release": "2022",
      "Developed by": "Oil Crop Research Institute",
      "Pedigree / type of material": "High Oil Line G x Quality Line H",
      "Recommended states": "Gujarat, Maharashtra, Tamil Nadu",
      "Recommended ecology": "Irrigated conditions with good fertility",
      Duration: "Medium",
      "Days to maturity": "115 - 125 DAS",
      "Growth habit": "Medium",
      "Average seed yield (kg/ha)": "2000",
      "Oil content": "52-55%",
      "Disease resistance":
        "Resistant to wilt, moderate resistance to leaf spot",
      "Special features": "Superior oil quality, high ricinoleic acid content",
    },
  },
  {
    id: "hybrid-5",
    name: "Multi-resistant Hybrid MR-5",
    image:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop&crop=center",
    details: {
      "Year of release": "2023",
      "Developed by": "Plant Breeding Research Center",
      "Pedigree / type of material": "Resistant Line I x Improved Line J",
      "Recommended states": "All major castor growing states",
      "Recommended ecology": "Suitable for diverse agro-climatic conditions",
      Duration: "Medium",
      "Days to maturity": "110 - 120 DAS",
      "Growth habit": "Semi-dwarf",
      "Average seed yield (kg/ha)": "2100",
      "Disease resistance":
        "Multiple disease resistance including rust, blight, and wilt",
      "Insect resistance": "Moderate resistance to capsule borer",
      "Special features": "Broad spectrum resistance, stable performance",
    },
  },
];

// Simulated API functions using mock data
export const fetchHybrids = async () => {
  try {
    // Try to fetch from the actual API first
    const { fetchHybridsApi } = await import("./api");
    return await fetchHybridsApi();
  } catch (error) {
    console.warn("API call failed, using mock data:", error);
    // Return mock data if API fails
    return hybridsData;
  }
};

export const fetchHybridById = async (id) => {
  console.log("fetchHybridById called with id:", id, "type:", typeof id);

  if (!id || id === "undefined") {
    throw new Error(`Invalid hybrid ID: ${id}`);
  }

  try {
    // Try to fetch from the actual API first
    const { fetchHybridByIdApi } = await import("./api");
    return await fetchHybridByIdApi(id);
  } catch (error) {
    console.warn("API call failed, using mock data:", error);
    // Find hybrid in mock data
    console.log(
      "Searching for hybrid with id:",
      id,
      "in data:",
      hybridsData.map((h) => h.id)
    );
    const hybrid = hybridsData.find((h) => h.id === id);
    if (!hybrid) {
      throw new Error(`Hybrid with id ${id} not found`);
    }
    return hybrid;
  }
};

export { hybridsData as default };
