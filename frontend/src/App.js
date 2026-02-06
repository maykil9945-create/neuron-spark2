import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

// Pages
import LandingPage from "@/pages/LandingPage";
import ProgramCreation from "@/pages/ProgramCreation";
import Dashboard from "@/pages/Dashboard";
import Rooms from "@/pages/Rooms";
import RoomPage from "@/pages/RoomPage";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Initialize userId on app load
const initializeUserId = () => {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("userId", userId);
  }
  return userId;
};

function App() {
  useEffect(() => {
    initializeUserId();
  }, []);

  return (
    <div className="App min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/program/create" element={<ProgramCreation />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
