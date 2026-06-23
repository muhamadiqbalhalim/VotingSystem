import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Mail,
  User,
  Building2,
  Loader2,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Globe,
  Shield,
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
        password,
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
    <div className="min-h-screen relative bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 text-slate-900 overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_25%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row">
        {/* Sidebar KSNSSB */}
<aside
  className="
    flex
    w-full
    lg:w-1/2
    flex-col
    justify-center
    px-6
    sm:px-8
    lg:px-12
    py-10
    lg:py-16
    bg-gradient-to-br
    from-white/80
    via-blue-50/50
    to-white/70
    backdrop-blur-xl
    lg:border-r
    border-slate-200
"
>
          <div className="space-y-10">
            <div className="inline-flex items-center gap-3 rounded-full border border-blue-200/50 bg-white/80 px-4 py-2.5 shadow-sm w-fit">
              <img
                src={logo}
                alt="KSNSSB Logo"
                className="h-8 w-auto object-contain"
              />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
                KSNSSB
              </span>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <p
                  data-translate="sidebarSubtitle"
                  className="text-xs uppercase tracking-[0.35em] text-blue-600 font-bold"
                >
                  Sistem Pengundian Kesatuan
                </p>
<h1
  data-translate="registerSidebarTitle"
  className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-slate-900"
>
  Pendaftaran Ahli KSNSSB
</h1>
              </div>
              <p
                data-translate="registerSidebarDesc"
                className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-md"
              >
                Daftar akaun anda dengan selamat untuk menyertai proses
                pengundian Kesatuan Sekerja Namicoh Suria Sdn Bhd yang telus dan
                berintegriti.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-blue-200/30 bg-white/40 w-full max-w-md">
              {" "}
              <p
                data-translate="securityTitle"
                className="font-bold text-slate-900 mb-1"
              >
                Keselamatan Bertaraf Profesional
              </p>
              <p
                data-translate="securityDesc"
                className="text-sm text-slate-700"
              >
                Sistem pengundian digital yang dijamin selamat bagi melindungi
                hak suara setiap ahli kesatuan.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm mt-10">
            <p data-translate="needAssistance" className="text-slate-700">
              Perlukan bantuan?{" "}
              <span className="font-semibold text-blue-600">
                Hubungi sekretariat kesatuan
              </span>
            </p>
            <p
              data-translate="poweredBy"
              className="uppercase tracking-[0.25em] text-slate-500 font-bold text-xs"
            >
              Dikuasakan oleh KSNSSB
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          {" "}
          <div
            className="
    w-full
    max-w-md
    p-6
    sm:p-8
    lg:p-10
    rounded-3xl
    border
    border-slate-200/50
    bg-white/60
    backdrop-blur-md
    shadow-2xl
  "
          >
            <div
              className="
    flex
    flex-wrap
    justify-center
    gap-1
    mb-8
    bg-slate-100
    p-1
    rounded-2xl
    border
    border-slate-200
  "
            >
              {["en", "ne", "bn", "ms"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className="
  flex-1
  min-w-[60px]
  px-3
  py-2
  rounded-xl
  text-xs
  font-black
  uppercase
  transition-all
  hover:bg-white
  hover:text-blue-600
  text-slate-500
"
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="mb-8">
              <h3
                data-translate="registerTitle"
                className="text-2xl sm:text-3xl font-black text-slate-900"
              >
                Pendaftaran Pengguna
              </h3>
              <p
                data-translate="registerSubtitle"
                className="text-sm text-slate-600 mt-2"
              >
                Daftar akaun pengundi selamat anda.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
              {" "}
              <div>
                <label
                  data-translate="fullNameLabel"
                  className="block text-sm font-bold mb-2 text-slate-800"
                >
                  Nama Penuh
                </label>
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    data-translate-placeholder="fullNamePlaceholder"
                    placeholder="Masukkan nama penuh anda"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="
  w-full
  rounded-2xl
  border
  border-slate-300
  bg-slate-50/80
  px-12
  py-3
  sm:py-4
  text-sm
  sm:text-base
"
                  />
                </div>
              </div>
              <div>
                <label
                  data-translate="companyLabel"
                  className="block text-sm font-bold mb-2 text-slate-800"
                >
                  Syarikat / Organisasi
                </label>
                <div className="relative">
                  <Building2
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    data-translate-placeholder="companyPlaceholder"
                    placeholder="Masukkan nama syarikat"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    className="
  w-full
  rounded-2xl
  border
  border-slate-300
  bg-slate-50/80
  px-12
  py-3
  sm:py-4
  text-sm
  sm:text-base
"
                  />
                </div>
              </div>
              <div>
                <label
                  data-translate="emailLabel"
                  className="block text-sm font-bold mb-2 text-slate-800"
                >
                  Alamat Emel
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="email"
                    data-translate-placeholder="emailPlaceholder"
                    placeholder="contoh@emel.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="
  w-full
  rounded-2xl
  border
  border-slate-300
  bg-slate-50/80
  px-12
  py-3
  sm:py-4
  text-sm
  sm:text-base
"
                  />
                </div>
              </div>
              <div>
                <label
                  data-translate="passwordLabel"
                  className="block text-sm font-bold mb-2 text-slate-800"
                >
                  Kata Laluan
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    data-translate-placeholder="passwordPlaceholder"
                    placeholder="Sekurang-kurangnya 6 aksara"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="
  w-full
  rounded-2xl
  border
  border-slate-300
  bg-slate-50/80
  px-12
  py-3
  sm:py-4
  text-sm
  sm:text-base
"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="p-4 rounded-2xl border border-red-300 bg-red-50/80 text-sm text-red-700">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 px-6 py-4 text-white font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <span>Daftar Sekarang</span>
                )}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t text-center text-sm">
              <span data-translate="alreadyHaveAccount">
                Sudah mempunyai akaun?
              </span>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="ml-2 font-bold text-blue-700 hover:underline"
                data-translate="loginHere"
              >
                Log Masuk
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserRegister;
