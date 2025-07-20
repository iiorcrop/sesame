import { Routes, Route } from "react-router-dom";
import EventsList from "./EventsList";
import EventDetail from "./EventDetail";

function Events() {
  return (
    <Routes>
      <Route path="/" element={<EventsList />} />
      <Route path="/:eventId" element={<EventDetail />} />
    </Routes>
  );
}

export default Events;
