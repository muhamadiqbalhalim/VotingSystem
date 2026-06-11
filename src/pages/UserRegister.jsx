import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Mail,
  Lock,
  User,
  Building2,
  Loader2,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Eye,
  EyeOff,
  Globe,
  Shield
} from 'lucide-react';

import { auth, db } from '../firebase/config';
import {
  createUserWithEmailAndPassword
} from 'firebase/auth';
import {
  doc,
  setDoc
} from 'firebase/firestore';

const UserRegister = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = userCredential.user;

      await setDoc(doc(db, 'voting', user.uid), {
        uid: user.uid,
        fullName,
        email,
        company,
        role: 'voter',
        hasVoted: false,
        votedCategories: [],
        createdAt: new Date().toISOString()
      });

      alert('Account registered successfully.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already registered.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 text-slate-900 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.06),transparent_25%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-screen-2xl flex-col md:flex-row">
        <aside className="w-full md:w-[43%] flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 bg-white/70 px-8 py-10 backdrop-blur-md">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-4 rounded-full border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
              <div className="grid h-12 w-12 place-items-center rounded-3xl bg-gradient-to-tr from-blue-600 to-blue-500 shadow-lg">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-blue-600 font-semibold">P2SA Election Portal</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-blue-600 border border-blue-200">
                <Globe size={14} />
                Official Registration
              </div>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight text-slate-900">Create Your Voter Account</h1>
              <p className="text-base text-slate-700 leading-relaxed">Register quickly and securely to participate in the AGM election with trusted ballot control.</p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white/60 p-6 shadow-sm">
              <p className="text-sm text-slate-700">Secure registration, encrypted identity management, and audit-ready voter profiles.</p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-slate-600">
            <p>Already registered? Sign in to the voting portal.</p>
            <p className="uppercase tracking-[0.24em] text-slate-500 font-semibold">Powered by P2SA</p>
          </div>
        </aside>

        <main className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-16">
          <div className="glass-panel w-full max-w-[520px] p-8 sm:p-10 rounded-[2rem]">
            <div className="mb-8">
              <h3 className="text-3xl font-black text-slate-900">User Registration</h3>
              <p className="text-sm text-slate-600 mt-2">Create your secure voter account and join the election process.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label htmlFor="register-fullname" className="block text-sm font-bold mb-2 text-slate-800">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    id="register-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                    className="w-full rounded-3xl border border-slate-300 bg-slate-50/60 px-12 py-4 text-slate-900 outline-none ring-1 ring-transparent transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-company" className="block text-sm font-bold mb-2 text-slate-800">Company / Organization</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    id="register-company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    placeholder="Enter company name"
                    className="w-full rounded-3xl border border-slate-300 bg-slate-50/60 px-12 py-4 text-slate-900 outline-none ring-1 ring-transparent transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-email" className="block text-sm font-bold mb-2 text-slate-800">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="w-full rounded-3xl border border-slate-300 bg-slate-50/60 px-12 py-4 text-slate-900 outline-none ring-1 ring-transparent transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-password" className="block text-sm font-bold mb-2 text-slate-800">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-3xl border border-slate-300 bg-slate-50/60 px-12 py-4 text-slate-900 outline-none ring-1 ring-transparent transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-3xl border border-red-300 bg-red-50/80 p-4 text-sm text-red-700">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-3xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-700">
                Already have an account?
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="ml-2 font-semibold text-blue-600 hover:text-blue-700"
                >
                  Login Here
                </button>
              </p>
            </div>

            <div className="mt-10 flex items-center justify-center gap-2 text-slate-500">
              <HelpCircle size={14} />
              <span className="text-[10px] uppercase font-black tracking-widest">Secure Registration Portal</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserRegister;
