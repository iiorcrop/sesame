import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMedia } from "../../services/api";

const PressList = () => {
  const [pressList, setPressList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPress = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMedia({ type: "press" });
        setPressList(data.filter((item) => item.type === "press"));
      } catch (err) {
        setError("Failed to load press content.");
      } finally {
        setLoading(false);
      }
    };
    fetchPress();
  }, []);

  const totalPages = Math.ceil(pressList.length / pageSize);
  const paginatedPress = pressList.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-green-700">
          Press Content
        </h1>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <span className="text-lg text-gray-500">
              Loading press content...
            </span>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : pressList.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No press content found.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {paginatedPress.map((press) => (
                <div
                  key={press._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/media/press/${press._id}`)}
                  title="Preview press content"
                >
                  <div className="aspect-video bg-black flex items-center justify-center">
                    {isYoutubeUrl(press.content) ? (
                      <iframe
                        width="100%"
                        height="100%"
                        src={getYoutubeEmbedUrl(press.content)}
                        title={press.title}
                        frameBorder="0"
                        allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    ) : (
                      <img
                        src={press.content}
                        alt={press.title}
                        className="w-full h-full object-contain bg-white"
                      />
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">
                      {press.title}
                    </h2>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded bg-green-600 text-white disabled:bg-gray-300 disabled:text-gray-500"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-2 rounded-full mx-1 font-semibold border-2 transition-colors duration-200 ${
                      page === i + 1
                        ? "bg-green-700 text-white border-green-700"
                        : "bg-white text-green-700 border-green-300 hover:bg-green-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded bg-green-600 text-white disabled:bg-gray-300 disabled:text-gray-500"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

function isYoutubeUrl(url) {
  if (!url) return false;
  return /(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/.test(
    url
  );
}

function getYoutubeEmbedUrl(url) {
  if (!url) return "";
  const match = url.match(
    /(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url;
}

export default PressList;
