import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login.jsx";
import Registration from "./components/Registration.jsx";
import RegisterPage from "./components/RegisterPage.jsx";
import DashboardPage from "./components/DashboardPage.jsx";
import UserPrintButton from './components/UserPrintButton.jsx';
import Dashboard from "./components/Dashboard";
import ActivityLog from "./components/ActivityLog";
import UserAccessPage from "./components/UserAccessPage.jsx";
import CountryPage from "./components/CountryPage.jsx";
import MasterActivityLog from './components/MasterActivityLog.jsx';
import StatePage from "./components/StatePage.jsx";
import CityPage from "./components/CityPage.jsx";
import LanguagePage from "./components/LanguagePage.jsx";
import SkillPage from "./components/SkillPage.jsx";
import "./App.css";

function App() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("isAuth") === "true";
    setIsAuth(auth);

    // 🔥 optional: storage change sync (multi-tab support)
    const handleStorage = () => {
      const updatedAuth = localStorage.getItem("isAuth") === "true";
      setIsAuth(updatedAuth);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuth");
    setIsAuth(false);
  };

  return (
    <Router>
      <Routes>
        {/* ✅ Default */}
        <Route 
          path="/" 
          element={<Navigate to={isAuth ? "/dashboard" : "/login"} />}

        />
        <Route path="/DashboardPage" element={<DashboardPage />} />

        {/* 🔥 Login */}
        <Route 
          path="/login" 
          element={
            isAuth 
              ? <Navigate to="/DashboardPage" /> 
              : <Login setIsAuth={setIsAuth} />
          } 
        />

        {/* 🔥 Register */}
        <Route 
          path="/register" 
          element={isAuth ? <Navigate to="/dashboard" /> : <Registration />} 
        />

        <Route 
          path="/register-page" 
          element={isAuth ? <Navigate to="/dashboard" /> : <RegisterPage />} 
        />

        {/* 🔥 Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            isAuth 
              ? <Dashboard onLogout={handleLogout} /> 
              : <Navigate to="/login" />
          } 
        />

        {/* 🔐 Activity Log (Protected Route) */}
        <Route 
          path="/activity-log" 
          element={isAuth ? <ActivityLog /> : <Navigate to="/login" />} 
        />

        {/* 🔥 IMPORTANT: Unknown route fix (Hamesha sabse niche hona chahiye) */}
        <Route 
          path="*" 
          element={<Navigate to={isAuth ? "/dashboard" : "/login"} />} 
        />

        <Route path="/UserAccessPage" element={<UserAccessPage />} />
        <Route path="/country" element={<CountryPage />} />
<Route path="/master-activity-log" element={<MasterActivityLog />} />
<Route path="/UserPrintButton" element={<UserPrintButton />} />
        <Route path="/state" element={<StatePage />} />
        <Route path="/City" element={<CityPage />} />
        <Route path="/language" element={<LanguagePage />} />
        <Route path="/skills" element={<SkillPage />} />

      </Routes>
    </Router>
  );
} 
export default App;