import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Pages (Pengundi)
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Ballot from './pages/Ballot';
import Dashboard from './pages/Dashboard';

// Import Komponen Header & Admin Dashboard Induk
import Header from './components/Header';
import AdminDashboard from './pages/AdminDashboard'; // 🟢 INI SAHAJA YANG PERLU UNTUK ADMIN

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
        <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Nota: Boleh buang baris ni kalau event hari yang sama */}
        
        {/* Halaman Pengguna (Dashboard) */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Halaman Proses Undian */}
        <Route path="/ballot" element={<Ballot />} />
        
        {/* 🟢 ROUTE BARU UNTUK ADMIN PUSAT (Gabungan Controller, Candidates, Report) */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Catch-all route: Jika URL merepek, hantar balik ke login supaya tak blank putih */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;