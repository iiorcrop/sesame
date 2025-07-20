import { FaCalendarAlt, FaClock } from "react-icons/fa";
import { getEventImageUrl } from "../../services/api";

const EventCard = ({ event, onClick }) => {
  // Helper to format date if needed in future
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden"
      onClick={onClick}
    >
      {/* Event Image */}
      <div className="relative h-48 bg-gradient-to-br from-green-500 to-green-700 overflow-hidden">
        {event.images && event.images.length > 0 ? (
          <>
            <img
              src={getEventImageUrl(event.images[0])}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                // Hide the image and show fallback
                e.target.style.display = "none";
                const fallback =
                  e.target.parentElement.querySelector(".fallback-gradient");
                if (fallback) {
                  fallback.style.display = "flex";
                }
              }}
              onLoad={(e) => {
                // Hide the fallback when image loads successfully
                const fallback =
                  e.target.parentElement.querySelector(".fallback-gradient");
                if (fallback) {
                  fallback.style.display = "none";
                }
              }}
            />
            {/* Loading placeholder */}
            <div
              className="fallback-gradient absolute inset-0 bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center"
              style={{ display: "none" }}
            >
              <span className="text-white text-4xl font-bold">
                {event.title.charAt(0).toUpperCase()}
              </span>
            </div>
          </>
        ) : (
          // No images available - show gradient with initial
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
            <span className="text-white text-4xl font-bold">
              {event.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Date Badge */}
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-lg px-3 py-2 text-center shadow-lg">
          <div className="text-sm font-semibold text-gray-800">
            {new Date(event.date).toLocaleDateString("en-US", {
              month: "short",
            })}
          </div>
          <div className="text-lg font-bold text-gray-800">
            {new Date(event.date).getDate()}
          </div>
        </div>
      </div>

      {/* Event Content */}
      <div className="p-6">
        {/* Event Title */}
        <h3 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2 leading-tight">
          {event.title}
        </h3>

        {/* Event Description */}
        <p
          className="text-gray-600 text-sm leading-relaxed mb-4"
          dangerouslySetInnerHTML={{ __html: event.description }}
        />

        {/* Read More Link */}
        <div className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors">
          Read More →
        </div>
      </div>
    </div>
  );
};

export default EventCard;
