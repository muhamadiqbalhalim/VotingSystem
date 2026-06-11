import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  LogIn,
  AlertCircle,
  HelpCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

import logo from '../assets/image_be4763.png';
import { auth, db } from '../firebase/config';
import {
  signInWithEmailAndPassword
} from 'firebase/auth';
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
      const userDoc = await getDoc(doc(db, 'voting', user.uid));

      if (!userDoc.exists()) {
        setError('User profile not found. Please contact the administrator.');
        return;
      }

      const userData = userDoc.data();

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

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 text-slate-900 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.06),transparent_25%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row lg:gap-0">

        <aside className="w-full lg:w-[50%] flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200 bg-gradient-to-br from-white/80 via-blue-50/50 to-white/70 px-8 lg:px-12 py-12 lg:py-16 backdrop-blur-xl">
          <div className="space-y-12">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-3 rounded-full border border-blue-200/50 bg-white/80 px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow">
                <img src={logo} alt="P2SA Logo" className="h-10 w-auto object-contain" />
                <span className="text-xs font-black uppercase tracking-[0.4em] text-blue-700">P2SA</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.35em] text-blue-600 font-bold">Secure Election Platform</p>
                <h1 className="text-5xl lg:text-6xl font-black leading-tight text-slate-900">Premium Governance Voting</h1>
              </div>
              <p className="text-lg text-slate-700 leading-relaxed max-w-md">Access a high-trust digital ballot built for audit-ready voting, AGM governance, and member-driven elections with complete transparency.</p>
            </div>

            <div className="glass-panel rounded-2xl p-8 border border-blue-200/30">
              <div className="flex gap-3">
                <div className="w-1 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                <div>
                  <p className="font-bold text-slate-900 mb-1">Enterprise-Grade Security</p>
                  <p className="text-sm text-slate-700">Encrypted sessions, real-time ballot tracking, and complete audit trails for your peace of mind.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <p className="text-slate-700">Need assistance? <span className="font-semibold text-blue-600">Contact your administrator</span></p>
            <p className="uppercase tracking-[0.25em] text-slate-500 font-bold text-xs">Powered by P2SA Elections</p>
          </div>
        </aside>

        <main className="flex-1 flex items-center justify-center p-6 lg:p-16 xl:p-20">
          <div className="glass-panel w-full max-w-md p-10 lg:p-12 rounded-3xl border-slate-200/50">
            <div className="mb-10">
              <h3 className="text-4xl font-black text-slate-900">Login</h3>
              <p className="text-slate-700 mt-3 font-medium">Sign in to your secure voter account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="login-email" className="block text-sm font-bold mb-3 text-slate-800">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50/80 px-12 py-4 text-base text-slate-900 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-bold mb-3 text-slate-800">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50/80 px-12 py-4 text-base text-slate-900 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-300/50 bg-red-50/80 p-4 text-sm text-red-700">
                  <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:shadow-xl hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-200/50 text-center">
              <p className="text-sm text-slate-700">
                Don't have an account?
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="ml-1.5 font-bold text-blue-600 hover:text-blue-700 transition-colors underline-offset-2 hover:underline"
                >
                  Create one now
                </button>
              </p>
            </div>

            <div className="mt-10 flex items-center justify-center gap-2 text-slate-400">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-300"></div>
              <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Enterprise Security</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-300"></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserLogin;
