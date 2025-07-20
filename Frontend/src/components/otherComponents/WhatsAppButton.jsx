import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { fetchSocialMediaUrls } from "../services/api";

const WhatsAppButton = () => {
  const [showButton, setShowButton] = useState(false);
  const [whatsapp, setWhatsapp] = useState(null);

  const fetchWhatsapp = async () => {
    try {
      const response = (await fetchSocialMediaUrls()).filter(
        (item) => item.platform.toLowerCase() === "whatsapp"
      )[0]?.value;
      console.log("WhatsApp URL:", response);
      setWhatsapp(response);
    } catch (error) {
      console.error("Error fetching WhatsApp URL:", error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);

    fetchWhatsapp();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    window.open(`https://wa.me/${whatsapp}`, "_blank");
  };

  const announceWhatsApp = () => {
    // speakText("Contact us via WhatsApp");
  };

  return (
    <button
      onClick={handleClick}
      onFocus={announceWhatsApp}
      onMouseOver={announceWhatsApp}
      aria-label="Chat on WhatsApp"
      title="Contact us via WhatsApp"
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: "#25D366",
        color: "white",
        border: "none",
        borderRadius: "50%",
        width: "60px",
        height: "60px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        cursor: "pointer",
        opacity: showButton ? 1 : 0,
        transform: showButton ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        pointerEvents: showButton ? "auto" : "none",
      }}
    >
      <FaWhatsapp size={30} />
    </button>
  );
};

export default WhatsAppButton;
