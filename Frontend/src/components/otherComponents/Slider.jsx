import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import whatsappIcon from "../images/whatsapp.png";
import { fetchFiles } from "../services/api";

// Custom Arrow Components
const NextArrow = ({ onClick }) => (
  <div
    className="hidden md:flex items-center justify-center absolute right-5 top-1/2 transform -translate-y-1/2 z-20
      bg-white/80 text-green-700 text-3xl w-12 h-12 rounded-full shadow-lg border border-green-200
      cursor-pointer hover:bg-white hover:scale-110 transition-all duration-200"
    onClick={onClick}
  >
    ❯
  </div>
);

const PrevArrow = ({ onClick }) => (
  <div
    className="hidden md:flex items-center justify-center absolute left-5 top-1/2 transform -translate-y-1/2 z-20
      bg-white/80 text-green-700 text-3xl w-12 h-12 rounded-full shadow-lg border border-green-200
      cursor-pointer hover:bg-white hover:scale-110 transition-all duration-200"
    onClick={onClick}
  >
    ❮
  </div>
);

const MySlider = () => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const images = await fetchFiles();
        setFiles(images);
      } catch (err) {
        setError("Error fetching files.");
      }
    };
    fetchData();
  }, []);

  const settings = {
    dots: false,
    infinite: files.length > 1,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <div className="w-full h-[60vh] md:h-[80vh] relative overflow-hidden  shadow-2xl bg  animate-fade-in">
      {/* Top glass/gradient overlay */}
      <div className="" />

      {error && <p className="text-red-600">{error}</p>}
      <Slider {...settings}>
        {files.map((image) => (
          <div key={image._id} className="relative w-full h-[60vh] md:h-[80vh]">
            {/* Image with fade-in and scale animation */}
            <img
              src={image.url}
              alt={image.label}
              className="w-full h-full object-cover   transition-transform duration-700 scale-100 hover:scale-105 animate-fade-in"
              style={{ boxShadow: "0 8px 32px 0 rgba(34,197,94,0.10)" }}
            />

     

            {/* Overlay gradient for text or branding */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent   pointer-events-none" />

            {/* WhatsApp floating button (only for slider1) */}
            {image.url.toLowerCase().includes("slider1") && (
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-8 bottom-8 md:top-1/2 md:bottom-auto transform md:-translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white   shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200 z-30 border-2 border-green-200"
              >
                <img
                  src={whatsappIcon}
                  alt="WhatsApp"
                  className="w-7 h-7 object-contain"
                />
              </a>
            )}
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default MySlider;