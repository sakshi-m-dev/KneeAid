import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppContextProvider, useAppContext } from './context/AppContext';
import { LiveDataProvider } from './context/LiveDataContext';
import AppLayout from './components/AppLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import LiveMonitor from './pages/LiveMonitor';
import GaitAnalytics from './pages/GaitAnalytics';
import RehabCoach from './pages/RehabCoach';
import SettingsProfile from './pages/SettingsProfile';
import EmergencySafety from './pages/EmergencySafety';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAppContext();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AppContextProvider>
      <LiveDataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<LiveMonitor />} />
            <Route path="analytics" element={<GaitAnalytics />} />
            <Route path="rehab" element={<RehabCoach />} />
            <Route path="settings" element={<SettingsProfile />} />
            <Route path="emergency" element={<EmergencySafety />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      </LiveDataProvider>
    </AppContextProvider>
  );
}

export default App;
