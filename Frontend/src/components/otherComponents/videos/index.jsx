import { useEffect, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { getVideos } from "../../services/api";
import { useNavigate } from "react-router-dom";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const VideoCard = ({ video }) => {
  const navigate = useNavigate();
  return (
    <div
      className="bg-white w-full rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 mb-12 p-8 flex flex-col cursor-pointer group"
      onClick={() => navigate(`/videos/${video._id}`)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ")
          navigate(`/videos/${video._id}`);
      }}
      aria-label={`View details for ${video.title}`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-extrabold text-green-700 leading-tight mb-3 md:mb-0 group-hover:text-green-800 transition-colors">
          {video.title}
        </h2>
        <div className="flex items-center text-gray-500 text-base">
          <FaCalendarAlt className="text-green-600 mr-2" />
          <span>{formatDate(video.date)}</span>
        </div>
      </div>
      <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
        {video.url ? (
          <video controls className="w-full h-full object-cover">
            <source src={video.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <span className="text-gray-400">No video available</span>
        )}
      </div>
      <div
        className="text-gray-800 prose max-w-none leading-relaxed"
        dangerouslySetInnerHTML={{ __html: video.description || "" }}
      />
    </div>
  );
};

const VideosList = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getVideos();
        setVideos(data.videos || []);
      } catch (err) {
        setError("Failed to load videos. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <span className="text-lg text-gray-500">Loading videos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <span className="text-lg text-red-500">{error}</span>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <span className="text-lg text-gray-500">No videos found.</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl lg:text-4xl font-bold text-green-700 mb-8 text-center">
          Videos
        </h1>
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default VideosList;
