import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

const UserLogin = lazy(() => import('./pages/UserLogin'));
const UserRegister = lazy(() => import('./pages/UserRegister'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const VotingPage = lazy(() => import('./pages/VotingPage'));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));
const VotingControl = lazy(() => import('./admin/VotingControl'));
const Candidates = lazy(() => import('./admin/Candidates'));
const Results = lazy(() => import('./admin/Results'));
// 1. Tambah import ini (Pastikan path fail betul)
const PublicResults = lazy(() => import('./admin/PublicResults'));
const AppLoading = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-bold text-slate-500">
    Loading secure workspace...
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<AppLoading />}>
        <Routes>

        {/* OPEN APP -> REGISTER */}
        <Route path="/" element={<Navigate to="/register" replace />} />

        {/* PUBLIC RESULTS PAGE (Boleh diakses tanpa login) */}
        <Route path="/public-results" element={<PublicResults />} />

        {/* USER REGISTER */}
        <Route path="/register" element={<UserRegister />} />

        {/* USER LOGIN */}
        <Route path="/login" element={<UserLogin />} />

        {/* ... (Route lain kekal sama) ... */}
        
        <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/vote" element={<ProtectedRoute><VotingPage /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/votingcontrol" element={<AdminRoute><VotingControl /></AdminRoute>} />
        <Route path="/admin/candidates" element={<AdminRoute><Candidates /></AdminRoute>} />
        <Route path="/admin/results" element={<AdminRoute><Results /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/register" replace />} />

        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;