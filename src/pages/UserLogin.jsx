import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
Lock,
Mail,
LogIn,
AlertCircle,
HelpCircle,
Loader2,
Eye,
EyeOff,
Globe
} from 'lucide-react';

import logo from '../assets/image_be4763.png';
import { auth, db } from '../firebase/config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore';

const UserLogin = () => {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);

const navigate = useNavigate();

const handleLogin = async (e) => {
e.preventDefault();
setError('');
setLoading(true);

try {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );

  const user = userCredential.user;

  const userDoc = await getDoc(
    doc(db, 'voting', user.uid)
  );

  if (!userDoc.exists()) {
    setError(
      'User profile not found. Please contact the administrator.'
    );
    return;
  }

  const userData = userDoc.data();

  localStorage.setItem(
    'userRole',
    userData.role || 'voter'
  );

  localStorage.setItem(
    'userName',
    userData.fullName || 'User'
  );

  localStorage.setItem(
  'userUid',
  user.uid
);

  localStorage.setItem(
    'userCompany',
    userData.company || 'N/A'
  );

  if (userData.role === 'admin') {
    navigate('/admin');
  } else {
    navigate('/dashboard');
  }
} catch (err) {
  console.log('LOGIN ERROR:', err);
  console.log('ERROR CODE:', err.code);
  console.log('ERROR MESSAGE:', err.message);

  if (
    err.code === 'auth/user-not-found' ||
    err.code === 'auth/wrong-password' ||
    err.code === 'auth/invalid-credential'
  ) {
    setError('Invalid email or password.');
  } else {
    setError('Login failed. Please try again.');
  }
} finally {
  setLoading(false);
}

};

const createTestUser = async () => {
  try {
    const result = await createUserWithEmailAndPassword(
      auth,
      "debug123@test.com",
      "123456"
    );

    console.log("CREATED USER:");
    console.log(result.user);
  } catch (err) {
    console.log("CREATE ERROR:");
    console.log(err.code);
    console.log(err.message);
  }
};

return ( <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-800">
  {/* Left Panel */}
  <div className="w-full md:w-[45%] border-b md:border-b-0 md:border-r border-slate-200 bg-gradient-to-br from-blue-50 to-slate-50 p-8 lg:p-12 flex flex-col justify-between">

    <div className="flex items-center gap-4">
      <img
        src={logo}
        alt="P2SA Logo"
        className="h-16 w-auto object-contain"
      />

      <div>
        <h1 className="font-black text-xl text-slate-900">
          P2SA Election Portal
        </h1>

        <p className="text-sm text-slate-500">
          Official Voting Platform
        </p>
      </div>
    </div>

    <div className="my-12 md:my-0 space-y-6 max-w-md">

      <div className="inline-flex items-center gap-2 px-3 py-1 border rounded-full text-xs font-bold tracking-wide bg-blue-50 border-blue-200 text-blue-700">
        <Globe size={12} />
        Official Voting Platform
      </div>

      <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
        Welcome to P2SA Election Portal
      </h2>

      <p className="text-base leading-relaxed text-slate-600 font-medium">
        Please sign in to cast your vote and participate in the election process.
      </p>
    </div>

    <div className="text-xs text-slate-400 font-bold">
      &copy; {new Date().getFullYear()} P2SA
    </div>
  </div>

  {/* Right Panel */}
  <div className="flex-1 flex items-center justify-center bg-white p-6 md:p-12 lg:p-16">

    <div className="w-full max-w-[420px]">

      <div className="mb-8">
        <h3 className="text-2xl font-black text-slate-900">
          Voter Login
        </h3>

        <p className="text-base mt-2 font-medium text-slate-500">
          Enter your login details below.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">

        <div>
          <label className="block text-sm font-bold mb-2 text-slate-700">
            Email Address
          </label>

          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />

            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl font-medium text-base bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 text-slate-700">
            Password
          </label>

          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />

            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-12 py-3.5 border border-slate-200 rounded-xl font-medium text-base bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-base shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Login</span>
              <LogIn size={18} />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">

        <p className="text-sm text-slate-500">

          Don't have an account?

          <button
            type="button"
            onClick={() => navigate('/register')}
            className="ml-2 font-bold text-blue-600 hover:text-blue-700"
          >
            Register Here
          </button>

        </p>

      </div>

      <div className="mt-10 flex items-center justify-center gap-2 text-slate-400">
        <HelpCircle size={14} />
        <span className="text-[10px] uppercase font-black tracking-widest">
          Secure Voting Session
        </span>
      </div>

    </div>
  </div>
</div>
);
};

export default UserLogin;
