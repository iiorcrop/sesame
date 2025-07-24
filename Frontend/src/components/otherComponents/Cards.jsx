import React, { useState, useEffect } from "react";
import Card from "./Card";
import { fetchImages } from "../services/api";
import "../css/Cards.css"; // Style overrides if needed

const Cards = () => {
  const [cardsData, setCardsData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const imageSources = async (title, groupedData) => {
    const cardImages = await fetchCardImages(title.toLowerCase());
    if (!cardImages || cardImages.length === 0) {
      return [...groupedData[title].map((image) => image.src)];
    }

    return cardImages;
  };

  const fetchData = async () => {
    try {
      const images = await fetchImages();

      const groupedData = images.reduce((acc, image) => {
        const title = image.title;
        if (!acc[title]) acc[title] = [];
        acc[title].push({
          src: image.url,
          title: image.title,
          label: image.label,
        });
        return acc;
      }, {});

      const formattedCards = Object.keys(groupedData).map((title) => ({
        title,
        images: groupedData[title],
        label: groupedData[title][0].label, // Assuming label is the same for all images in a group
      }));

      setCardsData(formattedCards);
    } catch (err) {
      setError("Failed to load content. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <h2 className=" text-xl lg:text-3xl font-extrabold text-green-800 mb-4 leading-tight tracking-tight text-center">
        Sesame Insights
      </h2>
      <div className="w-20 h-1 bg-green-600 mx-auto rounded-full mb-8"></div>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 animate-pulse">
          <svg
            className="w-10 h-10 text-green-600 animate-bounce mb-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
          </svg>
          <span className="text-green-800 font-semibold animate-pulse">
            Loading cards...
          </span>
        </div>
      ) : cardsData.length > 0 ? (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cardsData.length} gap-8`}
        >
          {cardsData.map((card, index) => (
            <Card
              key={index}
              title={card.title}
              images={card.images}
              label={card.label}
              animateDelay={index * 120}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No content found.</p>
      )}
    </section>
  );
};

export default Cards;
