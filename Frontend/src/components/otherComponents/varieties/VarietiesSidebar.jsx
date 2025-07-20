import React from "react";

const VarietiesSidebar = ({ varieties, activeVariety, onVarietySelect }) => {
  return (
    <aside className="bg-white/90 backdrop-blur border border-green-200 rounded-2xl shadow-xl p-4 min-w-[220px] max-w-xs">
      <h3 className="text-green-900 font-bold text-xl mb-4 pl-2 tracking-wide border-l-4 border-green-500 bg-green-50/60 rounded">
        Varieties
      </h3>
      <ul className="flex flex-col gap-1">
        {varieties.map((variety, idx) => (
          <React.Fragment key={variety.id}>
            <li
              className={`group flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 font-medium relative
                ${
                  activeVariety?.id === variety.id
                    ? "bg-gradient-to-r from-green-50 via-lime-50 to-white text-green-900 shadow border-l-4 border-green-700"
                    : "bg-transparent hover:bg-green-50 text-gray-800 border-l-4 border-transparent"
                }
              `}
              onClick={() => onVarietySelect(variety)}
            >
              <span className="truncate flex-1">{variety.name}</span>
              {activeVariety?.id === variety.id && (
                <span className="ml-2 w-2 h-2 rounded-full bg-green-600 shadow" />
              )}
            </li>
            {idx !== varieties.length - 1 && (
              <hr className="my-1 border-green-100" />
            )}
          </React.Fragment>
        ))}
      </ul>
    </aside>
  );
};
export default VarietiesSidebar;
