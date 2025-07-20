import React, { useRef } from "react";
import "../css/TickerSlider.css";
import { HiSpeakerWave } from "react-icons/hi2";


const TickerSlider = ({ text }) => {
  const tickerRef = useRef(null);

  // Pause animation on hover
  const handleMouseEnter = () => {
    if (tickerRef.current) {
      tickerRef.current.style.animationPlayState = "paused";
    }
  };
  const handleMouseLeave = () => {
    if (tickerRef.current) {
      tickerRef.current.style.animationPlayState = "running";
    }
  };

  return (
  <div className="w-full bg-gradient-to-r from-green-50 via-gray-100 to-green-100 shadow flex items-center py-2 px-4 rounded-xl mb- 4 overflow-hidden">
    <span className="flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-green-500 to-lime-400 text-white font-bold text-xs shadow uppercase tracking-wider animate-pulse bg-white  border border-green-200 ">
      <HiSpeakerWave className="text-lg" />
      Flash News
    </span>
    <div className="relative flex-1 ticker-slider overflow-hidden">
      <div
        className="ticker-content"
        ref={tickerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ willChange: "transform" }}
      >
        <span className="whitespace-nowrap text-green-900 font-medium text-base px-2">
          {text}
        </span>
      </div>
    </div>
  </div>
  );
};

export default TickerSlider;