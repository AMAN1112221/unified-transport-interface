import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";

import SenderDashboard from "./pages/SenderDashboard";
import ReceiverDashboard from "./pages/ReceiverDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import TruckOwnerDashboard from "./pages/TruckOwnerDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/sender-dashboard"
          element={<SenderDashboard />}
        />

        <Route
          path="/receiver-dashboard"
          element={<ReceiverDashboard />}
        />

        <Route
          path="/driver-dashboard"
          element={<DriverDashboard />}
        />

        <Route
          path="/truck-owner-dashboard"
          element={<TruckOwnerDashboard />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;