import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import VerifyToken from './pages/VerifyToken';
import Ballot from './pages/Ballot';
import Dashboard from './pages/Dashboard';
import Results from './pages/Results';
import WaitingRoom from './pages/WaitingRoom';
import Winner from './pages/Winner';

// Import Komponen Header & Admin
import Header from './components/Header';
import AdminCandidates from './pages/AdminCandidates'; 

function App() {
  return (
    <Router>
      {/* Header kekal di semua halaman */}
      <Header />
      
      <Routes>
        {/* Halaman Pendaftaran Utama */}
        <Route path="/" element={<Register />} />
        
        {/* Halaman Login & Pemulihan Password */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Halaman Pengguna (Dashboard & Verification) */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/verify" element={<VerifyToken />} />
        
        {/* Halaman Proses Undian */}
        <Route path="/ballot" element={<Ballot />} />
        
        {/* Halaman Keputusan Live & Menunggu */}
        <Route path="/results" element={<Results />} />
        
        {/* 🚨 PEMBETULAN IMPERATIF: Sokong kedua-dua path /waiting DAN /waiting-room */}
        <Route path="/waiting" element={<WaitingRoom />} />
        <Route path="/waiting-room" element={<WaitingRoom />} />
        
        <Route path="/winner" element={<Winner />} />

        {/* 🚨 PEMBETULAN ADMIN: Sokong kedua-dua kes tulisan URL admin */}
        <Route path="/admin-candidates" element={<AdminCandidates />} />
        <Route path="/admincandidates" element={<AdminCandidates />} />

        {/* Catch-all route: Jika URL merepek, hantar balik ke login supaya tak blank putih */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;