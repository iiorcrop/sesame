import { useEffect, useState } from "react";
import { getRecurringEvents } from "../../services/api";
import RecurringEventCard from "./RecurringEventCard";
import YearFilter from "../events/YearFilter";
import { useNavigate } from "react-router-dom";

const RecurringEvents = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRecurringEvents();
        const allEvents = data.recurringEvents || [];
        setEvents(allEvents);
        // Collect all years from all images
        const years = [
          ...new Set(
            allEvents.flatMap((event) => event.images.map((img) => img.year))
          ),
        ].sort((a, b) => b - a);
        setAvailableYears(years);
      } catch (err) {
        setError("Failed to load recurring events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Filter events/images by selected year or show latest year
  const getDisplayEvents = () => {
    if (!selectedYear) {
      // For each event, show only images from its latest year
      return events.map((event) => {
        if (!event.images || event.images.length === 0) return event;
        const latestYear = event.images.reduce(
          (max, img) => (img.year > max ? img.year : max),
          event.images[0].year
        );
        return {
          ...event,
          images: event.images.filter((img) => img.year === latestYear),
        };
      });
    } else {
      // For each event, show only images from selected year
      return events.map((event) => ({
        ...event,
        images: event.images.filter((img) => img.year === selectedYear),
      }));
    }
  };
  const displayEvents = getDisplayEvents();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Recurring Events
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore our recurring events and their latest highlights.
          </p>
        </div>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <YearFilter
              years={availableYears}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
          </div>
          <div className="text-gray-600">
            {displayEvents.length > 0
              ? `Showing ${displayEvents.length} events`
              : "No events found"}
          </div>
        </div>
        {/* Events Grid */}
        {displayEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {displayEvents.map((event) => (
              <div
                key={event._id}
                onClick={() => navigate(`/recurring-events/${event._id}`)}
                className="cursor-pointer"
              >
                <RecurringEventCard event={event} />
              </div>
            ))}
          </div>
        ) : loading ? null : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-xl mb-4">
              {selectedYear
                ? `No recurring events found for ${selectedYear}`
                : "No recurring events available"}
            </div>
            {selectedYear && (
              <button
                onClick={() => setSelectedYear("")}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Show all events
              </button>
            )}
          </div>
        )}
        {loading && (
          <div className="min-h-[40vh] flex items-center justify-center">
            <span className="text-lg text-gray-500">
              Loading recurring events...
            </span>
          </div>
        )}
        {error && (
          <div className="min-h-[40vh] flex items-center justify-center">
            <span className="text-lg text-red-500">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecurringEvents;
