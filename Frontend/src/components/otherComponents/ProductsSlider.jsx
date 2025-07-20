import React, { useRef, useState, useEffect } from "react";
import "../css/ProductsSlider.css";

const products = [
  { id: 1, name: "Product 1", image: "https://picsum.photos/seed/p1/200/160" },
  { id: 2, name: "Product 2", image: "https://picsum.photos/seed/p2/200/160" },
  { id: 3, name: "Product 3", image: "https://picsum.photos/seed/p3/200/160" },
  { id: 4, name: "Product 4", image: "https://picsum.photos/seed/p4/200/160" },
  { id: 5, name: "Product 5", image: "https://picsum.photos/seed/p5/200/160" },
  { id: 6, name: "Product 6", image: "https://picsum.photos/seed/p6/200/160" },
  { id: 7, name: "Product 7", image: "https://picsum.photos/seed/p7/200/160" },
  { id: 8, name: "Product 8", image: "https://picsum.photos/seed/p8/200/160" },
  {
    id: 91,
    name: "Product 91",
    image: "https://picsum.photos/seed/p91/200/160",
  },
  {
    id: 92,
    name: "Product 92",
    image: "https://picsum.photos/seed/p92/200/160",
  },
  {
    id: 93,
    name: "Product 93",
    image: "https://picsum.photos/seed/p93/200/160",
  },
  {
    id: 94,
    name: "Product 94",
    image: "https://picsum.photos/seed/p94/200/160",
  },
  {
    id: 95,
    name: "Product 95",
    image: "https://picsum.photos/seed/p95/200/160",
  },
  {
    id: 96,
    name: "Product 96",
    image: "https://picsum.photos/seed/p96/200/160",
  },
  {
    id: 97,
    name: "Product 97",
    image: "https://picsum.photos/seed/p97/200/160",
  },
  {
    id: 98,
    name: "Product 98",
    image: "https://picsum.photos/seed/p98/200/160",
  },
  {
    id: 99,
    name: "Product 99",
    image: "https://picsum.photos/seed/p99/200/160",
  },
  {
    id: 100,
    name: "Product 100",
    image: "https://picsum.photos/seed/p100/200/160",
  },
  { id: 9, name: "Product 9", image: "https://picsum.photos/seed/p9/200/160" },
  { id: 9, name: "Product 9", image: "https://picsum.photos/seed/p9/200/160" },

  {
    id: 10,
    name: "Product 10",
    image: "https://picsum.photos/seed/p10/200/160",
  },
];

const ProductSlider = () => {
  const containerRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateScrollState = () => {
    const el = containerRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft === 0);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1); // -1 for precision
  };

  const scroll = (direction) => {
    const el = containerRef.current;
    if (el) {
      // Use smaller scroll distance on small screens
      const scrollAmount =
        window.innerWidth < 768 ? el.clientWidth / 2 : el.clientWidth;

      const scrollTo =
        direction === "left"
          ? el.scrollLeft - scrollAmount
          : el.scrollLeft + scrollAmount;
      el.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    updateScrollState(); // Initial check
    el.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  return (
    <div className="slider-wrapper">
      <button
        className={`nav-button left ${atStart ? "disabled" : ""}`}
        onClick={() => scroll("left")}
        disabled={atStart}
      >
        &#8592;
      </button>

      <div className="slider-container" ref={containerRef}>
        <div className="slider-track">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <button
        className={`nav-button right ${atEnd ? "disabled" : ""}`}
        onClick={() => scroll("right")}
        disabled={atEnd}
      >
        &#8594;
      </button>
    </div>
  );
};
const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} className="product-image" />
      <h3 className="product-name">{product.name}</h3>
    </div>
  );
};

export default ProductSlider;
