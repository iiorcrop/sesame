import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaArrowLeft } from "react-icons/fa";
import { getNewsById } from "../../services/api";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const NewsPreview = () => {
  const { newsId } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getNewsById(newsId);
        setNews(data.news);
      } catch (err) {
        setError("Failed to load news. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    if (newsId) fetchNews();
  }, [newsId]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <span className="text-lg text-gray-500">Loading news...</span>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <span className="text-lg text-red-500">
          {error || "News not found."}
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-green-600 hover:text-green-800 mb-6 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>
        <div className="bg-white w-full rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <h1 className="text-3xl font-bold text-gray-800 leading-tight mb-2 md:mb-0">
              {news.title}
            </h1>
            <div className="flex items-center text-gray-500 text-sm">
              <FaCalendarAlt className="text-green-600 mr-2" />
              <span>{formatDate(news.date)}</span>
            </div>
          </div>
          <div
            className="text-gray-700 prose max-w-none leading-relaxed"
            dangerouslySetInnerHTML={{ __html: news.description }}
          />
        </div>
      </div>
    </div>
  );
};

export default NewsPreview;
