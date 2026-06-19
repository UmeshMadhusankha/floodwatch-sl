import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Prediction from "./pages/Prediction";
import Forecast from "./pages/Forecast";
import MapPage from "./pages/MapPage";
import Monitoring from "./pages/Monitoring";
import Profile from "./pages/Profile";

function AppContent() {
  const location = useLocation();
  const mainClassName = location.pathname === "/" ? "landing-shell" : "container";

  return (
    <>
      <Navbar />

      <main className={mainClassName}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/predict" element={<Prediction />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
