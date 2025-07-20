import React, { useEffect, useState } from "react";
import { fetchCastorInfo } from "../services/api";
import parse, { domToReact } from "html-react-parser";
import "../css/AboutStyles.css";

export default function AboutCastor() {
  const [castorInfo, setCastorInfo] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getCastorInfo = async () => {
      try {
        const data = await fetchCastorInfo();
        if (data && data.length > 0) {
          setCastorInfo({
            title: data[0].title,
            description: data[0].description,
          });
        } else {
          setError("No data available");
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    getCastorInfo();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading castor information...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="bg-red-50 p-6 rounded-lg border border-red-100 text-center max-w-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-red-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Unable to load content
          </h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );

  return (
    <section className="py-10 bg-gray-50">
      <div className="about-castor-container relative">
        <div className="about-header">
          <h1
            className="text-3xl font-bold mb-6 text-center text-green-800"
            dangerouslySetInnerHTML={{ __html: castorInfo.title }}
          />
          <div className="w-24 h-1 bg-green-600 mx-auto mb-10 rounded-full"></div>
        </div>
        <div className="about-content space-y-8 times-font  bg-white p-8 rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
          {transformDescription(castorInfo.description)}
        </div>
      </div>
    </section>
  );
}

// ✅ 100% Controlled Layout Renderer
function transformDescription(rawHtml) {
  const parsed = [];
  const tempWrapper = document.createElement("div");
  tempWrapper.innerHTML = rawHtml;

  const children = Array.from(tempWrapper.childNodes);
  let i = 0;

  while (i < children.length) {
    const node = children[i];

    if (
      node.nodeName === "FIGURE" &&
      node.classList?.contains("image-style-side") &&
      i + 1 < children.length &&
      children[i + 1].nodeName === "P"
    ) {
      const img = node.querySelector("img");
      const textNode = children[i + 1];

      // Always show image on left, text on right
      parsed.push(
        <div
          key={i}
          className="flex flex-col md:flex-row gap-8 items-center  rounded-lg overflow-hidden"
        >
          <div className="md:w-2/5 h-full relative image-left-offset">
            <img
              src={img.getAttribute("src")}
              alt="Castor information"
              className="w-full h-full object-cover rounded-lg shadow-[0_20px_50px_rgba(8,_112,_84,_0.2)]"
            />
            <div className="absolute inset-0 rounded-lg shadow-inner pointer-events-none"></div>
          </div>
          <div className="text-gray-800 flex-1 flex items-center p-6">
            <div className="prose prose-green max-w-none">
              {/* {parse(textNode.outerHTML)} */}
            </div>
          </div>
        </div>
      );
      i += 2;
    } else if (node.nodeName === "H2" || node.nodeName === "H3") {
      // Style headings consistently
      parsed.push(
        <div key={i} className="mt-10 mb-6">
          <h2 className="text-2xl font-semibold text-green-800 border-l-4 border-green-600 pl-4">
            {node.textContent}
          </h2>
        </div>
      );
      i++;
    } else if (node.nodeName === "P") {
      // Style paragraphs consistently
      parsed.push(
        <div
          key={i}
          className="text-gray-700 leading-relaxed mb-6"
          style={{ fontSize: "20px", fontFamily: "Times New Roman, Times, serif" }}
        >
          {parse(node.outerHTML)}
        </div>
      );
      i++;
    } else if (node.nodeName === "UL" || node.nodeName === "OL") {
      // Style lists consistently
      parsed.push(
        <div key={i} className="my-6 pl-6">
          {parse(node.outerHTML.replace(/<li>/g, '<li class="mb-2">'))}
        </div>
      );
      i++;
    } else {
      parsed.push(
        <div key={i} className="my-4">
          {parse(node.outerHTML)}
        </div>
      );
      i++;
    }
  }

  return parsed;
}
