import React, { useState } from "react";

const AccessibilityHeader = () => {
  const [fontSize, setFontSize] = useState("text-base");
  const [contrast, setContrast] = useState(false);

  const handleFontSize = (size) => setFontSize(size);
  const toggleContrast = () => setContrast(!contrast);

  return (
    <div className={`w-full py-2 px-4 flex justify-between items-center text-sm ${contrast ? "bg-black text-white" : "bg-gray-100 text-gray-800"}`}>
      {/* Left: Accessibility Controls */}
      <div className="flex items-center gap-4">
        <span className="font-bold">Accessibility:</span>
        <button onClick={() => handleFontSize("text-sm")}>A-</button>
        <button onClick={() => handleFontSize("text-base")}>A</button>
        <button onClick={() => handleFontSize("text-lg")}>A+</button>
        <button onClick={toggleContrast}>🌓 High Contrast</button>
      </div>

      {/* Right: Language Translation */}
      <div id="google_translate_element"></div>

      {/* Global Font Size Application */}
      <style>{`body { font-size: ${fontSize}; }`}</style>
    </div>
  );
};

export default AccessibilityHeader;
