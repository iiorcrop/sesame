// ...existing imports...
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchVarieties,
  fetchVarietyById,
  varietiesData,
} from "../../services/varietiesData";
import VarietiesSidebar from "./VarietiesSidebar";
import VarietyDetail from "./VarietyDetail";
import "../../css/Varieties.css";
import LoaderUI from "../LoaderUi";

const Varieties = () => {
  const { varietyId } = useParams();
  const navigate = useNavigate();

  const [varieties, setVarieties] = useState([]);
  const [activeVariety, setActiveVariety] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState("loading"); // 'api', 'mock', or 'loading'

  // Fetch all varieties
  useEffect(() => {
    const loadVarieties = async () => {
      try {
        setLoading(true);

        // Try to fetch varieties from the API
        const data = await fetchVarieties();
        setVarieties(data);
        setDataSource(data === varietiesData ? "mock" : "api");

        // If there's a varietyId in the URL params, load that variety
        if (varietyId) {
          try {
            const selectedVariety = await fetchVarietyById(varietyId);
            setActiveVariety(selectedVariety);
          } catch (err) {
            console.error("Error fetching variety by ID:", err);
            setError(`Variety not found: ${varietyId}`);
            // Redirect to the main varieties page if variety not found
            navigate("/varieties");
          }
        } else if (data.length > 0) {
          // Select the first variety by default
          setActiveVariety(data[0]);
          // Update URL to reflect the selected variety
          if (data[0]?.id) {
            navigate(`/varieties/${data[0].id}`, { replace: true });
          }
        }
      } catch (err) {
        setError("Failed to load varieties");
        console.error("Error in loadVarieties:", err);
      } finally {
        setLoading(false);
      }
    };

    loadVarieties();
  }, [varietyId, navigate]);

  // Handle variety selection
  const handleVarietySelect = (variety) => {
    setActiveVariety(variety);
    navigate(`/varieties/${variety.id}`);
  };

  if (loading) {
    return (
      <div className="varieties-container">
        <div className="loading-message"><LoaderUI/></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="varieties-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }



  console.log('objects', varieties, activeVariety); 

  return (
    <div className="varieties-container">
      {dataSource === "mock" && (
        <div className="data-source-indicator mock">
          Note: Using mock data (API connection failed)
        </div>
      )}
      <div
        className="varieties-content-container flex flex-col md:flex-row gap-4"
        style={{ display: "flex", width: "100%" }}
      >
        <VarietiesSidebar
          varieties={varieties}
          activeVariety={activeVariety}
          onVarietySelect={handleVarietySelect}
        />
        <VarietyDetail variety={activeVariety} />
      </div>
    </div>
  );
};

export default Varieties;