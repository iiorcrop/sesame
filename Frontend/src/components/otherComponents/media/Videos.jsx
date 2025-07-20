import { useEffect, useState } from "react";
import { getMedia } from "../../services/api";

import { useNavigate } from "react-router-dom";

const Videos = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 9;

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMedia({ type: "video" });
        setVideos(data.filter((item) => item.type === "video"));
      } catch (err) {
        setError("Failed to load videos.");
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(videos.length / pageSize);
  const paginatedVideos = videos.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-green-700">
          Videos
        </h1>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <span className="text-lg text-gray-500">Loading videos...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : videos.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No videos found.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {paginatedVideos.map((video) => (
                <div
                  key={video._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/media/videos/${video._id}`)}
                  title="Preview video"
                >
                  <div className="aspect-video bg-black flex items-center justify-center">
                    <iframe
                      width="100%"
                      height="100%"
                      src={getYoutubeEmbedUrl(video.content)}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">
                      {video.title}
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

function getYoutubeEmbedUrl(url) {
  // Accepts both full and short YouTube URLs
  if (!url) return "";
  const match = url.match(
    /(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

export default Videos;
