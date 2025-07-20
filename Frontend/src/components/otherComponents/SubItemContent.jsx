import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchSubItems } from "../services/api"; // Import your API function
import SubItemContent from "./SubSubItemContent"; // Import SubItemContent component
import LoaderUI from "./LoaderUi";

const SubItemPage = () => {
  const { subId } = useParams(); // Get the subId from the URL parameters
  const [subItem, setSubItem] = useState(null);

  useEffect(() => {
    // Fetch the sub-item data based on the subId
    const fetchSubItemData = async () => {
      try {
        const subItems = await fetchSubItems(); // Get all sub-items
        const foundSubItem = subItems.find((item) => item._id === subId); // Find the sub-item by ID
        setSubItem(foundSubItem); // Set the sub-item state
      } catch (error) {
        console.error("Error fetching sub items:", error);
      }
    };

    fetchSubItemData(); // Call the function to fetch the sub-item
  }, [subId]); // Re-fetch when subId changes

  if (!subItem) {
    return <LoaderUI />; // Display a loading message while fetching data
  }

  return <div>{subItem && <SubItemContent activeSubItem={subItem} />}</div>;
};

export default SubItemPage;
