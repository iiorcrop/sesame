import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchpests, fetchpestById, pestsData } from "../../services/pestsData";
import PestsSidebar from "./PestsSidebar";
import PestDetail from "./PestDetail";
import "../../css/Pests.css";

const Pests = () => {
  const { pestId } = useParams();
  const navigate = useNavigate();

  const [pests, setpests] = useState([]);
  const [activepest, setActivepest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState("loading"); // 'api', 'mock', or 'loading'

  // Fetch all pests
  useEffect(() => {
    const loadpests = async () => {
      try {
        setLoading(true);

        // Try to fetch pests from the API
        const data = await fetchpests();
        setpests(data);
        setDataSource(data === pestsData ? "mock" : "api");

        // If there's a pestId in the URL params, load that pest
        if (pestId) {
          try {
            const selectedpest = await fetchpestById(pestId);
            setActivepest(selectedpest);
          } catch (err) {
            console.error("Error fetching pest by ID:", err);
            setError(`pest not found: ${pestId}`);
            // Redirect to the main pests page if pest not found
            navigate("/pests");
          }
        } else if (data.length > 0) {
          // Select the first pest by default
          setActivepest(data[0]);
          // Update URL to reflect the selected pest
          if (data[0]?.id) {
            navigate(`/pests/${data[0].id}`, { replace: true });
          }
        }
      } catch (err) {
        setError("Failed to load pests");
        console.error("Error in loadpests:", err);
      } finally {
        setLoading(false);
      }
    };

    loadpests();
  }, [pestId, navigate]);

  // Handle pest selection
  const handlepestSelect = (pest) => {
    setActivepest(pest);
    navigate(`/pests/${pest.id}`);
  };

  if (loading) {
    return (
      <div className="pests-container">
        <div className="loading-message">Loading pests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pests-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="pests-container">
      {dataSource === "mock" && (
        <div className="data-source-indicator mock">
          Note: Using mock data (API connection failed)
        </div>
      )}
      <div
        className="pests-content-container flex flex-col md:flex-row gap-4"
        style={{ display: "flex", width: "100%" }}
      >
        <PestsSidebar
          pests={pests}
          activepest={activepest}
          onpestSelect={handlepestSelect}
        />
        <PestDetail pest={activepest} />
      </div>
    </div>
  );
};

export default Pests;
