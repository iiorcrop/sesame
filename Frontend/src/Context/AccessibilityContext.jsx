import React, { createContext, useState, useContext, useEffect } from "react";

const AccessibilityContext = createContext();

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider = ({ children }) => {
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

    // Load saved settings
    const savedFontSize = localStorage.getItem("accessibility_fontSize");
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize, 10));
    }

    return () => {
      // Clean up speech synthesis
      if (window.speechSynthesis && isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    // Save settings when they change
    localStorage.setItem("accessibility_fontSize", fontSize.toString());
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

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

  // Speak specific text
  const speakText = (text) => {
    if (!speechSynthesis) return;

    // Cancel any current speech
    speechSynthesis.cancel();

    const newUtterance = new SpeechSynthesisUtterance(text);
    newUtterance.onend = () => setIsSpeaking(false);
    newUtterance.onerror = () => setIsSpeaking(false);

    setUtterance(newUtterance);
    speechSynthesis.speak(newUtterance);
    setIsSpeaking(true);
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (speechSynthesis && isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const value = {
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    isSpeaking,
    toggleSpeech,
    speakText,
    stopSpeaking,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};
