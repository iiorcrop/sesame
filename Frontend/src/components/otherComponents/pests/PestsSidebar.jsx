import React from "react";

const PestsSidebar = ({ pests, activepest, onpestSelect }) => {
  return (
    <aside className="bg-white/90 backdrop-blur border border-green-200 rounded-2xl shadow-xl p-4 min-w-[220px] max-w-xs">
      <h2 className="text-green-900 font-bold text-xl mb-4 pl-2 tracking-wide border-l-4 border-green-500 bg-green-50/60 rounded">
        Pests
      </h2>
      <ul className="flex flex-col gap-0">
        {pests.map((pest, idx) => (
          <React.Fragment key={pest.id}>
            <li
              className={`group flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 font-medium relative
                ${
                  activepest?.id === pest.id
                    ? "bg-gradient-to-r from-green-50 via-lime-50 to-white text-green-900 shadow border-l-4 border-green-700"
                    : "bg-transparent hover:bg-green-50 text-gray-800 border-l-4 border-transparent"
                }
              `}
              onClick={() => onpestSelect(pest)}
            >
              <span className="truncate flex-1">{pest.name}</span>
              {activepest?.id === pest.id && (
                <span className="ml-2 w-2 h-2 rounded-full bg-green-600 shadow" />
              )}
            </li>
            {idx !== pests.length - 1 && (
              <hr className="my-1 border-green-100" />
            )}
          </React.Fragment>
        ))}
      </ul>
    </aside>
  );
}
export default PestsSidebar;