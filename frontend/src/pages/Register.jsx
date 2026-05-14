import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowRight, User, Building2, Loader2 } from 'lucide-react';

// Import config yang kita buat tadi
import { auth, db } from '../firebase'; 
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState(''); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Register User ke Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Jana Token Undian Unik (VOTE-XXXX)
      const newToken = `VOTE-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // 3. Simpan data tambahan ke Firestore dalam koleksi "voting"
      await setDoc(doc(db, "voting", user.uid), {
        uid: user.uid,
        fullName: fullName,
        email: email,
        company: company, 
        voterToken: newToken,
        hasVoted: false,
        createdAt: new Date().toISOString()
      });

      alert("Pendaftaran Berjaya! Sila login untuk dapatkan token anda.");
      navigate('/login'); 
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Emel ini sudah didaftarkan.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password mestilah sekurang-kurangnya 6 aksara.');
      } else {
        setError('Gagal daftar: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8f9fd] p-4 font-sans">
      <div className="w-full max-w-md p-8 bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 text-blue-600 shadow-inner">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-800">Register Voter</h2>
          <p className="text-slate-500 text-sm mt-2 text-center">Create account to receive voting token</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Input Nama Penuh */}
          <div className="relative">
            <User className="absolute left-4 top-4 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Full Name"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-400 focus:outline-none transition-all"
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* Input Company */}
          <div className="relative">
            <Building2 className="absolute left-4 top-4 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Company Name"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-400 focus:outline-none transition-all"
              onChange={(e) => setCompany(e.target.value)}
              required
            />
          </div>

          {/* Input Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
            <input 
              type="email" 
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-400 focus:outline-none transition-all"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Input Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
            <input 
              type="password" 
              placeholder="Password"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-400 focus:outline-none transition-all"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-500 text-xs font-bold rounded-xl border border-red-100">
              {error}
            </div>
          )}
          
          <button 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Processing...
              </>
            ) : (
              <>
                Register Now <ArrowRight size={20} />
              </>
            )}
          </button>

          <p className="text-center text-sm text-slate-500 mt-4">
            Dah ada akaun? <span onClick={() => navigate('/login')} className="text-blue-600 font-bold cursor-pointer hover:underline">Login di sini</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;