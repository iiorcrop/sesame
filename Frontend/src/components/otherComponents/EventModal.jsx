import React, { useState, useEffect } from "react";

const EventPopupModal = ({ imageUrl, onClose }) => {
  const [closing, setClosing] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    // Hide modal if sessionStorage says it's closed
    if (sessionStorage.getItem("eventPopupClosed") === "true") {
      setIsClosed(true);
    }
  }, []);

  const handleClose = () => {
    setClosing(true);
    sessionStorage.setItem("eventPopupClosed", "true");
    setTimeout(() => {
      setIsClosed(true);
      onClose();
    }, 300); // Match the animation duration
  };

  if (isClosed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#22212186] bg-opacity-40 backdrop-blur-sm px-4">
      <div
        className={`
          relative w-[90vw] max-w-2xl bg-white rounded-xl shadow-lg p-4
          transition-all duration-300
          ${closing
            ? "opacity-0 scale-95 translate-y-8 pointer-events-none"
            : "opacity-100 scale-100 translate-y-0"}
        `}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold focus:outline-none"
        >
          &times;
        </button>

        {/* Banner Image */}
        <div className="mt-5 w-full aspect-video rounded overflow-hidden">
          <img
            src={imageUrl}
            alt="Event Banner"
            className="w-full h-full object-fill"
          />
        </div>
      </div>
    </div>
  );
};
export default EventPopupModal;