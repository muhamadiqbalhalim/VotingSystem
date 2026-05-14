import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
      {/* LETAK HEADER DI SINI - Di luar Routes supaya ia kekal di semua page */}
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
        <Route path="/waiting-room" element={<WaitingRoom />} />
        <Route path="/winner" element={<Winner />} />

        {/* Halaman Pengurusan Admin */}
        <Route path="/admin-candidates" element={<AdminCandidates />} />
      </Routes>
    </Router>
  );
}

export default App;