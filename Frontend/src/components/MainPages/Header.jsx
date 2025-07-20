import React, { useState, useEffect } from "react";
import leftImage from "../images/icarlogo.png";
import rightImage from "../images/iiorlogo.png";
import { fetchMaintitle } from "../services/api";
import LanguageSelector from "../otherComponents/LanguageSelector";
import { FaVolumeUp } from "react-icons/fa";

const Header = () => {
  const [titleDetails, setTitleDetails] = useState({});
  // const { speakText } = useAccessibility();

  const fetchMainTitle = async () => {
    try {
      const response = await fetchMaintitle();
      setTitleDetails(response);
    } catch (err) {
      console.log("Error fetching main title:", err);
    }
  };

  useEffect(() => {
    fetchMainTitle();
  }, []);

  const handleSpeakTitle = () => {
    const title = titleDetails?.title?.title;
    const subtitle = titleDetails?.title?.subtitle;
    const textToSpeak = `${title}. ${subtitle}`;
    // speakText(textToSpeak);
  };

  return (
    <header
      className="w-full bg-[#FDF7E3] px-4 py-3 shadow-md z-10"
      role="banner"
    >
      {/* Language Selector Top Bar */}
      <div className="flex justify-end mb-">
        <LanguageSelector />
      </div>

      {/* Logo + Title Row */}
      <div className="flex items-center justify-center md:gap-32">
        {/* Left Logo */}
        <img
          src={leftImage}
          alt="ICAR Logo"
          className="h-14 md:h-24 max-w-full"
          aria-label="Indian Council of Agricultural Research Logo"
        />

        {/* Title Center */}
        <div className="text-center flex flex-col items-center px-2 relative">
          <div className="flex items-center">
            <h1 className="text-lg md:text-4xl font-semibold text-[#3A8730] leading-tight">
              {titleDetails?.title?.title}
            </h1>
            <button
              onClick={handleSpeakTitle}
              className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
              aria-label="Read title aloud"
            >
              <FaVolumeUp />
            </button>
          </div>
          <h2 className="text-xs md:text-xl pt-3 text-[#8B4513]">
            {titleDetails?.title?.subtitle}
          </h2>
        </div>

        {/* Right Logo */}
        <img
          src={rightImage}
          alt="IIOR Logo"
          className="h-14 md:h-24 max-w-full"
          aria-label="Indian Institute of Oilseeds Research Logo"
        />
      </div>
    </header>
  );
};

export default Header;

// 2e4a36
