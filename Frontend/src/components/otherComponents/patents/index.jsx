import { useEffect, useState } from "react";
import { getOfferings } from "../../services/api";
import { unsanitizeText } from "../../../../utils/textUtils";

const PatentCard = ({ patent }) => (
  <div className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row gap-4 items-center mb-6">
    <div className="flex flex-col flex-1 w-full">
      <div className="flex justify-end mb-2 w-full">
        {patent.date && (
          <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-300">
            {new Date(patent.date).toLocaleDateString()}
          </span>
        )}
      </div>
      <div className="flex md:flex-row flex-col gap-4 items-center w-full">
        {patent.image && (
          <img
            src={patent.image}
            alt="Patent"
            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
          />
        )}
        <div className="flex-1">
          <div className="mb-2">
            <span
              className="text-lg font-semibold"
              dangerouslySetInnerHTML={{
                __html: unsanitizeText(patent.content),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Patents = () => {
  const [patents, setPatents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    const fetchPatents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getOfferings("patent");
        setPatents(data.offerings || []);
      } catch (err) {
        setError("Failed to load patents. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchPatents();
  }, []);

  const totalPages = Math.ceil(patents.length / pageSize);
  const paginatedPatents = patents.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-green-700 mb-8 text-center">
          Patents
        </h1>
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <span className="text-lg text-gray-500">Loading patents...</span>
          </div>
        ) : error ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <span className="text-lg text-red-500">{error}</span>
          </div>
        ) : patents.length > 0 ? (
          <>
            {paginatedPatents.map((patent) => (
              <PatentCard key={patent._id} patent={patent} />
            ))}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={handlePrev}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-lg border font-semibold transition-colors ${
                    page === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  Previous
                </button>
                <span className="text-green-700 font-bold">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={handleNext}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded-lg border font-semibold transition-colors ${
                    page === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="min-h-[40vh] flex items-center justify-center">
            <span className="text-lg text-gray-500">No patents found.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Patents;
