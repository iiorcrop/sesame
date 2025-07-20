import React, { useEffect, useState } from 'react';
import { FaUserTie } from 'react-icons/fa';
import { fetchStaffDetails } from '../services/api';

const DEPARTMENTS = [
  { key: 'Former Directors', color: 'bg-gradient-to-r from-blue-500 to-blue-700' },
  { key: 'Scientific', color: 'bg-gradient-to-r from-green-500 to-green-700' },
  { key: 'Technical', color: 'bg-gradient-to-r from-yellow-500 to-yellow-700' },
  { key: 'Administrative & Finance', color: 'bg-gradient-to-r from-purple-500 to-purple-700' },
];
const SCIENTIFIC_DIVISIONS = [
  'Crop Improvement',
  'Crop Production',
  'Crop Protection',
  'Social sciences',
];
const ADMIN_DIVISIONS = [
  'Admin & Finance',
  'Drivers',
  'Supporting Staff',
];

const Staff = () => {
  const [staff, setStaff] = useState([]);
  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchStaffDetails();
        setStaff(response || []);
      } catch {
        setStaff([]);
      }
    };
    load();
  }, []);

  // Group staff by department/division (case-insensitive, fallback for missing fields)
  const [activeDept, setActiveDept] = useState(DEPARTMENTS[0].key);
  const [activeDivision, setActiveDivision] = useState(
    DEPARTMENTS[0].key === 'Scientific' ? SCIENTIFIC_DIVISIONS[0] : DEPARTMENTS[0].key === 'Administrative & Finance' ? ADMIN_DIVISIONS[0] : ''
  );
  const grouped = DEPARTMENTS.reduce((acc, dept) => {
    const deptKeyLower = dept.key.toLowerCase();
    if (dept.key === 'Scientific') {
      acc[dept.key] = SCIENTIFIC_DIVISIONS.reduce((divAcc, div) => {
        const divLower = div.toLowerCase();
        divAcc[div] = staff.filter(item => {
          const fields = item.data?.data || item.data || {};
          const department = (fields['Department'] || fields['687118e85fc2d2bb2fe2afda']?.value || '').toLowerCase();
          const division = (fields['Division'] || fields['division_hardcoded']?.value || '').toLowerCase();
          return department === deptKeyLower && division === divLower;
        });
        return divAcc;
      }, {});
    } else if (dept.key === 'Administrative & Finance') {
      acc[dept.key] = ADMIN_DIVISIONS.reduce((divAcc, div) => {
        const divLower = div.toLowerCase();
        divAcc[div] = staff.filter(item => {
          const fields = item.data?.data || item.data || {};
          const department = (fields['Department'] || fields['687118e85fc2d2bb2fe2afda']?.value || '').toLowerCase();
          const division = (fields['Division'] || fields['division_hardcoded']?.value || '').toLowerCase();
          return department === deptKeyLower && division === divLower;
        });
        return divAcc;
      }, {});
    } else {
      acc[dept.key] = staff.filter(item => {
        const fields = item.data?.data || item.data || {};
        const department = (fields['Department'] || fields['687118e85fc2d2bb2fe2afda']?.value || '').toLowerCase();
        return department === deptKeyLower;
      });
    }
    return acc;
  }, {});

  // Automatically select first division when department changes to Scientific/Admin
  React.useEffect(() => {
    if (activeDept === 'Scientific') {
      setActiveDivision(prev => SCIENTIFIC_DIVISIONS.includes(prev) ? prev : SCIENTIFIC_DIVISIONS[0]);
    } else if (activeDept === 'Administrative & Finance') {
      setActiveDivision(prev => ADMIN_DIVISIONS.includes(prev) ? prev : ADMIN_DIVISIONS[0]);
    } else {
      setActiveDivision('');
    }
  }, [activeDept]);

  return (
    <div className="min-h-screen bg-[#f7f7f7] py-10 px-2 sm:px-8 flex flex-col items-center">
      <div className="w-full max-w-6xl mx-auto bg-gradient-to-br from-gray-100 to-blue-50 rounded-2xl shadow-xl p-8 flex flex-col">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center tracking-wide">Staff</h1>
        {/* Department Tabs */}
        <div className="w-full flex flex-wrap justify-center gap-3 mb-8 border-b border-gray-200 pb-4">
          {DEPARTMENTS?.map(dept => (
            <button
              key={dept.key}
              className={`px-5 py-2 rounded-full font-semibold text-base sm:text-lg transition-all duration-200 focus:outline-none border-2 border-transparent ${activeDept === dept.key ? 'bg-blue-600 text-white scale-105 border-blue-400 shadow' : 'bg-white text-gray-700 hover:bg-blue-100 hover:border-blue-300'}`}
              onClick={() => {
                setActiveDept(dept.key);
              }}
            >
              <span className="flex items-center gap-2"><FaUserTie />{dept.key}</span>
            </button>
          ))}
        </div>
        {/* Division Tabs */}
        {activeDept === 'Scientific' && (
          <div className="w-full flex flex-wrap justify-center gap-2 mb-6 border-b border-gray-100 pb-3">
            {SCIENTIFIC_DIVISIONS?.map(div => (
              <button
                key={div}
                className={`px-4 py-1 rounded-full font-medium text-base transition-all duration-200 border-2 border-transparent ${activeDivision === div ? 'bg-green-600 text-white scale-105 border-green-400 shadow' : 'bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-300'}`}
                onClick={() => setActiveDivision(div)}
              >
                {div}
              </button>
            ))}
          </div>
        )}
        {activeDept === 'Administrative & Finance' && (
          <div className="w-full flex flex-wrap justify-center gap-2 mb-6 border-b border-gray-100 pb-3">
            {ADMIN_DIVISIONS?.map(div => (
              <button
                key={div}
                className={`px-4 py-1 rounded-full font-medium text-base transition-all duration-200 border-2 border-transparent ${activeDivision === div ? 'bg-purple-600 text-white scale-105 border-purple-400 shadow' : 'bg-purple-50 text-purple-700 hover:bg-purple-100 hover:border-purple-300'}`}
                onClick={() => setActiveDivision(div)}
              >
                {div}
              </button>
            ))}
          </div>
        )}
        {/* Department Heading */}
        <div className="w-full mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2 text-center">
            {activeDept}
            {activeDivision && <span className="ml-2 text-base text-gray-500">/ {activeDivision}</span>}
          </h2>
        </div>
        {/* Staff Cards Grid */}
        <div className="w-full rounded-lg p-2 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {/* Scientific */}
            {activeDept === 'Scientific' && activeDivision && (
              grouped['Scientific'][activeDivision]?.length === 0 ? (
                <div className="col-span-full text-center text-gray-400 py-4">No staff found in this division.</div>
              ) : (
                grouped['Scientific'][activeDivision]?.map(item => {
                  const fields = item.data?.data || item.data || {};
                  const img = fields.Image || 'https://ui-avatars.com/api/?name=Staff&background=eee&color=888&size=256';
                  const name = fields.Name || fields.Name?.value || '';
                  const designation = fields.Designation || fields.Designation?.value || '';
                  const email = fields['E-mail'] || fields['Email'] || '';
                  const contact = fields['Contact Address'] || fields['Contact'] || '';
                  return (
                    <div key={item._id} className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg p-6 flex flex-col items-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 animate-fade-in border border-gray-100 min-h-[320px]">
                      <div className="w-28 h-28 mb-4 flex items-center justify-center rounded-full overflow-hidden border-4 border-green-200 shadow-lg bg-gray-50">
                        <img src={img} alt={name} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-lg font-bold text-gray-800 mb-1 text-center">{name}</div>
                      <div className="text-green-700 text-base font-medium text-center mb-1">{designation}</div>
                      {email && <div className="text-xs text-gray-500 text-center">{email}</div>}
                      {contact && <div className="text-xs text-gray-500 text-center">{contact}</div>}
                    </div>
                  );
                })
              )
            )}
            {/* Admin & Finance */}
            {activeDept === 'Administrative & Finance' && activeDivision && (
              grouped['Administrative & Finance'][activeDivision]?.length === 0 ? (
                <div className="col-span-full text-center text-gray-400 py-4">No staff found in this division.</div>
              ) : (
                grouped['Administrative & Finance'][activeDivision]?.map(item => {
                  const fields = item.data?.data || item.data || {};
                  const img = fields.Image || 'https://ui-avatars.com/api/?name=Staff&background=eee&color=888&size=256';
                  const name = fields.Name || fields.Name?.value || '';
                  const designation = fields.Designation || fields.Designation?.value || '';
                  const email = fields['E-mail'] || fields['Email'] || '';
                  const contact = fields['Contact Address'] || fields['Contact'] || '';
                  return (
                    <div key={item._id} className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-lg p-6 flex flex-col items-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 animate-fade-in border border-gray-100 min-h-[320px]">
                      <div className="w-28 h-28 mb-4 flex items-center justify-center rounded-full overflow-hidden border-4 border-purple-200 shadow-lg bg-gray-50">
                        <img src={img} alt={name} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-lg font-bold text-gray-800 mb-1 text-center">{name}</div>
                      <div className="text-purple-700 text-base font-medium text-center mb-1">{designation}</div>
                      {email && <div className="text-xs text-gray-500 text-center">{email}</div>}
                      {contact && <div className="text-xs text-gray-500 text-center">{contact}</div>}
                    </div>
                  );
                })
              )
            )}
            {/* Other Departments */}
            {activeDept !== 'Scientific' && activeDept !== 'Administrative & Finance' && (
              grouped[activeDept]?.length === 0 ? (
                <div className="col-span-full text-center text-gray-400 py-4">No staff found in this section.</div>
              ) : (
                grouped[activeDept]?.map(item => {
                  const fields = item.data?.data || item.data || {};
                  const img = fields.Image || 'https://ui-avatars.com/api/?name=Staff&background=eee&color=888&size=256';
                  const name = fields.Name || fields.Name?.value || '';
                  const designation = fields.Designation || fields.Designation?.value || '';
                  const email = fields['E-mail'] || fields['Email'] || '';
                  const contact = fields['Contact Address'] || fields['Contact'] || '';
                  return (
                    <div key={item._id} className="bg-gradient-to-br from-white to-gray-100 rounded-xl shadow-lg p-6 flex flex-col items-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 animate-fade-in border border-gray-100 min-h-[320px]">
                      <div className="w-28 h-28 mb-4 flex items-center justify-center rounded-full overflow-hidden border-4 border-blue-200 shadow-lg bg-gray-50">
                        <img src={img} alt={name} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-lg font-bold text-gray-800 mb-1 text-center">{name}</div>
                      <div className="text-blue-700 text-base font-medium text-center mb-1">{designation}</div>
                      {email && <div className="text-xs text-gray-500 text-center">{email}</div>}
                      {contact && <div className="text-xs text-gray-500 text-center">{contact}</div>}
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>
      </div>
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Staff;
