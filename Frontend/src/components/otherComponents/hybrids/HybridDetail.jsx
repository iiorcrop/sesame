import { unsanitizeText } from "../../../../utils/textUtils";
import PropTypes from "prop-types";

const HybridDetail = ({ hybrid }) => {
  if (!hybrid) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="bg-white/90 rounded-2xl px-8 py-16 flex flex-col items-center w-full max-w-xl">
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
            No Hybrid Selected
          </div>
          <div className="text-gray-500 text-lg text-center">
            Please select a hybrid from the list to view its details.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 rounded-2xl p-6 md:p-10">
      <div className="flex flex-col md:flex-row items-start gap-8">
        {/* Show image if present */}
        {hybrid.image && (
          <div className="flex-shrink-0 w-full md:w-64 mb-6 md:mb-0">
            <img
              src={hybrid.image}
              alt={`${hybrid.name} hybrid`}
              className="rounded-xl object-cover w-full h-56 border border-green-100 shadow"
              onError={(e) => {
                console.log("Image failed to load:", hybrid.image);
                // Hide the image if it fails to load
                e.target.parentElement.style.display = "none";
              }}
            />
          </div>
        )}

        {/* Fallback placeholder if no image */}
        {!hybrid.image && (
          <div className="flex-shrink-0 w-full md:w-64 mb-6 md:mb-0">
            <div className="rounded-xl w-full h-56 border border-green-100 shadow bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="w-12 h-12 text-green-300 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-green-600 text-sm font-medium">
                  Hybrid Image
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-green-900 tracking-tight">
            {hybrid.name}
          </h1>

          {/* Show description if available */}
          {hybrid.description && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <p className="text-gray-700 leading-relaxed">
                {unsanitizeText(hybrid.description)}
              </p>
            </div>
          )}

          {!hybrid?.details || Object.keys(hybrid.details).length === 0 ? (
            <div className="text-gray-400 text-lg italic">
              No details available for this hybrid.
            </div>
          ) : (
            <table className="w-full bg-white rounded-xl overflow-hidden">
              <tbody>
                {Object.entries(hybrid.details).map(([key, value], index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-green-50" : "bg-white"}
                  >
                    <td className="py-3 px-5 font-semibold text-green-800 capitalize w-1/3 border-b border-green-100">
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

HybridDetail.propTypes = {
  hybrid: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
    details: PropTypes.object,
  }),
};

export default HybridDetail;
