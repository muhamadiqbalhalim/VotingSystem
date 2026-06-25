import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, LogIn, Loader2, Eye, EyeOff } from "lucide-react";
import logo from "../assets/logo.png";
import { auth, db } from "../firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { selectLanguage, initializeWithDetection } from "../languageTranslator.js";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    initializeWithDetection();
  }, []);

  const handleLanguageChange = (lang) => {
    selectLanguage(lang);
    window.location.reload();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (!userDoc.exists()) {
        setError("Profil pengguna tidak dijumpai.");
        return;
      }
      if (userDoc.data().role === "admin") navigate("/admin");
      else navigate("/dashboard");
    } catch {
      setError("Emel atau kata laluan tidak sah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Sidebar / Topbar - Centered pada mobile & desktop */}
      <aside className="w-full lg:w-[380px] p-6 lg:p-12 bg-white border-b lg:border-b-0 lg:border-r border-slate-200/60 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-3 mb-4">
          <img src={logo} alt="Logo" className="h-8 w-auto" />
          <span className="font-black tracking-widest text-blue-800 text-lg">KSNSSB</span>
        </div>
        <h1 data-translate="sidebarTitle" className="text-2xl lg:text-4xl font-black leading-tight text-slate-900 mb-2 max-w-[300px]">
          Sistem E-Undi KSNSSB
        </h1>
        <p data-translate="sidebarDescription" className="text-xs lg:text-sm text-slate-500 max-w-[280px]">
          Portal rasmi pengundian Kesatuan Sekerja Namicoh Suria Sdn Bhd.
        </p>
      </aside>

      {/* Main Form Section */}
      <main className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-[360px] bg-white p-6 rounded-3xl border border-slate-100 shadow-xl">
          
          {/* Language Switcher */}
          <div className="flex justify-center gap-1 mb-6 bg-slate-50 p-1 rounded-xl">
            {["en", "ne", "bn", "ms"].map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className="flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg hover:bg-white transition-all text-slate-500 hover:text-blue-600"
              >
                {lang}
              </button>
            ))}
          </div>

          <div className="mb-6 text-center">
            <h2 data-translate="loginTitle" className="text-xl font-black text-slate-900">Log Masuk</h2>
            <p data-translate="loginSubtitle" className="text-xs text-slate-400 mt-0.5">Sila log masuk ke akaun pengundi anda</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-translate-placeholder="emailPlaceholder"
                placeholder="emel@contoh.com"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-translate-placeholder="passwordPlaceholder"
                placeholder="Kata Laluan"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {error && (
              <div className="p-2 text-xs text-red-600 bg-red-50 rounded-xl border border-red-100 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs shadow-md"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <><LogIn size={14} /><span data-translate="signIn">Log Masuk</span></>}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            <span data-translate="noAccount">Tiada akaun?</span>{" "}
            <button onClick={() => navigate("/register")} data-translate="createAccount" className="text-blue-600 font-bold hover:underline">
              Daftar sekarang
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default UserLogin;
