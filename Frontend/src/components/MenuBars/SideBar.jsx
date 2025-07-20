import React from "react";
import { FaChevronRight } from "react-icons/fa6";

// Utility to extract plain text from HTML
const getPlainText = (html) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.innerText || "";
};

const Sidebar = ({
  subSubItems,
  activeSubItem,
  activeSubSubItem,
  handleSubSubItemClick,
  handleSubItemClick, // <-- Accept the handler
}) => {
  // Only show subSubItems whose sub_parent_id._id matches activeSubItem._id
  const filteredItems = (subSubItems || []).filter(
    (item) => item.sub_parent_id?._id === activeSubItem?._id
  );

  return (
    <nav className="bg-white/95 backdrop-blur border border-green-200 rounded shadow-xl p-4 flex flex-col gap-2 min-h-[300px]">
      <h3
        className="text-green-900 font-bold text-lg mb-4 pl-2  cursor-pointer tracking-wide border-l-4 border-green-500 bg-green-50/60 rounded text-left "
        onClick={handleSubItemClick}
      
      >
        {getPlainText(activeSubItem?.name || activeSubItem?.title || "Items")}
      </h3>
      <div className="flex flex-col">
        {filteredItems && filteredItems.length > 0 ? (
          filteredItems.map((subSubItem, idx) => {
            const isActive = activeSubSubItem?._id === subSubItem._id;
            return (
              <React.Fragment key={subSubItem._id}>
                <button
                  onClick={() => handleSubSubItemClick(subSubItem)}
                  className={`group flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-left relative overflow-hidden cursor-pointer
                    ${
                      isActive
                        ? "bg-gradient-to-r from-green-50 via-lime-50 to-white text-green-900 shadow border-l-[6px] border-green-700"
                        : "bg-transparent hover:bg-green-50 text-gray-800 border-l-[6px] border-transparent"
                    }
                  `}
                  title={getPlainText(subSubItem.title)}
                >
                  <span className="truncate flex-1 pl-1">{getPlainText(subSubItem.title)}</span>
                  {isActive && (
                    <FaChevronRight className="text-green-700 text-base ml-2" />
                  )}
                </button>
                {/* Divider except after last item */}
                {idx < filteredItems.length - 1 && (
                  <hr className="border-t border-green-200 mx-2" />
                )}
              </React.Fragment>
            );
          })
        ) : (
          <span className="text-gray-400 italic px-2 py-4">No items found.</span>
        )}
      </div>
    </nav>
  );
};

export default Sidebar;