import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Mail,
  User,
  Building2,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

import logo from "../assets/logo.png";
import { auth, db } from "../firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import {
  selectLanguage,
  initializeWithDetection,
} from "../languageTranslator.js";

const UserRegister = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        fullName,
        email,
        company,
        role: "voter",
        hasVoted: false,
        votedCategories: [],
        createdAt: new Date().toISOString(),
      });
      alert("Pendaftaran akaun berjaya.");
      navigate("/login");
    } catch (err) {
      if (err.code === "auth/email-already-in-use")
        setError("Emel ini telah berdaftar.");
      else if (err.code === "auth/weak-password")
        setError("Kata laluan mestilah sekurang-kurangnya 6 aksara.");
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-[120px]" />
      </div>

      {/* Sidebar - Hidden on tiny mobile, visible on desktop/tablet */}
      <aside className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 xl:p-20 relative z-10 border-r border-slate-200/60 bg-white/30 backdrop-blur-sm">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-10 w-auto" />
            <span className="font-black tracking-widest text-blue-800">KSNSSB</span>
          </div>
          <h1 className="text-5xl font-black leading-tight text-slate-900">
            Sistem Pengundian <br /> <span className="text-blue-600">Berintegriti</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-sm">
            Daftar akaun anda untuk menyertai proses pengundian yang telus dan selamat.
          </p>
          <div className="bg-white/50 p-6 rounded-2xl border border-slate-200">
            <p className="font-bold text-slate-900">Keselamatan Profesional</p>
            <p className="text-sm text-slate-600">Terjamin untuk hak suara anda.</p>
          </div>
        </div>
      </aside>

      {/* Main Form Section */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 shadow-xl">
          {/* Language Switcher */}
          <div className="flex justify-center gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl">
            {["en", "ne", "bn", "ms"].map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className="flex-1 py-2 text-xs font-bold uppercase rounded-xl hover:bg-white transition-all text-slate-600 hover:text-blue-600"
              >
                {lang}
              </button>
            ))}
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900">Pendaftaran</h2>
            <p className="text-sm text-slate-500 mt-1">Sila isi maklumat akaun anda.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {[
              { label: "Nama Penuh", icon: User, type: "text", value: fullName, setter: setFullName, placeholder: "Nama Penuh" },
              { label: "Syarikat", icon: Building2, type: "text", value: company, setter: setCompany, placeholder: "Nama Syarikat" },
              { label: "Alamat Emel", icon: Mail, type: "email", value: email, setter: setEmail, placeholder: "emel@contoh.com" },
            ].map((field, idx) => (
              <div key={idx}>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-500">
                  {field.label}
                </label>
                <div className="relative">
                  <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    placeholder={field.placeholder}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            ))}

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-500">Kata Laluan</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sekurang-kurangnya 6 aksara"
                  required
                  autoComplete="new-password"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Daftar Sekarang <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Sudah mempunyai akaun?{" "}
            <button onClick={() => navigate("/login")} className="text-blue-600 font-bold hover:underline">
              Log Masuk
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default UserRegister;
