import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getEvents } from "../../services/api";
import EventCard from "./EventCard";
import Pagination from "./Pagination";
import YearFilter from "./YearFilter";
import LoaderUI from "../LoaderUi";
import { toast } from "react-toastify";
import "../../css/Events.css";

const EventsList = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [selectedYear, setSelectedYear] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);

  const eventsPerPage = 12;

  // Fetch events
  const fetchEventsData = async (page = 1, year = null) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getEvents(page, eventsPerPage, year);

      if (response && response.events) {
        setEvents(response.events);
        setTotalEvents(response.length || response.events.length);
        setTotalPages(
          Math.ceil((response.length || response.events.length) / eventsPerPage)
        );

        // Extract unique years from events for filter
        const years = [
          ...new Set(
            response.events.map((event) => new Date(event.date).getFullYear())
          ),
        ].sort((a, b) => b - a);
        setAvailableYears(years);
      } else {
        setEvents([]);
        setTotalEvents(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events. Please try again later.");
      toast.error("Failed to load events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchEventsData(1, selectedYear);
  }, [selectedYear]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchEventsData(page, selectedYear);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle year filter change
  const handleYearChange = (year) => {
    setSelectedYear(year);
    setCurrentPage(1);
  };

  // Handle event click
  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  // Filter events by year on client side (fallback if backend doesn't support filtering)
  const filteredEvents = selectedYear
    ? events.filter(
        (event) => new Date(event.date).getFullYear() === parseInt(selectedYear)
      )
    : events;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderUI />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button
            onClick={() => fetchEventsData(1, selectedYear)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Events</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Stay updated with our latest events, workshops, and important
            announcements
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <YearFilter
              years={availableYears}
              selectedYear={selectedYear}
              onYearChange={handleYearChange}
            />
          </div>

          <div className="text-gray-600">
            {filteredEvents.length > 0
              ? `Showing ${filteredEvents.length} of ${totalEvents} events`
              : "No events found"}
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onClick={() => handleEventClick(event._id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-xl mb-4">
              {selectedYear
                ? `No events found for ${selectedYear}`
                : "No events available"}
            </div>
            {selectedYear && (
              <button
                onClick={() => handleYearChange(null)}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Show all events
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsList;
