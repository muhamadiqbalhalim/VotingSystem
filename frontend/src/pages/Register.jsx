import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, User, Building2, Loader2, ArrowRight, AlertCircle, HelpCircle, Eye, EyeOff } from 'lucide-react';

// Firebase imports (Original Logic Retained)
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
  const [showPassword, setShowPassword] = useState(false); // STATE BARU UNTUK MATA
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Register User via Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fungsi token (newToken) telah dibuang di sini

      // 2. Store data in Firestore "voting" collection
      await setDoc(doc(db, "voting", user.uid), {
        uid: user.uid,
        fullName: fullName,
        email: email,
        company: company, 
        // voterToken telah dibuang dari database
        hasVoted: false,
        createdAt: new Date().toISOString()
      });

      // Teks alert juga ditukar sebab token dah takde
      alert("Registration Successful. Please log in to access your voting account.");
      navigate('/login'); 
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already registered in our system.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password security is insufficient. Minimum 6 characters required.');
      } else {
        setError('Registration encountered an error: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC] p-6 font-sans text-slate-900">
      {/* Background Subtle Gradient */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-transparent to-transparent"></div>

      <div className="w-full max-w-[480px] z-10">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          
          {/* Header Section */}
          <div className="px-8 pt-10 pb-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 rounded-2xl mb-6 shadow-lg shadow-slate-200">
              <ShieldCheck className="text-white" size={28} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Voter Registration</h1>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed px-4">
              Please complete the profile information to initialize your secure voting account.
            </p>
          </div>

          <div className="px-8 pb-10">
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Full Name Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-widest mb-2 ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Enter your legal name" 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-400 focus:outline-none transition-all placeholder:text-slate-300"
                    onChange={(e) => setFullName(e.target.value)} 
                    required
                  />
                </div>
              </div>

              {/* Company Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-widest mb-2 ml-1">
                  Organization / Company
                </label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Enter organization name" 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-400 focus:outline-none transition-all placeholder:text-slate-300"
                    onChange={(e) => setCompany(e.target.value)} 
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-widest mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
                  <input 
                    type="email" 
                    placeholder="user@organization.com" 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-400 focus:outline-none transition-all placeholder:text-slate-300"
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-widest mb-2 ml-1">
                  Secure Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Minimum 6 characters" 
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-400 focus:outline-none transition-all placeholder:text-slate-300"
                    onChange={(e) => setPassword(e.target.value)} 
                    required
                  />
                  {/* BUTANG MATA DITAMBAH DI SINI */}
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button 
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold text-md shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Processing Enrollment...</span>
                  </>
                ) : (
                  <>
                    <span>Create Voter Account</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Already have an account? 
                <button 
                  onClick={() => navigate('/login')} 
                  className="ml-1.5 text-slate-900 font-bold hover:underline"
                >
                  Log in here
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Technical Support */}
        <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 transition-colors cursor-default">
          <HelpCircle size={14} />
          <span className="text-xs font-medium uppercase tracking-tighter">Registration Support: contact@system-admin.com</span>
        </div>
      </div>
    </div>
  );
};

export default Register;