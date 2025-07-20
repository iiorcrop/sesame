import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMedia } from "../../services/api";

const VideoPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMedia({ type: "video" });
        const found = data.find((item) => item._id === id);
        setVideo(found || null);
      } catch (err) {
        setError("Failed to load video.");
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg text-gray-500">Loading video...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button
            onClick={() => navigate(-1)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg text-gray-500">Video not found.</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-green-600 hover:text-green-800 mb-6 transition-colors"
        >
          &larr; Back to Videos
        </button>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div
            className="w-full bg-black flex items-center justify-center"
            style={{ aspectRatio: "16/9" }}
          >
            <iframe
              width="100%"
              height="500"
              src={getYoutubeEmbedUrl(video.content)}
              title={video.title}
              frameBorder="0"
              allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full"
              style={{ minHeight: 320, maxHeight: 600 }}
            ></iframe>
          </div>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
              {video.title}
            </h1>
            <div className="text-gray-500 text-center">
              Uploaded: {new Date(video.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function getYoutubeEmbedUrl(url) {
  if (!url) return "";
  const match = url.match(
    /(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url;
}

export default VideoPreview;
