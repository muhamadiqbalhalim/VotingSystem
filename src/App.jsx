import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import UserLogin from './pages/UserLogin';
import UserRegister from './pages/UserRegister';
import UserDashboard from './pages/UserDashboard';
import VotingPage from './pages/VotingPage';

import AdminDashboard from './admin/AdminDashboard';
import VotingControl from './admin/VotingControl';
import Candidates from './admin/Candidates';
import Results from './admin/Results';

function App() {
  return (
    <Router>
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
          element={<UserDashboard />}
        />

        {/* VOTING PAGE */}

        <Route
          path="/vote"
          element={<VotingPage />}
        />

        {/* ADMIN DASHBOARD */}

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        {/* ADMIN VOTING CONTROL */}

        <Route
          path="/admin/votingcontrol"
          element={<VotingControl />}
        />

        {/* ADMIN CANDIDATES */}

        <Route
          path="/admin/candidates"
          element={<Candidates />}
        />

        {/* ADMIN RESULTS */}

        <Route
          path="/admin/results"
          element={<Results />}
        />

        {/* UNKNOWN ROUTE */}

        <Route
          path="*"
          element={<Navigate to="/register" replace />}
        />

      </Routes>
    </Router>
  );
}

export default App;