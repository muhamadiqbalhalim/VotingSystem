import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, LogIn, Loader2, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.png';
import { auth, db } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { selectLanguage, initializeWithDetection } from '../languageTranslator.js';

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { initializeWithDetection(); }, []);

  const handleLanguageChange = (lang) => {
    selectLanguage(lang);
    window.location.reload(); 
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (!userDoc.exists()) {
        setError('Profil pengguna tidak dijumpai.');
        return;
      }
      if (userDoc.data().role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError('Emel atau kata laluan tidak sah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 text-slate-900 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_25%)]" />
      
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl">
        
        {/* Sidebar KSNSSB */}
        <aside className="flex w-[50%] flex-col justify-center px-12 py-16 bg-gradient-to-br from-white/80 via-blue-50/50 to-white/70 backdrop-blur-xl border-r border-slate-200">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-3 rounded-full border border-blue-200/50 bg-white/80 px-4 py-2.5 shadow-sm w-fit">
              <img src={logo} alt="KSNSSB Logo" className="h-8 w-auto" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">KSNSSB</span>
            </div>

            <div className="space-y-4">
              <p data-translate="sidebarSubtitle" className="text-xs uppercase tracking-[0.35em] text-blue-600 font-bold">Sistem Pengundian Kesatuan</p>
              <h1 data-translate="sidebarTitle" className="text-5xl font-black text-slate-900 leading-tight">Sistem E-Undi KSNSSB</h1>
              <p data-translate="sidebarDescription" className="text-lg text-slate-700 leading-relaxed">Portal rasmi pengundian Kesatuan Sekerja Namicoh Suria Sdn Bhd. Akses sistem pengundian digital yang telus, selamat, dan berintegriti untuk ahli kesatuan.</p>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-blue-200/30 bg-white/40">
              <p data-translate="securityTitle" className="font-bold text-slate-900 mb-1">Keselamatan Bertaraf Profesional</p>
              <p data-translate="securityDesc" className="text-sm text-slate-700">Sesi yang disulitkan dan jejak audit yang lengkap bagi memastikan kerahsiaan serta ketelusan setiap undian.</p>
            </div>

            <div className="text-sm">
              <p data-translate="needAssistance" className="text-slate-700">Perlukan bantuan? <span className="font-semibold text-blue-600">Hubungi sekretariat kesatuan</span></p>
              <p data-translate="poweredBy" className="uppercase tracking-[0.25em] text-slate-500 font-bold text-xs mt-1">Dikuasakan oleh KSNSSB</p>
            </div>
          </div>
        </aside>

        {/* Main Form */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md p-10 rounded-3xl border border-slate-200/50 bg-white/60 backdrop-blur-md shadow-2xl">
            <div className="flex justify-center gap-1 mb-8 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                {['en', 'ne', 'bn', 'ms'].map((lang) => (
                    <button key={lang} onClick={() => handleLanguageChange(lang)} className="flex-1 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all hover:bg-white hover:text-blue-600 text-slate-500">
                        {lang}
                    </button>
                ))}
            </div>

            <div className="mb-8">
              <h3 data-translate="loginTitle" className="text-4xl font-black text-slate-900">Log Masuk</h3>
              <p data-translate="loginSubtitle" className="text-slate-700 mt-2 font-medium">Sila log masuk ke akaun pengundi anda</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label data-translate="emailLabel" className="block text-sm font-bold mb-2 text-slate-800">Alamat Emel</label>
                <input type="email" data-translate-placeholder="emailPlaceholder" placeholder="contoh@emel.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-2xl border border-slate-300 bg-slate-50/80 px-6 py-4" />
              </div>
              <div>
                <label data-translate="passwordLabel" className="block text-sm font-bold mb-2 text-slate-800">Kata Laluan</label>
                <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} data-translate-placeholder="passwordPlaceholder" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-2xl border border-slate-300 bg-slate-50/80 px-6 py-4" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-slate-400">{showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
                </div>
              </div>

              {error && <div className="p-4 rounded-2xl border border-red-300 bg-red-50/80 text-sm text-red-700">{error}</div>}

              <button type="submit" disabled={loading} className="w-full rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 px-6 py-4 text-white font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
                <span data-translate="signIn">{loading ? '...' : 'Log Masuk'}</span>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t text-center text-sm">
              <span data-translate="noAccount">Tiada akaun?</span>
              <button onClick={() => navigate('/register')} className="ml-2 font-bold text-blue-700 hover:underline" data-translate="createAccount">Daftar sekarang</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
export default UserLogin;