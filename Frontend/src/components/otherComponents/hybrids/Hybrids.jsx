// ...existing imports...
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getHybrids, getHybridById } from "../../services/hybridsService";
import { hybridsData } from "../../services/hybridsData";
import HybridsSidebar from "./HybridsSidebar";
import HybridDetail from "./HybridDetail";
import "../../css/Hybrids.css";
import LoaderUI from "../LoaderUi";

const Hybrids = () => {
  const { hybridId } = useParams();
  const navigate = useNavigate();

  const [hybrids, setHybrids] = useState([]);
  const [activeHybrid, setActiveHybrid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState("loading"); // 'api', 'mock', or 'loading'

  // Fetch all hybrids
  useEffect(() => {
    const loadHybrids = async () => {
      try {
        setLoading(true);
        console.log("loadHybrids called with hybridId:", hybridId);

        // Try to fetch hybrids from the API
        const data = await getHybrids();
        setHybrids(data);
        setDataSource(data === hybridsData ? "mock" : "api");

        // If there's a hybridId in the URL params, load that hybrid
        if (hybridId && hybridId !== "undefined") {
          console.log("Fetching hybrid with ID:", hybridId);
          try {
            const selectedHybrid = await getHybridById(hybridId);
            setActiveHybrid(selectedHybrid);
          } catch (err) {
            console.error("Error fetching hybrid by ID:", err);
            setError(`Hybrid not found: ${hybridId}`);
            // Redirect to the main hybrids page if hybrid not found
            navigate("/hybrids", { replace: true });
          }
        } else if (data.length > 0) {
          // Select the first hybrid by default and navigate to it
          console.log("No hybridId provided, selecting first hybrid:", data[0]);
          setActiveHybrid(data[0]);
          // Update URL to reflect the selected hybrid
          if (data[0]?.id) {
            navigate(`/hybrids/${data[0].id}`, { replace: true });
          }
        }
      } catch (err) {
        setError("Failed to load hybrids");
        console.error("Error in loadHybrids:", err);
      } finally {
        setLoading(false);
      }
    };

    loadHybrids();
  }, [hybridId, navigate]);

  // Handle hybrid selection
  const handleHybridSelect = (hybrid) => {
    setActiveHybrid(hybrid);
    if (hybrid?.id) {
      navigate(`/hybrids/${hybrid.id}`);
    }
  };

  if (loading) {
    return (
      <div className="hybrids-container">
        <div className="loading-message">
          <LoaderUI />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hybrids-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  console.log("hybrids data:", hybrids, activeHybrid);

  return (
    <div className="hybrids-container">
      {dataSource === "mock" && (
        <div className="data-source-indicator mock">
          Note: Using mock data (API connection failed)
        </div>
      )}
      <div
        className="hybrids-content-container flex flex-col md:flex-row gap-4"
        style={{ display: "flex", width: "100%" }}
      >
        <HybridsSidebar
          hybrids={hybrids}
          activeHybrid={activeHybrid}
          onHybridSelect={handleHybridSelect}
        />
        <div className="hybrid-detail-container flex-1">
          <HybridDetail hybrid={activeHybrid} />
        </div>
      </div>
    </div>
  );
};

export default Hybrids;
