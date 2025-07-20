import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchDiseases,
  fetchDiseaseById,
  diseasesData,
} from "../../services/diseasesData";
import DiseasesSidebar from "./DiseasesSidebar";
import DiseaseDetail from "./DiseaseDetail";
import "../../css/Diseases.css";
import LoaderUI from "../LoaderUi";

const Diseases = () => {
  const { diseaseId } = useParams();
  const navigate = useNavigate();

  const [diseases, setDiseases] = useState([]);
  const [activeDisease, setActiveDisease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState("loading"); // 'api', 'mock', or 'loading'

  // Fetch all diseases
  useEffect(() => {
    const loadDiseases = async () => {
      try {
        setLoading(true);

        // Try to fetch diseases from the API
        const data = await fetchDiseases();
        setDiseases(data);
        setDataSource(data === diseasesData ? "mock" : "api");

        // If there's a diseaseId in the URL params, load that disease
        if (diseaseId) {
          try {
            const selectedDisease = await fetchDiseaseById(diseaseId);
            setActiveDisease(selectedDisease);
          } catch (err) {
            console.error("Error fetching disease by ID:", err);
            setError(`Disease not found: ${diseaseId}`);
            // Redirect to the main diseases page if disease not found
            navigate("/diseases");
          }
        } else if (data.length > 0) {
          // Select the first disease by default
          setActiveDisease(data[0]);
          // Update URL to reflect the selected disease
          if (data[0]?.id) {
            navigate(`/diseases/${data[0].id}`, { replace: true });
          }
        }
      } catch (err) {
        setError("Failed to load diseases");
        console.error("Error in loadDiseases:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDiseases();
  }, [diseaseId, navigate]);

  // Handle disease selection
  const handleDiseaseSelect = (disease) => {
    setActiveDisease(disease);
    navigate(`/diseases/${disease.id}`);
  };

  if (loading) {
    return (
      <div className="diseases-container">
        <div className="loading-message"><LoaderUI/></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="diseases-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="diseases-container">
      {dataSource === "mock" && (
        <div className="data-source-indicator mock">
          Note: Using mock data (API connection failed)
        </div>
      )}
      <div
        className="diseases-content-container flex flex-col md:flex-row items-start"
        style={{ display: "flex", width: "100%" }}
      >
        <DiseasesSidebar
          diseases={diseases}
          activeDisease={activeDisease}
          onDiseaseSelect={handleDiseaseSelect}
        />
        <DiseaseDetail disease={activeDisease} />
      </div>
    </div>
  );
};

export default Diseases;
