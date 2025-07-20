import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventById, getEventImageUrl } from "../../services/api";
import LoaderUI from "../LoaderUi";
import { toast } from "react-toastify";
import {
  FaCalendarAlt,
  FaClock,
  FaArrowLeft,
  FaShare,
  FaDownload,
} from "react-icons/fa";
import "../../css/Events.css";

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getEventById(eventId);

        if (response && response.event) {
          setEvent(response.event);
        } else {
          setError("Event not found");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        setError("Failed to load event details");
        toast.error("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      } catch (error) {
        console.error("Error copying to clipboard:", error);
        toast.error("Failed to copy link");
      }
    }
  };

  const handleDownload = () => {
    // Create a downloadable text file with event details
    const eventData = `
Event: ${event.title}
Date: ${formatDate(event.date)}
Time: ${formatTime(event.date)}

Description:
${event.description}

Created: ${formatDate(event.createdAt)}
    `.trim();

    const blob = new Blob([eventData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}_event_details.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderUI />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="text-red-500 text-xl mb-4">
              {error || "Event not found"}
            </div>
            <button
              onClick={() => navigate("/events")}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate("/events")}
          className="flex items-center text-green-600 hover:text-green-800 mb-6 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Events
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Event Images Gallery */}
          {event.images && event.images.length > 0 && (
            <div className="w-full flex flex-col items-center p-4">
              {/* Main Image Preview */}
              <div className="relative w-full aspect-video mb-4 overflow-hidden">
                {event.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={getEventImageUrl(img)}
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
                {event.images.length > 1 && selectedImage > 0 && (
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
                {event.images.length > 1 &&
                  selectedImage < event.images.length - 1 && (
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
              {event.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto w-full max-w-2xl justify-center mx-auto">
                  {event.images.map((img, idx) => (
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
                        src={getEventImageUrl(img)}
                        alt={`Thumbnail ${idx + 1}`}
                        className={`object-cover w-full h-full transition-all duration-300 ${
                          selectedImage === idx
                            ? "ring-2 ring-green-500 scale-105"
                            : "scale-100"
                        }`}
                        style={{ aspectRatio: "16/9", background: "#eee" }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Event Content */}
          <div className="p-6 lg:p-8">
            {/* Header with actions */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 leading-tight">
                {event.title}
              </h1>

              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  title="Share Event"
                >
                  <FaShare className="mr-2" />
                  Share
                </button>
              </div>
            </div>

            {/* Event Meta Information */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center text-gray-600">
                <FaCalendarAlt className="mr-2 text-green-600" />
                <span className="font-medium">{formatDate(event.date)}</span>
              </div>
            </div>

            <div
              className="text-gray-700 prose max-w-none leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          </div>
        </div>

        {/* Related Actions */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/events")}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
          >
            View All Events
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
