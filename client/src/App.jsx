import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";

import SenderDashboard from "./pages/SenderDashboard";
import ReceiverDashboard from "./pages/ReceiverDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import TruckOwnerDashboard from "./pages/TruckOwnerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/sender-dashboard"
          element={
            <ProtectedRoute allowedRole="sender">
              <SenderDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/receiver-dashboard"
          element={
            <ProtectedRoute allowedRole="receiver">
              <ReceiverDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver-dashboard"
          element={
            <ProtectedRoute allowedRole="driver">
              <DriverDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/truck-owner-dashboard"
          element={
            <ProtectedRoute allowedRole="truck_owner">
              <TruckOwnerDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;