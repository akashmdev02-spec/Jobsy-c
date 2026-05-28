import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import VerifySuccess from './pages/VerifySuccess';

import './App.css';

function NotFound() {
  return (
    <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
      <h2>Page Not Found (404)</h2>
      <p style={{ margin: '16px 0 24px', color: 'var(--color-text-secondary)' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <a href="/" className="btn btn-primary">Go to Homepage</a>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:id" element={<JobDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/verify-success" element={<VerifySuccess />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
