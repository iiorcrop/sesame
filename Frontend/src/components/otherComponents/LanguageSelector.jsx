import React, { useEffect, useState } from "react";

const LanguageSelector = () => {
  const [selectedLang, setSelectedLang] = useState("en");

  useEffect(() => {
    // Get current lang from URL hash
    const hashLang = window.location.hash.match(/#googtrans\(en\|(.+)\)/);
    const currentLang = hashLang ? hashLang[1] : "en";
    setSelectedLang(currentLang);
  }, []);

  const handleLanguageChange = (e) => {
    const langCode = e.target.value;
    const currentUrl = window.location.href.split("#")[0];
    window.location.href = `${currentUrl}#googtrans(en|${langCode})`;
    window.location.reload(); // Needed for Google Translate to take effect
  };

  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <label htmlFor="lang" className="text-gray-700">
        🌐 Language:
      </label>
      <select
        id="lang"
        value={selectedLang}
        onChange={handleLanguageChange}
        className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
      >
        <option value="en">English</option>
        <option value="hi">हिंदी</option>
        <option value="te">తెలుగు</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
