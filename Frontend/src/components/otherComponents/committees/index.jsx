import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCommittees } from "../../services/api";
import { unsanitizeText } from "../../../../utils/textUtils";

const CommitteeMenu = ({ committees, selectedId, onSelect }) => (
  <aside className="w-full sm:w-64 bg-green-50 rounded-xl p-4 mb-6 sm:mb-0">
    <div className="font-bold text-lg text-green-700 mb-4">Committees</div>
    <ul className="space-y-2">
      {committees.map((c) => (
        <li key={c._id}>
          <button
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-medium ${
              selectedId === c._id
                ? "bg-green-600 text-white shadow"
                : "hover:bg-green-100 text-green-800"
            }`}
            onClick={() => onSelect(c._id)}
          >
            {c.name}
          </button>
        </li>
      ))}
    </ul>
  </aside>
);

const CommitteeMembersTable = ({ committee }) => (
  <div className="bg-white rounded-xl shadow p-6 w-full">
    <h2 className="text-2xl font-bold text-green-700 mb-4">{committee.name}</h2>
    <div className="text-gray-700 mb-6 text-base font-medium">
      {committee.description}
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 rounded-lg">
        <thead>
          <tr className="bg-green-100 text-green-900">
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Role</th>
            {committee.members.some((m) => m.designation) && (
              <th className="px-4 py-2 text-left">Designation</th>
            )}
          </tr>
        </thead>
        <tbody>
          {committee.members.map((m, idx) => (
            <tr
              key={idx}
              className={idx % 2 === 0 ? "bg-green-50" : "bg-white"}
            >
              <td className="px-4 py-2 font-medium text-green-900">{m.name}</td>
              <td className="px-4 py-2 text-gray-800">{m.role}</td>
              {committee.members.some((mem) => mem.designation) && (
                <td className="px-4 py-2 text-gray-800">
                  {m.designation ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: unsanitizeText(m.designation),
                      }}
                    />
                  ) : (
                    ""
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const Committees = () => {
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchCommittees = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCommittees();
        setCommittees(data.data || []);
      } catch (err) {
        setError("Failed to load committees. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchCommittees();
  }, []);

  // If no id in URL, redirect to first committee
  useEffect(() => {
    if (!loading && committees.length > 0 && !id) {
      navigate(`/committees/${committees[0]._id}`, { replace: true });
    }
  }, [loading, committees, id, navigate]);

  const handleSelect = (committeeId) => {
    navigate(`/committees/${committeeId}`);
  };

  const selectedCommittee = committees.find((c) => c._id === id);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl flex flex-col sm:flex-row gap-8">
        <CommitteeMenu
          committees={committees}
          selectedId={id}
          onSelect={handleSelect}
        />
        <div className="flex-1">
          {loading ? (
            <div className="min-h-[40vh] flex items-center justify-center">
              <span className="text-lg text-gray-500">
                Loading committees...
              </span>
            </div>
          ) : error ? (
            <div className="min-h-[40vh] flex items-center justify-center">
              <span className="text-lg text-red-500">{error}</span>
            </div>
          ) : selectedCommittee ? (
            <CommitteeMembersTable committee={selectedCommittee} />
          ) : (
            <div className="min-h-[40vh] flex items-center justify-center">
              <span className="text-lg text-gray-500">
                No committee selected.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Committees;
