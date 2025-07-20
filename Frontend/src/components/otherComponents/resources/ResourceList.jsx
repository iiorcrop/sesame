import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getResources } from "../../services/api";
import { unsanitizeText } from "../../../../utils/textUtils";

const RESOURCE_TYPES = [
  "pops",
  "news-letter",
  "research-paper",
  "book",
  "book-chapter",
  "article",
  "technical-bulletins",
  "training-manual",
  "e-publications",
  "policy-paper",
  "extension-folder",
];

const ResourceList = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [yearFilter, setYearFilter] = useState("");

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getResources({ type });
        setResources(data.filter((item) => item.type === type));
      } catch (err) {
        setError("Failed to load resources.");
      } finally {
        setLoading(false);
      }
    };
    if (type) fetchResources();
  }, [type]);

  useEffect(() => {
    // Redirect to first resource type if no type is specified
    if (!type && RESOURCE_TYPES.length > 0) {
      navigate(`/resources/${RESOURCE_TYPES[0]}`, { replace: true });
    }
  }, [type, navigate]);

  // Filter resources by year
  const filteredResources = yearFilter
    ? resources.filter((r) => r.year === Number(yearFilter))
    : resources;

  // Get all years for dropdown
  const yearOptions = Array.from(new Set(resources.map((r) => r.year))).sort(
    (a, b) => b - a
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 flex">
      {/* Left side menu */}
      <aside className="w-64 bg-white shadow-lg rounded-lg p-6 mr-8 h-fit sticky top-8 self-start">
        <h2 className="text-xl font-bold mb-4 text-green-700">
          Resource Types
        </h2>
        <ul className="space-y-2">
          {RESOURCE_TYPES.map((t) => (
            <li key={t}>
              <button
                className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                  type === t
                    ? "bg-green-700 text-white"
                    : "bg-gray-100 text-green-700 hover:bg-green-100"
                }`}
                onClick={() => navigate(`/resources/${t}`)}
              >
                {t.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      {/* Main content */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-6 text-green-700">
          {type
            ? type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
            : "Select a Resource Type"}
        </h1>
        {/* Year filter */}
        {yearOptions.length > 0 && (
          <div className="mb-6 flex items-center gap-2">
            <label htmlFor="year" className="font-semibold text-gray-700">
              Filter by Year:
            </label>
            <select
              id="year"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-2 rounded border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Years</option>
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* Resource list */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <span className="text-lg text-gray-500">Loading resources...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No resources found.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredResources.map((resource) => (
              <div
                key={resource._id}
                className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col p-6 w-full relative"
              >
                <span
                  className="absolute top-4 right-4 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold shadow"
                  title="Year"
                >
                  {resource.year}
                </span>
                <div
                  className="text-xl font-semibold"
                  dangerouslySetInnerHTML={{
                    __html: unsanitizeText(resource.content),
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceList;
