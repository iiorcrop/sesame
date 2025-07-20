import React, { useState, useEffect } from "react";
import { FaAccessibleIcon, FaFont, FaVolumeUp } from "react-icons/fa";

const AccessibilityPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100); // Percentage of default font size
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  const [utterance, setUtterance] = useState(null);

  useEffect(() => {
    // Set font size to the HTML root element
    document.documentElement.style.fontSize = `${fontSize}%`;

    // Initialize speech synthesis
    if (window.speechSynthesis) {
      setSpeechSynthesis(window.speechSynthesis);
    }

    return () => {
      // Clean up speech synthesis
      if (window.speechSynthesis && isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [fontSize, isSpeaking]);

  const increaseFontSize = () => {
    if (fontSize < 200) {
      setFontSize(fontSize + 10);
    }
  };

  const decreaseFontSize = () => {
    if (fontSize > 70) {
      setFontSize(fontSize - 10);
    }
  };

  const resetFontSize = () => {
    setFontSize(100);
  };

  const toggleSpeech = () => {
    if (!speechSynthesis) return;

    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Get page content
    const contentToRead = document.body.innerText;

    // Create utterance
    const newUtterance = new SpeechSynthesisUtterance(contentToRead);

    // Set up events
    newUtterance.onend = () => setIsSpeaking(false);
    newUtterance.onerror = () => setIsSpeaking(false);

    // Start speaking
    setUtterance(newUtterance);
    speechSynthesis.speak(newUtterance);
    setIsSpeaking(true);
  };

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed right-4 top-20 z-50">
      <button
        onClick={togglePanel}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
        aria-label="Accessibility options"
      >
        <FaAccessibleIcon size={20} />
      </button>

      {isOpen && (
        <div className="absolute top-14 right-0 bg-white rounded-lg shadow-lg p-4 w-64 mt-2 border border-gray-200">
          <h3 className="text-lg font-bold mb-3">Accessibility Options</h3>

          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Text Size</h4>
            <div className="flex items-center gap-2">
              <button
                onClick={decreaseFontSize}
                className="bg-gray-200 hover:bg-gray-300 p-2 rounded text-sm"
                aria-label="Decrease font size"
              >
                A-
              </button>
              <button
                onClick={resetFontSize}
                className="bg-gray-200 hover:bg-gray-300 p-2 rounded text-sm"
                aria-label="Reset font size"
              >
                Reset
              </button>
              <button
                onClick={increaseFontSize}
                className="bg-gray-200 hover:bg-gray-300 p-2 rounded text-sm"
                aria-label="Increase font size"
              >
                A+
              </button>
            </div>
            <div className="text-xs mt-1 text-gray-500">
              Font size: {fontSize}%
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Text to Speech</h4>
            <button
              onClick={toggleSpeech}
              className={`flex items-center gap-2 ${
                isSpeaking
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white py-2 px-3 rounded-md w-full`}
              aria-label={isSpeaking ? "Stop reading" : "Read page content"}
            >
              <FaVolumeUp />
              <span>{isSpeaking ? "Stop Reading" : "Read Page Content"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityPanel;
