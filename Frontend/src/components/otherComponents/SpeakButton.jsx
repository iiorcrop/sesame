import React from "react";
import { FaVolumeUp } from "react-icons/fa";
import { useAccessibility } from "../../context/AccessibilityContext";

const SpeakButton = ({ text, label = "Read aloud", className = "" }) => {
  const { speakText } = useAccessibility();

  const handleClick = () => {
    if (text) {
      speakText(text);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center text-blue-600 hover:text-blue-800 focus:outline-none ${className}`}
      aria-label={label}
      title={label}
    >
      <FaVolumeUp />
    </button>
  );
};

export default SpeakButton;
