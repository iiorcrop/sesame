import { useEffect, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { getNews } from "../../services/api";
import { useNavigate } from "react-router-dom";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const NewsCard = ({ news }) => {
  const navigate = useNavigate();
  return (
    <div
      className="bg-white w-full rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 mb-12 p-10 flex flex-col cursor-pointer group"
      onClick={() => navigate(`/news/${news._id}`)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") navigate(`/news/${news._id}`);
      }}
      aria-label={`View details for ${news.title}`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-3xl font-extrabold text-green-700 leading-tight mb-3 md:mb-0 group-hover:text-green-800 transition-colors">
          {news.title}
        </h2>
        <div className="flex items-center text-gray-500 text-base">
          <FaCalendarAlt className="text-green-600 mr-2" />
          <span>{formatDate(news.date)}</span>
        </div>
      </div>
      <div
        className="text-gray-800 prose prose-lg max-w-none leading-relaxed"
        dangerouslySetInnerHTML={{ __html: news.description }}
      />
    </div>
  );
};

const NewsList = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getNews();
        const today = new Date();
        const filtered = (data.news || []).filter((n) => {
          if (!n.expiresOn) return true;
          const expires = new Date(n.expiresOn);
          // Only show if expiresOn is today or in the future
          return (
            expires >=
            new Date(today.getFullYear(), today.getMonth(), today.getDate())
          );
        });
        setNewsList(filtered);
      } catch (err) {
        setError("Failed to load news. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <span className="text-lg text-gray-500">Loading news...</span>
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

  if (!newsList.length) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <span className="text-lg text-gray-500">No news found.</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl lg:text-4xl font-bold text-green-700 mb-8 text-center">
          Latest News
        </h1>
        {newsList.map((news) => (
          <NewsCard key={news._id} news={news} />
        ))}
      </div>
    </div>
  );
};

export default NewsList;
