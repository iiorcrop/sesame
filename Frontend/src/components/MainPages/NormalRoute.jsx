import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Redirect component for /resources
const ResourceListRedirect = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/resources/pops", { replace: true });
  }, [navigate]);
  return null;
};

import { Routes, Route } from "react-router-dom";
import Header from "./Header";
import Footer from "../MenuBars/Footer";
import TopBar from "../MenuBars/TopBar";
import Home from "./Home";
import SubItemPage from "../otherComponents/SubItemContent";
import MarketData from "./MarketData";
import ContactInfo from "../otherComponents/ContactInfo";
import WhatsAppButton from "../otherComponents/WhatsAppButton";
import SurveyFormMain from "./SurveyFormMain";
import Varieties from "../otherComponents/varieties/Varieties";
import Diseases from "../otherComponents/diseases/Diseases";
import Hybrids from "../otherComponents/hybrids/Hybrids";
import Pests from "../otherComponents/pests/Pests";
import MarketYearData from "../otherComponents/marketYear/MarketYearData";
import MarketVisualizations from "../otherComponents/marketVisualizations/MarketVisualizations";
import APYData from "../otherComponents/apyData/APYData";
import MSPData from "./MSPData";
import Staff from "./Staff";
import Events from "../otherComponents/events";
import News from "../otherComponents/news";
import NewsPreview from "../otherComponents/news/NewsPreview";
import Videos from "../otherComponents/media/Videos";
import PressList from "../otherComponents/media/PressList";
import ResourceList from "../otherComponents/resources/ResourceList";

import AnualReports from "../otherComponents/anualReports";
import Committees from "../otherComponents/committees";
import Awards from "../otherComponents/awards";
import Patents from "../otherComponents/patents";
import RecurringEvents from "../otherComponents/recurringEvents";
import RecurringEventPreview from "../otherComponents/recurringEvents/RecurringEventPreview";
import VideoPreview from "../otherComponents/media/VideoPreview";
import PressPreview from "../otherComponents/media/PressPreview";

const NormalRoute = () => {
  return (
    <div className="headerPart">
      {/* Skip to main content link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main className="content" id="main-content" tabIndex="-1">
        <TopBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/marketData" element={<MarketData />} />
          <Route path="/sub/:subId" element={<SubItemPage />} />
          <Route path="/surveyForm" element={<SurveyFormMain />} />
          <Route path="/marketYearData" element={<MarketYearData />} />
          <Route
            path="/marketVisualizations"
            element={<MarketVisualizations />}
          />
          <Route path="/apyData" element={<APYData />} />
          {/* <Route path="/sub/:subId" element={<SubItemPage />} /> */}
          <Route path="/varieties" element={<Varieties />} />
          <Route path="/varieties/:varietyId" element={<Varieties />} />
          <Route path="/diseases" element={<Diseases />} />
          <Route path="/diseases/:diseaseId" element={<Diseases />} />
          <Route path="/hybrids" element={<Hybrids />} />
          <Route path="/hybrids/:hybridId" element={<Hybrids />} />
          <Route path="/pests" element={<Pests />} />
          <Route path="/pests/:pestId" element={<Pests />} />
          <Route path="/msp" element={<MSPData />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/events/*" element={<Events />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:newsId" element={<NewsPreview />} />
          <Route path="/anual-reports" element={<AnualReports />} />
          <Route path="/committees" element={<Committees />} />
          <Route path="/committees/:id" element={<Committees />} />
          <Route path="/awards" element={<Awards />} />
          <Route path="/patents" element={<Patents />} />
          <Route path="/recurring-events" element={<RecurringEvents />} />
          <Route
            path="/recurring-events/:id"
            element={<RecurringEventPreview />}
          />
          <Route path="/videos" element={<Videos />} />
          <Route path="/press" element={<PressList />} />;
          <Route path="/media/videos/:id" element={<VideoPreview />} />
          <Route path="/media/press/:id" element={<PressPreview />} />
          <Route path="/resources" element={<ResourceList />} />
          <Route path="/resources/:type" element={<ResourceList />} />
        </Routes>
        <ContactInfo />
      </main>
      <WhatsAppButton />
      <Footer />
    </div>
  );
};

export default NormalRoute;
