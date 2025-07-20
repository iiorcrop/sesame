import { useEffect, useState } from "react";
import { getAnualReports } from "../../services/api";
import { FaFilePdf } from "react-icons/fa";

const AnualReportCard = ({ report }) => (
  <a
    href={report.report}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center p-4 cursor-pointer group hover:border-green-600"
    title={`Open report for ${report.year}`}
  >
    <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center mb-4">
      {report.image ? (
        <img
          src={report.image}
          alt={`Anual Report ${report.year}`}
          className="object-cover w-full h-full"
          onError={(e) => (e.target.style.display = "none")}
        />
      ) : (
        <FaFilePdf className="text-5xl text-gray-400" />
      )}
    </div>
    <div className="text-lg font-bold text-green-700 group-hover:text-green-800 mb-1">
      {report.year}
    </div>
  </a>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex justify-center mt-8 gap-2">
    {Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i}
        className={`px-4 py-2 rounded-lg border text-base font-medium transition-colors ${
          currentPage === i + 1
            ? "bg-green-600 text-white border-green-600"
            : "bg-white text-green-700 border-gray-300 hover:bg-green-50"
        }`}
        onClick={() => onPageChange(i + 1)}
        disabled={currentPage === i + 1}
      >
        {i + 1}
      </button>
    ))}
  </div>
);

const AnualReportsList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 8;

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAnualReports();

        setReports(data.data || []);
      } catch (err) {
        setError("Failed to load reports. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(reports.length / reportsPerPage);
  const paginatedReports = reports.slice(
    (currentPage - 1) * reportsPerPage,
    currentPage * reportsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <span className="text-lg text-gray-500">Loading reports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <span className="text-lg text-red-500">{error}</span>
      </div>
    );
  }

  if (!reports.length) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <span className="text-lg text-gray-500">No reports found.</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl lg:text-4xl font-bold text-green-700 mb-8 text-center">
          Anual Reports
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {paginatedReports.map((report) => (
            <AnualReportCard key={report._id} report={report} />
          ))}
        </div>
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default AnualReportsList;
