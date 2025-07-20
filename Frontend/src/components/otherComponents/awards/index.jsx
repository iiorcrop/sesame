import { useEffect, useState } from "react";
import { getOfferings } from "../../services/api";
import { unsanitizeText } from "../../../../utils/textUtils";

const AwardCard = ({ award }) => (
  <div className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row gap-4 items-center mb-6">
    <div className="flex flex-col flex-1 w-full">
      <div className="flex justify-end mb-2 w-full">
        {award.date && (
          <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-300">
            {new Date(award.date).toLocaleDateString()}
          </span>
        )}
      </div>
      <div className="flex md:flex-row flex-col gap-4 items-center w-full">
        {award.image && (
          <img
            src={award.image}
            alt="Award"
            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
          />
        )}
        <div className="flex-1">
          <div className="mb-2">
            <span
              className="text-lg font-semibold"
              dangerouslySetInnerHTML={{
                __html: unsanitizeText(award.content),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Awards = () => {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getOfferings("awards");
        setAwards(data.offerings || []);
      } catch (err) {
        setError("Failed to load awards. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchAwards();
  }, []);

  const totalPages = Math.ceil(awards.length / pageSize);
  const paginatedAwards = awards.slice((page - 1) * pageSize, page * pageSize);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-green-700 mb-8 text-center">
          Awards
        </h1>
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <span className="text-lg text-gray-500">Loading awards...</span>
          </div>
        ) : error ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <span className="text-lg text-red-500">{error}</span>
          </div>
        ) : awards.length > 0 ? (
          <>
            {paginatedAwards.map((award) => (
              <AwardCard key={award._id} award={award} />
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
            <span className="text-lg text-gray-500">No awards found.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Awards;
