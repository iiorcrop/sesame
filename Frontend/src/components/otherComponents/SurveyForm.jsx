import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchSurveyFormInput, submitFormResponse } from "../services/api";
import LoaderUI from "./LoaderUi";

const SurveyFormView = () => {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetchSurveyFormInput();
        setFields(res.inputs || []);
      } catch {
        toast.error("Failed to load survey form");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const field of fields) {
      const value = formData[field._id];
      if (field.type === "Checkbox") continue;

      if (field.type === "Number" && (isNaN(value) || value === "")) {
        toast.error(`Please enter a valid number for "${field.title}"`);
        return;
      }

      if (!value || (typeof value === "string" && value.trim() === "")) {
        toast.error(`"${field.title}" is required`);
        return;
      }
    }

    const payload = {
      responses: Object.entries(formData).map(([fieldId, value]) => ({
        fieldId,
        value,
      })),
    };

    try {
      await submitFormResponse(payload);
      toast.success("Form submitted successfully!");
      setFormData({});
    } catch (err) {
      toast.error("Failed to submit form.");
    }
  };

  return (
    <div className="flex flex-col gap-8 px-2 md:px-8 py-8 min-h-[60vh] bg-gradient-to-br from-green-50 via-white to-lime-50">
      <main className="flex-1 flex flex-col items-start justify-start">
        {loading ? (
          <div className="flex justify-center items-center h-64 w-full">
            <LoaderUI />
          </div>
        ) : (
          <section className="w-full max-w-4xl mx-auto animate-fade-in-up">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-5 leading-tight bg-gradient-to-r from-green-700 via-lime-600 to-green-400 bg-clip-text text-transparent tracking-tight text-center">
              🌾 Farmer Survey Form
            </h1>

            <form
              onSubmit={handleSubmit}
              className="survey-form bg-white shadow-xl rounded-2xl p-8 space-y-6 border border-gray-100"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                {fields.map((field) => (
                  <div key={field._id} className="flex flex-col gap-2">
                    <label className="font-semibold text-[#166534]">
                      {field.title}
                    </label>

                    {field.type === "Text" && (
                      <input
                        type="text"
                        className="bg-white/90 border border-green-100 rounded-lg px-4 py-3 focus:outline-none transition shadow-sm"
                        value={formData[field._id] || ""}
                        onChange={(e) =>
                          handleChange(field._id, e.target.value)
                        }
                      />
                    )}

                    {field.type === "Number" && (
                      <input
                        type="number"
                        className="bg-white/90 border border-green-100 rounded-lg px-4 py-3 focus:outline-none transition shadow-sm"
                        value={formData[field._id] || ""}
                        onChange={(e) =>
                          handleChange(field._id, e.target.value)
                        }
                      />
                    )}

                    {field.type === "Checkbox" && (
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-green-600"
                          checked={formData[field._id] || false}
                          onChange={(e) =>
                            handleChange(field._id, e.target.checked)
                          }
                        />
                        <span className="text-gray-700">Yes</span>
                      </label>
                    )}

                    {field.type === "Date" && (
                      <input
                        type="date"
                        className="bg-white/90 border border-green-100 rounded-lg px-4 py-3 focus:outline-none transition shadow-sm"
                        value={formData[field._id] || ""}
                        onChange={(e) =>
                          handleChange(field._id, e.target.value)
                        }
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-600 to-lime-500 hover:from-green-700 hover:to-lime-600 text-white px-8 py-3 rounded-lg font-medium shadow-md transition duration-150 text-lg"
                >
                  Submit Survey
                </button>
              </div>
            </form>
          </section>
        )}
      </main>

      <style>
        {`
        .survey-form {
          box-shadow: 0 4px 24px 0 rgba(60, 120, 60, 0.10);
        }
        .survey-form label {
          font-family: "Times New Roman", serif;
          font-size: 18px;
          font-weight: 600;
        }
        .survey-form input {
          font-family: "Times New Roman", serif;
          font-size: 18px;
          line-height: 1.5;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
        `}
      </style>
    </div>
  );
};

export default SurveyFormView;
