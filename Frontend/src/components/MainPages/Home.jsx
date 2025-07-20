import { useState } from "react";
import MySlider from "../otherComponents/Slider";
import Cards from "../otherComponents/Cards";
import TickerSlider from "../otherComponents/TickerSlider";
import AboutCastor from "../otherComponents/AboutCastor";
import EventPopupModal from "../otherComponents/EventModal";
import { useEffect } from "react";
import { getFlashEvents, getFlashNews } from "../services/api";
// import gch2 from "../images/gch2.jpeg";
// import ProductsSlider from "../otherComponents/ProductsSlider";

const Home = () => {
  const [imageUrl, setImageUrl] = useState();
  const [flashNews, setFlashNews] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const response = await getFlashEvents();

      if (response && response.length > 0) {
        setImageUrl(response[response.length - 1].imageUrl);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchFlashNewsCreate = async () => {
      const response = await getFlashNews();
      // response may be { data: [...] } or just [...], handle both
      const newsArr = response?.data || response;
      if (newsArr && Array.isArray(newsArr) && newsArr.length > 0) {
        setFlashNews(newsArr[0].news);
      } else {
        setFlashNews("");
      }
    };
    fetchFlashNewsCreate();
  }, []);

  const [showPopup, setShowPopup] = useState(true);
  return (
    <div className="home-container">
      <MySlider />
      <TickerSlider
        text={flashNews || "No flash news available at the moment."}
      />

      <AboutCastor />
      {/* <ProductsSlider /> */}
      <Cards />
      {showPopup && (
        <EventPopupModal
          imageUrl={imageUrl}
          onClose={() => {
            setShowPopup(false);
          }}
        />
      )}
    </div>
  );
};

export default Home;
