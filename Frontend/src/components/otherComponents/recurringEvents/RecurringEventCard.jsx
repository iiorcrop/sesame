const RecurringEventCard = ({ event }) => {
  // Find the latest year among images
  const latestYear =
    event.images && event.images.length > 0
      ? event.images.reduce(
          (max, img) => (img.year > max ? img.year : max),
          event.images[0].year
        )
      : null;
  const latestImages = latestYear
    ? event.images.filter((img) => img.year === latestYear)
    : [];
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Images */}
      <div className="relative h-48 bg-gradient-to-br from-green-500 to-green-700 overflow-hidden flex items-center justify-center">
        {latestImages.length > 0 ? (
          <img
            src={latestImages[0].url}
            alt={event.name + " image " + latestYear}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.style.display = "none";
              const fallback =
                e.target.parentElement.querySelector(".fallback-gradient");
              if (fallback) fallback.style.display = "flex";
            }}
            onLoad={(e) => {
              const fallback =
                e.target.parentElement.querySelector(".fallback-gradient");
              if (fallback) fallback.style.display = "none";
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center fallback-gradient">
            <span className="text-white text-4xl font-bold">
              {event.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        {/* Year Badge */}
        {latestYear && (
          <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-lg px-3 py-2 text-center shadow-lg">
            <div className="text-sm font-semibold text-gray-800">Year</div>
            <div className="text-lg font-bold text-gray-800">{latestYear}</div>
          </div>
        )}
      </div>
      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2 leading-tight">
          {event.name}
        </h3>
      </div>
    </div>
  );
};

export default RecurringEventCard;
