import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchSubSubItems } from "../services/api";
import Sidebar from "../MenuBars/SideBar";
import LoaderUI from "./LoaderUi";
import parse from "html-react-parser";
import { WorldMap } from "react-svg-worldmap";
import countries from "world-countries"; // Install this package


// ✅ Normalize MS Word/Office HTML with list & alignment handling
function normalizeOfficeHtml(html) {
  if (!html) return "";

  let normalized = html;

  normalized = normalized.replace(
    /<p([^>]*)class="[^"]*MsoListParagraph[^"]*"([^>]*)>([\s\S]*?)<\/p>/gi,
    (match, before, after, content) => {
      const fullAttr = `${before} ${after}`.toLowerCase();
      const plainText = content.replace(/<[^>]+>/g, "").trim();

      const looksLikeList = /^(\d{1,2}[\.\)]|[a-zA-Z][\.\)]|•|▪|–|-|\u2022|\(\d+\))/.test(plainText);
      const isCentered = fullAttr.includes("align=center") || fullAttr.includes("text-align: center");
      const centerAttr = isCentered ? ` data-align="center"` : "";

      return looksLikeList
        ? `<li${centerAttr}>${content}</li>`
        : `<p${centerAttr}>${content}</p>`;
    }
  );

  normalized = normalized.replace(
    /(?:^|\n|\r|\s*)((<li[^>]*>[\s\S]*?<\/li>)+)(?![\s\S]*?(<\/ul>|<\/ol>))/gi,
    (match) => {
      if (/<\/?(ol|ul)>/i.test(match)) return match;
      return `<ol>${match}</ol>`;
    }
  );

  normalized = normalized
    .replace(/<ol>\s*<\/ol>/gi, "")
    .replace(/<ul>\s*<\/ul>/gi, "")
    .replace(/<font[^>]*>/gi, "")
    .replace(/<\/font>/gi, "")
    .replace(/<o:p>\s*<\/o:p>/gi, "")
    .replace(/<o:p>.*?<\/o:p>/gi, "")
    .replace(/&nbsp;/g, " ");

  return normalized;
}

const cleanHtml = (html) =>
  parse(html || "", {
    replace: (domNode) => {
      if (domNode.attribs) {
        delete domNode.attribs.style;
        delete domNode.attribs.align;

        if (domNode.attribs["data-align"] === "center") {
          domNode.attribs.style = "text-align: center";
        }
      }
    },
  });

const getPlainText = (html) => {
  if (!html) return "";
  const doc = new window.DOMParser().parseFromString(html, "text/html");
  return doc.body.innerText || "";
};

// 🌍 Countries for Geographical Distribution
 
const SubSubItemContent = ({ activeSubItem }) => {
  const { subId, id } = useParams();
  const [subSubItems, setSubSubItems] = useState([]);
  const [activeSubSubItem, setActiveSubSubItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubSubItemsData = async () => {
      try {
        setLoading(true);
        const data = await fetchSubSubItems(subId, id);
        setSubSubItems(data);

        if (id) {
          const foundSubSubItem = data.find((item) => item._id === id);
          setActiveSubSubItem(foundSubSubItem);
        } else {
          setActiveSubSubItem(null);
        }
      } catch (error) {
        console.error("Error fetching sub-sub items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubSubItemsData();
  }, [subId, id]);

  const handleSubSubItemClick = (subSubItem) => {
    setActiveSubSubItem(subSubItem);
  };

  const handleSubItemClick = () => {
    setActiveSubSubItem(null);
  };

 

function extractCountriesFromText(text) {
  if (!text) return [];

  // Map region/alias to ISO code(s)
  const aliasMap = {
    "east africa": ["UG", "TZ", "KE", "ET", "SO", "BI", "RW", "DJ", "ER", "MG", "MW", "MZ", "ZM", "ZW"], // add/remove as needed
    "central africa": ["CF", "CM", "TD", "CG", "CD", "GQ", "GA", "AO"],
    "south africa": ["ZA"],
    "former ussr": ["RU"],
    "ussr": ["RU"],
    "persian gulf": [], // skip, not a country
    "savannah complex": [], // skip, not a country
  };

  // Clean and normalize text
  const plainText = text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()’‘']/g, " ")
    .replace(/\s{2,}/g, " ");

  const matched = new Set();

  // 1. Match aliases/regions
  Object.entries(aliasMap).forEach(([alias, codes]) => {
    if (plainText.includes(alias) && codes.length > 0) {
      codes.forEach((code) => matched.add(code));
    }
  });

  // 2. Match all country names from world-countries
  countries.forEach((country) => {
    const name = country.name.common.toLowerCase();
    // Use word boundaries for exact match
    const regex = new RegExp(`\\b${name}\\b`, "i");
    if (regex.test(plainText)) {
      matched.add(country.cca2);
    }
  });

  // 3. Return as array for WorldMap
  return Array.from(matched).map((code) => ({
    country: code,
    value: 1,
  }));
}

console.log('clean text', getPlainText(activeSubItem.description))

  return (
    <div className="flex flex-col md:flex-row gap-8 px-2 md:px-8 py-8 min-h-[60vh] bg-gradient-to-br from-green-50 via-white to-lime-50">
      {activeSubItem && subSubItems.length > 0 && (
        <aside className="md:w-1/4 mb-4 md:mb-0">
          <div className="sticky top-24">
            <Sidebar
              subSubItems={subSubItems}
              activeSubItem={activeSubItem}
              activeSubSubItem={activeSubSubItem}
              handleSubSubItemClick={handleSubSubItemClick}
              handleSubItemClick={handleSubItemClick}
            />
          </div>
        </aside>
      )}
      <main className="flex-1 flex flex-col items-start justify-start">
        {loading ? (
          <div className="flex justify-center items-center h-64 w-full">
            <LoaderUI />
          </div>
        ) : activeSubSubItem ? (
          <section className="w-full max-w-4xl animate-fade-in-up">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-5 leading-tight bg-gradient-to-r from-green-700 via-lime-600 to-green-400 bg-clip-text text-transparent tracking-tight">
              {getPlainText(activeSubSubItem.title)}
            </h1>
            <div className="custom-desc mb-6">
              {cleanHtml(normalizeOfficeHtml(activeSubSubItem.description))}
            </div>
         
          </section>
        ) : activeSubItem ? (
          <section className="w-full max-w-4xl animate-fade-in-up">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-5 leading-tight bg-gradient-to-r from-green-700 via-lime-600 to-green-400 bg-clip-text text-transparent tracking-tight">
              {getPlainText(activeSubItem.name)}
            </h1>
            <div className="custom-desc">
              {cleanHtml(normalizeOfficeHtml(activeSubItem.description))}
            </div>
               {getPlainText(activeSubItem.name).includes("Geographical") && (
              <div className="w-full   mt-8 m-auto flex items-center justify-center">
             
             <WorldMap
  color="green"
  size="responsive"
   style={{ width: "100%", minWidth: 350, maxWidth: 100, background: "transparent" }}
       
  data={extractCountriesFromText(getPlainText(activeSubItem.description))}
  tooltipTextFunction={({ countryName }) => `${countryName}`}
/>
              </div>
            )}
          </section>
        ) : (
          <div className="text-gray-400 text-center mt-10">No content found.</div>
        )}
      </main>

      <style>
        {`
        .custom-desc, .custom-desc * {
          font-size: 20px !important;
          font-family: "Times New Roman", serif;
          line-height: 1.7 !important;
          color: #222 !important;
          text-align: justify !important;
        }
          .worldmap__figure-container {
          background : #9d939300 !important;
          width: 100% !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          
          }
        .custom-desc ol, .custom-desc ul {
          margin-left: 1.5rem;
          padding-left: 1.5rem;
          list-style-position: outside;
        }
        .custom-desc ol {
          list-style-type: decimal;
        }
        .custom-desc ul {
          list-style-type: disc;
        }
        .custom-desc p[style*="text-align: center"],
        .custom-desc li[style*="text-align: center"] {
          text-align: center !important;
        }
        .custom-desc table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: #fff;
          border-radius: 1.2rem;
          overflow: hidden;
          box-shadow: 0 4px 24px 0 rgba(60, 120, 60, 0.10);
          margin-bottom: 2.5rem;
          margin-top: 1.5rem;
        }
        .custom-desc thead {
          background: linear-gradient(90deg, #bbf7d0 0%, #f7fee7 100%);
        }
        .custom-desc th, .custom-desc td {
          padding: 1.2rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          text-align: left !important;
        }
        .custom-desc th {
          text-align: center !important;
          font-weight: 800;
          color: #166534 !important;
          letter-spacing: 0.03em;
          background: linear-gradient(90deg, #bbf7d0 0%, #f7fee7 100%);
          position: sticky;
          top: 0;
          z-index: 1;
        }
        .custom-desc tr:last-child td {
          border-bottom: none;
        }
        .custom-desc tbody tr:nth-child(even) {
          background: #f6fef9;
        }
        .custom-desc tbody tr:hover {
          background: #e0fce2;
          transition: background 0.2s;
        }
        `}
      </style>
    </div>
  );
};

export default SubSubItemContent;
