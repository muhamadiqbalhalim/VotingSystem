import { lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

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

        <Route
          path="/"
          element={<Navigate to="/register" replace />}
        />

        {/* USER REGISTER */}

        <Route
          path="/register"
          element={<UserRegister />}
        />

        {/* USER LOGIN */}

        <Route
          path="/login"
          element={<UserLogin />}
        />

        {/* USER DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* VOTING PAGE */}

        <Route
          path="/vote"
          element={
            <ProtectedRoute>
              <VotingPage />
            </ProtectedRoute>
          }
        />

        {/* ADMIN DASHBOARD */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* ADMIN VOTING CONTROL */}

        <Route
          path="/admin/votingcontrol"
          element={
            <AdminRoute>
              <VotingControl />
            </AdminRoute>
          }
        />

        {/* ADMIN CANDIDATES */}

        <Route
          path="/admin/candidates"
          element={
            <AdminRoute>
              <Candidates />
            </AdminRoute>
          }
        />

        {/* ADMIN RESULTS */}

        <Route
          path="/admin/results"
          element={
            <AdminRoute>
              <Results />
            </AdminRoute>
          }
        />

        {/* UNKNOWN ROUTE */}

        <Route
          path="*"
          element={<Navigate to="/register" replace />}
        />

        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
