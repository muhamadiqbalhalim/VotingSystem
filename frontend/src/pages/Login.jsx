import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, LogIn, AlertCircle, HelpCircle, Loader2 } from 'lucide-react';

// Import config & service dari firebase.js
import { auth, db } from './firebase'; 
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Login menggunakan Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Ambil data tambahan (Voter Token) dari Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // 3. Simpan token dalam localStorage untuk kegunaan Dashboard
        localStorage.setItem('voterToken', userData.voterToken);
        
        // 4. Bawa user ke Dashboard
        navigate('/dashboard'); 
      } else {
        setError("Data profil tidak dijumpai. Sila hubungi admin.");
      }
    } catch (err) {
      // Handle error login (Email/Password salah)
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Email atau Password salah!');
      } else {
        setError('Ralat semasa login: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8f9fd] p-4 font-sans">
      <div className="w-full max-w-md p-10 bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100 border border-white">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600">
            <LogIn size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-800">Login Pengundi</h2>
          <p className="text-slate-400 text-sm mt-2 text-center">
            Sila login untuk mendapatkan token undian unik anda.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-slate-300" size={20} />
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-400 focus:outline-none transition-all"
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-300" size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-400 focus:outline-none transition-all"
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <button 
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-xs font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <HelpCircle size={14} /> Lupa Password?
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 animate-shake">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Login Button */}
          <button 
            disabled={loading}
            className="w-full bg-[#638cf0] hover:bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Sila tunggu...
              </>
            ) : (
              'Masuk Dashboard'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm text-slate-400 mt-8">
          Belum daftar? <span onClick={() => navigate('/')} className="text-blue-600 font-bold cursor-pointer hover:underline">Daftar sekarang</span>
        </p>
      </div>
    </div>
  );
};

export default Login;