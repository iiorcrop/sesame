import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecurringEventById } from "../../services/api";
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";

const RecurringEventPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRecurringEventById(id);
        const found = data.recurringEvent || null;
        setEvent(found || null);

        // Filter images for latest year
        if (found && found.images && found.images.length > 0) {
          const years = found.images.map((img) => img.year);
          const latestYear = years.sort().reverse()[0];
          const filtered = found.images.filter(
            (img) => img.year === latestYear
          );
          setImages(filtered);
        } else {
          setImages([]);
        }
      } catch (err) {
        setError("Failed to load event. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const formatYear = (img) => img.year;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg text-gray-500">Loading event...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button
            onClick={() => navigate("/recurring-events")}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Recurring Events
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg text-gray-500">Event not found.</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 md:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/recurring-events")}
          className="flex items-center text-green-600 hover:text-green-800 mb-6 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Recurring Events
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full">
          {/* Images Gallery (latest year only) */}
          {images && images.length > 0 && (
            <div className="w-full flex flex-col items-center p-0 md:p-4">
              {/* Main Image Preview */}
              <div className="relative w-full aspect-video mb-4 overflow-hidden">
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.url}
                    alt={`Event image ${idx + 1}`}
                    className={`w-full h-full object-cover rounded-lg border border-gray-200 shadow-md transition-all duration-500 absolute top-0 left-0 ${
                      idx === selectedImage
                        ? "opacity-100 z-10 translate-x-0"
                        : "opacity-0 z-0 translate-x-8 pointer-events-none"
                    }`}
                    style={{ background: "#eee", aspectRatio: "16/9" }}
                  />
                ))}
                {/* Left Arrow */}
                {images.length > 1 && selectedImage > 0 && (
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 shadow-md z-20"
                    onClick={() => setSelectedImage(selectedImage - 1)}
                    aria-label="Previous image"
                  >
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                {/* Right Arrow */}
                {images.length > 1 && selectedImage < images.length - 1 && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 shadow-md z-20"
                    onClick={() => setSelectedImage(selectedImage + 1)}
                    aria-label="Next image"
                  >
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto w-full justify-center items-center">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      className={`border-2 rounded-md overflow-hidden focus:outline-none ${
                        selectedImage === idx
                          ? "border-green-600"
                          : "border-transparent"
                      }`}
                      style={{
                        minWidth: 80,
                        minHeight: 48,
                        maxWidth: 120,
                        maxHeight: 80,
                      }}
                      onClick={() => setSelectedImage(idx)}
                      aria-label={`Show image ${idx + 1}`}
                    >
                      <img
                        src={img.url}
                        alt={`Thumbnail ${idx + 1}`}
                        className={`object-cover w-full h-full transition-all duration-300 ${
                          selectedImage === idx
                            ? "ring-2 ring-green-500 scale-105"
                            : "scale-100"
                        }`}
                        style={{ aspectRatio: "16/9", background: "#eee" }}
                        onError={(e) =>
                          (e.target.src = "/api/placeholder/120/80")
                        }
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Event Content */}
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 leading-tight">
                {event.name}
              </h1>
            </div>

            {/* Meta Information */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              {images && images.length > 0 && (
                <div className="flex items-center text-gray-600">
                  <FaCalendarAlt className="mr-2 text-green-600" />
                  <span className="font-medium">
                    Year: {formatYear(images[0])}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Actions */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/recurring-events")}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
          >
            View All Recurring Events
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecurringEventPreview;
