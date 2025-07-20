import React from "react";
import { FaSeedling } from "react-icons/fa";

const LoaderUI = () => {
  return (
    <>
      <style>{`
        @keyframes soilPulse {
          0%, 100% { transform: scaleX(1); opacity: 1; }
          50% { transform: scaleX(1.1); opacity: 0.6; }
        }

        @keyframes stemBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        @keyframes leafGrow {
          0%, 100% { transform: scale(0.9) rotate(45deg); }
          50% { transform: scale(1.1) rotate(45deg); }
        }

        @keyframes plantWiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(3deg); }
          75% { transform: rotate(-3deg); }
        }

        @keyframes textBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .soil-pulse {
          animation: soilPulse 2s ease-in-out infinite;
        }

        .stem-bounce {
          animation: stemBounce 2s ease-in-out infinite;
        }

        .leaf-grow {
          animation: leafGrow 1.8s ease-in-out infinite;
        }

        .plant-wiggle {
          animation: plantWiggle 2.2s ease-in-out infinite;
        }

        .loading-blink {
          animation: textBlink 1.6s ease-in-out infinite;
        }
      `}</style>

      <div className="flex flex-col items-center justify-center py-16">
        {/* Soil */}

        {/* Stem + Leaves */}
        <div className="relative flex flex-col items-center stem-bounce">
          {/* Stem */}

          {/* Top Seedling Icon */}
          <div className="mt-4 bg-green-100 p-4 rounded-full shadow-lg">
            <FaSeedling className="text-green-600 text-3xl plant-wiggle" />
          </div>
        </div>

        <span className="mt-4 text-green-900 font-medium text-base tracking-wide loading-blink">
          Growing Sesame Data...
        </span>
      </div>
    </>
  );
};

export default LoaderUI;
