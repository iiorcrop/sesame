import React, { useEffect, useState } from "react";
import { fetchCastorInfo } from "../services/api"; // Import the fetchCastorInfo function
import "../css/AboutNiger.css";
import DOMPurify from "dompurify";
import parse from "html-react-parser";

const About = () => {
  // State to hold fetched information and loading state
  const [castorInfo, setCastorInfo] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data using the fetchCastorInfo function from api.js
    const getCastorInfo = async () => {
      try {
        const data = await fetchCastorInfo();
        if (data && data.length > 0) {
          // Assuming the API returns an array and you're interested in the first object
          setCastorInfo({
            title: data[0].title, // Extracting the title from the first object
            description: data[0].description, // Extracting the description from the first object
          });
        } else {
          setError("No data available");
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    getCastorInfo();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="about-castor-container">
  
    </div>
  );
};

export default About;
