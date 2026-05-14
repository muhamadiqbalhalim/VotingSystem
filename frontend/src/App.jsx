import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import VerifyToken from './pages/VerifyToken';
import Ballot from './pages/Ballot';
import Dashboard from './pages/Dashboard';
import Results from './pages/Results';

function App() {
  return (
    <Router>
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
        
        {/* Halaman Keputusan Live (Berdasarkan Gambar Replit) */}
        <Route path="/results" element={<Results />} />
      </Routes>
    </Router>
  );
}

export default App;