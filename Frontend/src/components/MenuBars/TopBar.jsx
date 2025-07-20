import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { fetchMainItems, fetchSubItems } from "../services/api";
import { MdOutlineClose, MdMenu } from "react-icons/md";
import { useAccessibility } from "../../Context/AccessibilityContext";

const TopBar = () => {
  const [mainItems, setMainItems] = useState([]);
  const [activeMainItem, setActiveMainItem] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  const activeItem = sessionStorage.getItem("activeItem");

  useEffect(() => {
    fetchMainItemsData();

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line
  }, []);

  const cleanSubItemNames = (name) => name.replace(/<[^>]*>/g, "");

  const fetchMainItemsData = async () => {
    try {
      const mainItemsData = await fetchMainItems();
      const subItemsData = await fetchSubItems();

      const sortedMainItems = mainItemsData.sort(
        (a, b) => a.position - b.position
      );

      const structuredItems = sortedMainItems.map((mainItem) => {
        const subItemsForMainItem = subItemsData
          .filter(
            (subItem) => subItem.parent_id?.position === mainItem.position
          )
          .map((subItem) => ({
            label: cleanSubItemNames(subItem.name),
            to: subItem.to || `/sub/${subItem._id}`,
          }));

        return {
          label: mainItem.name,
          to: mainItem.url || `/main/${mainItem._id}`,
          subItems: subItemsForMainItem.length > 0 ? subItemsForMainItem : null,
        };
      }); // Step 3: Inject Home, Market Data, and MSP Data at top/bottom

      setMainItems([
        { label: "Home", to: "/home", subItems: null },
        ...structuredItems,
      ]);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const location = useLocation();

  // Helper to check if a main item is active
  const isMainItemActive = (item) => {
    // For items like /sub/..., check if the path starts with /sub/
    if (item.to.startsWith("/sub/")) {
      return location.pathname.startsWith("/sub/");
    }
    // For other items, check if the path starts with the item's to
    return (
      location.pathname === item.to ||
      location.pathname.startsWith(item.to + "/")
    );
  };

  const handleMainItemClick = (item) => {
    if (isMobile) {
      setActiveMainItem(activeMainItem?.label === item.label ? null : item);
    }
  };
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toCamelCase = (str) => {
    return str
      .toLowerCase()
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (match, index) =>
        index === 0 ? match.toLowerCase() : match.toUpperCase()
      )
      .replace(/\s+/g, "");
  };

  return (
    <nav className="bg-gradient-to-r from-green-100 via-green-50 to-green-100 shadow-lg w-full z-30 border-b border-green-200 transition-all duration-500">
      <div className="max-w-[1300px] mx-auto px-4 py-3 flex justify-between items-center">
        <div className="md:hidden">
          {menuOpen ? (
            <MdOutlineClose
              onClick={toggleMenu}
              className="text-2xl text-green-700 transition-transform duration-200 hover:scale-110"
            />
          ) : (
            <button onClick={toggleMenu} className="text-green-700">
              <MdMenu className="text-2xl transition-transform duration-200 hover:scale-110" />
            </button>
          )}
        </div>
      </div>

      {/* Desktop Menu */}
      <div className="hidden relative md:flex flex-wrap justify-center gap-x-8 gap-y-3 px-6 pb-3">
        {mainItems.map((item, index) => (
          <div key={index} className="relative group" role="none">
            <Link
              to={item.to}
              onClick={() => {
                sessionStorage.setItem("activeItem", item.label);
              }}
              className={`relative text-green-900 font-semibold px-3 py-2 rounded transition-all duration-300
                hover:bg-green-100 hover:text-green-700
                after:absolute after:left-0 after:bottom-0 after:w-0 after:h-0.5 after:bg-green-700 after:transition-all after:duration-300 group-hover:after:w-full  ${
                  activeItem === item.label
                    ? "bg-green-100 text-green-700 after:w-full"
                    : ""
                }`}
            >
              {item.label}
            </Link>
            {item.subItems && (
              <ul className="absolute  top-8 left-0  right-0 bg-white shadow-xl border border-green-100 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20 min-w-[200px]">
                {item.subItems.map((subItem, subIndex) => (
                  <li
                    key={subIndex}
                    className="hover:bg-green-50 rounded"
                    onClick={() => {
                      sessionStorage.setItem("activeItem", item.label);
                    }}
                  >
                    <Link
                      to={
                        subItem.label === "Survey form"
                          ? `/${toCamelCase(subItem.label)}`
                          : subItem.to
                      }
                      className="block px-5 py-2 text-sm text-green-900 hover:text-green-700 transition-colors duration-200"
                    >
                      {subItem.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <ul className="md:hidden px-4 pb-4 space-y-2 bg-white border-t animate-fade-in-down">
          {mainItems.map((item, index) => (
            <li key={index}>
              <button
                onClick={() => {
                  if (item.subItems) {
                    handleMainItemClick(item);
                  } else {
                    setMenuOpen(false);
                    navigate(item.to);
                  }
                }}
                className="w-full text-left font-semibold py-2 flex justify-between items-center"
              >
                <span>{item.label}</span>
                {item.subItems && (
                  <svg
                    className={`w-4 h-4 transform transition-transform ${
                      activeMainItem?.label === item.label ? "rotate-90" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </button>

              {isMobile &&
                activeMainItem?.label === item.label &&
                item.subItems && (
                  <ul className="pl-4 space-y-1">
                    {item.subItems.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <Link
                          to={subItem.to}
                          className="block py-1 text-sm text-green-700"
                          onClick={() => setMenuOpen(false)}
                        >
                          {subItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};

export default TopBar;
