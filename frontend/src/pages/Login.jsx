import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, LogIn, AlertCircle, HelpCircle, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';

// Firebase imports (Original Logic Retained)
import { auth, db } from '../firebase'; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // STATE BARU UNTUK MATA
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "voting", user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userCompany = userData.company || userData.department || "N/A";
        
        // localStorage untuk token telah dibuang
        localStorage.setItem('userCompany', userCompany);
        localStorage.setItem('userName', userData.fullName);
        
        navigate('/dashboard'); 
      } else {
        setError("Profile not found in the voting registry. Please contact the system administrator.");
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password credentials.');
      } else {
        setError('Authentication error: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC] p-6 font-sans text-slate-900">
      {/* Background Subtle Gradient */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-transparent to-transparent"></div>

      <div className="w-full max-w-[440px] z-10">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          
          {/* Header Section */}
          <div className="px-8 pt-10 pb-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 rounded-2xl mb-6 shadow-lg shadow-slate-200">
              <ShieldCheck className="text-white" size={28} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Voter Authentication</h1>
            <p className="text-slate-500 text-sm mt-2">
              Please enter your credentials to access the secure voting terminal.
            </p>
          </div>

          <div className="px-8 pb-10">
            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-widest mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
                  <input 
                    type="email" 
                    placeholder="e.g. user@organization.com" 
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-400 focus:outline-none transition-all placeholder:text-slate-300"
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-widest">
                    Password
                  </label>
                  <button 
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Reset Password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••••••" 
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-400 focus:outline-none transition-all placeholder:text-slate-300"
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
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold text-md shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Verifying Identity...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Dashboard</span>
                    <LogIn size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                New to the platform? 
                <button 
                  onClick={() => navigate('/')} 
                  className="ml-1.5 text-slate-900 font-bold hover:underline"
                >
                  Register an account
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Technical Support */}
        <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 transition-colors cursor-default">
          <HelpCircle size={14} />
          <span className="text-xs font-medium uppercase tracking-tighter">Please raise hand if you need any support.</span>
        </div>
      </div>
    </div>
  );
};

export default Login;