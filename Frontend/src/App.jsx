import { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import MainpageRoutes from "./components/MainPages/MainPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoaderUI from "./components/otherComponents/LoaderUi";
import { AccessibilityProvider } from "./Context/AccessibilityContext";
import AccessibilityPanel from "./components/otherComponents/AccessibilityPanel";
import { MSPProvider } from "./Context/MSPContext";

export const ENV = import.meta.env.VITE_ENV;

const getApiUrl = () => {
  if (ENV === "production") {
    return import.meta.env.VITE_API_URL;
  }
  return `http://${window.location.hostname}:${
    import.meta.env.VITE_API_PORT || 5000
  }/api`;
};

export const API_URL = getApiUrl();

const getFileApiUrl = () => {
  if (ENV === "production") {
    return import.meta.env.VITE_FILE_API_URL;
  }
  return `http://${window.location.hostname}:${
    import.meta.env.VITE_FILE_API_PORT || 3000
  }`;
};

export const FILE_API_URL = getFileApiUrl();

const App = () => {
  const [loading, setLoading] = useState(true);

  // Simulate loading for demo (replace with your real logic)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <MSPProvider>
      <AccessibilityProvider>
        <Router>
          <div className="app relative min-h-screen">
            {loading && (
              <div className="fixed inset-0 h-screen z-[999] flex items-center justify-center bg-[#6b69699f] backdrop-blur-sm">
                <LoaderUI />
              </div>
            )}
            {!loading && <MainpageRoutes />}
            <AccessibilityPanel />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
          </div>
        </Router>
      </AccessibilityProvider>
    </MSPProvider>
  );
};

export default App;
