import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ManagePatients from './pages/ManagePatients';
import AccountSettings from './pages/AccountSettings';
import MedicalReports from './pages/MedicalReports';
import './App.css';

function MainLayout({ children }) {
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content container-fluid">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patients" element={<ManagePatients />} />
        <Route path="/account-settings" element={<AccountSettings />} />
        <Route path="/reports" element={<MedicalReports />} />
      </Routes>
    </Router>
  );
}

export default App;