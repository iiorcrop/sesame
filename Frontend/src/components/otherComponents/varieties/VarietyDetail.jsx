import React from "react";
import { unsanitizeText } from "../../../../utils/textUtils";

const VarietyDetail = ({ variety }) => {
  if (!variety) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="bg-white/90 rounded-2xl   px-8 py-16 flex flex-col items-center w-full max-w-xl">
          <svg
            className="w-16 h-16 text-green-200 mb-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 48 48"
          >
            <circle
              cx="24"
              cy="24"
              r="22"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 24h16M24 16v16"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>
          <div className="text-green-900 text-2xl font-bold mb-2 text-center">
            No Variety Selected
          </div>
          <div className="text-gray-500 text-lg text-center">
            Please select a variety from the list to view its details.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 rounded -2xl  p-6 md:p-10">
      <div className="flex flex-col md:flex-row items-start gap-8">
        {/* Only show image if present */}
        {variety.image && (
          <div className="flex-shrink-0 w-full hidden md:w-64 mb-6 md:mb-0">
            <img
              src={variety.image}
              alt={`${variety.name} variety`}
              className="rounded-xl object-cover w-full h-56 border border-green-100 shadow"
            />
          </div>
        )}

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-green-900 tracking-tight">
            {variety.name}
          </h1>

          {Object.keys(variety?.details).length === 0 ? (
            <div className="text-gray-400 text-lg italic">
              No details available for this variety.
            </div>
          ) : (
            <table className="w-full bg-white rounded-xl overflow-hidden      ">
              <tbody>
                {Object.entries(variety.details).map(([key, value], index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-green-50" : "bg-white"}
                  >
                    <td className="py-3 px-5 font-semibold w-max text-green-800 capitalize w-1/3 border-b border-green-100">
                      {unsanitizeText(key)}
                    </td>
                    <td
                      className="py-3 px-5 text-gray-700 border-b border-green-50"
                      dangerouslySetInnerHTML={{
                        __html: unsanitizeText(value),
                      }}
                    ></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default VarietyDetail;
