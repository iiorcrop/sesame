import React, { useState } from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import { FaSeedling } from "react-icons/fa6";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Card = ({ title, images, label }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // const { speakText } = useAccessibility();

  const settings = {
    dots: true,
    infinite: images.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: images.length > 1,
    autoplaySpeed: 2200,
    afterChange: (index) => setCurrentImageIndex(index),
    arrows: false,
    appendDots: dots => (
      <div>
        <ul className="flex justify-center gap-2 mt-2">{dots}</ul>
      </div>
    ),
    customPaging: i => (
      <div className="w-2 h-2 rounded-full bg-green-400 opacity-60" />
    ),
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg border border-green-100 rounded-2xl shadow-xl p-4 flex flex-col items-center transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:bg-white/90 animate-fade-in-up">
      <h2 className="text-lg font-bold text-green-900 mb-2 text-center min-h-[30px]">{title || " "}</h2>
      <div className="w-full h-48 rounded-xl overflow-hidden mb-4 relative">
        <Slider {...settings}>
          {images.map((image, index) => (
            <div key={index} className="flex items-center justify-center h-48">
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-48 object-cover rounded-xl transition-transform duration-500"
              />
            </div>
          ))}
        </Slider>
       
      </div>
      <div className="w-full flex flex-col items-center my-2">
         <div className="absolute top-2 left-2 bg-green-100/80 text-green-700 px-3 py-1 rounded-full text-xs font-semibold shadow flex items-center gap-1 animate -bounce">
          <FaSeedling className="w-4 h-4 text-green-500" />
          {images[currentImageIndex]?.label || " "}
        </div>
        <Link to={`/${label || images[currentImageIndex]?.label || "read-more"}`} className="w-full flex justify-center">
          <button className="py-1 px-5 bg-gradient-to-r from-green-600 to-lime-400 text-white rounded-full font-semibold shadow hover:scale-105 transition-transform duration-200">
            Read more
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Card;