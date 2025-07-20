import { FaFilter, FaTimes } from "react-icons/fa";

const YearFilter = ({ years, selectedYear, onYearChange }) => {
  return (
    <div className="flex items-center gap-2">
      <FaFilter className="text-gray-500" />
      <select
        value={selectedYear || ""}
        onChange={(e) => onYearChange(e.target.value || null)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
      >
        <option value="">All Years</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      {selectedYear && (
        <button
          onClick={() => onYearChange(null)}
          className="p-2 text-gray-500 hover:text-red-500 transition-colors"
          title="Clear filter"
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
};

export default YearFilter;
