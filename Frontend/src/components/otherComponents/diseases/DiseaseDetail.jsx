import React from "react";
import { unsanitizeText } from "../../../../utils/textUtils";

const DiseaseDetail = ({ disease }) => {
  if (!disease) {
    return (
      <div className="disease-content">
        <div className="loading-message">
          Please select a disease from the list
        </div>
      </div>
    );
  }

  // If no image, show a premium message and skip the image section
  const hasImage =
    disease.image &&
    disease.image.trim() !== "" &&
    disease.image !== "/default-disease-image.jpg";

  const isEmptyDetails =
    !disease.details || Object.keys(disease.details).length === 0;

  return (
    <div className="disease-content bg-white/90 rounded-2xl s  p-6 md:p-10">
      <div className="disease-header mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-green-900 tracking-tight">
          {disease.name}
        </h1>
      </div>

      <div className="disease-details flex flex-col md:flex-row items-start gap-8">
        {hasImage && (
          <div className="disease-image-container flex-shrink-0 w-full md:w-64 mb-6 md:mb-0">
            <img
              src={disease.image}
              alt={`${disease.name} disease`}
              className="rounded-xl object-cover w-full h-56 border border-green-100 shadow"
            />
          </div>
        )}

        <div className="disease-info flex-1">
          {isEmptyDetails && (
            <div className="text-gray-400 text-lg italic mb-4">
              Nothing to show for this disease.
            </div>
          )}
          <table className="w-full bg-white rounded-xl overflow-hidden shadow border border-green-100">
            <tbody>
              {Object.entries(disease.details || {}).map(
                ([key, value], index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-green-50" : "bg-white"}
                  >
                    <td className="py-3 px-5 font-semibold text-green-800 capitalize w-1/3 border-b border-green-100" style={{ fontSize: "18px", fontFamily: "Times New Roman, Times, serif" }}>
                      {unsanitizeText(
                        key
                          .replace(/[^a-zA-Z0-9 ]/g, " ")
                          .replace(/\s+/g, " ")
                          .trim()
                      )}
                    </td>
                    <td
                      className="py-3 px-5 text-gray-700 border-b border-green-50"
                      style={{ fontSize: "18px", fontFamily: "Times New Roman, Times, serif" }}
                      dangerouslySetInnerHTML={{
                        __html: unsanitizeText(value),
                      }}
                    ></td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetail;
