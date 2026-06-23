import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, User, Building2, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import logo from "../assets/logo.png";
import { auth, db } from "../firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { selectLanguage, initializeWithDetection } from "../languageTranslator.js";

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
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
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
      if (err.code === "auth/email-already-in-use") setError("Emel ini telah berdaftar.");
      else if (err.code === "auth/weak-password") setError("Kata laluan mestilah sekurang-kurangnya 6 aksara.");
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <aside className="w-full lg:w-[380px] p-6 lg:p-12 bg-white border-b lg:border-b-0 lg:border-r border-slate-200/60 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-3 mb-4">
          <img src={logo} alt="Logo" className="h-8 w-auto" />
          <span className="font-black tracking-widest text-blue-800 text-lg">KSNSSB</span>
        </div>
        <h1 data-translate="sidebarTitle" className="text-2xl lg:text-4xl font-black leading-tight text-slate-900 mb-2 max-w-[300px]">
          Sistem Pengundian Berintegriti
        </h1>
        <p data-translate="sidebarDescription" className="text-xs lg:text-sm text-slate-500 max-w-[280px]">
          Daftar akaun anda untuk menyertai proses pengundian yang telus dan selamat.
        </p>
      </aside>

      <main className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-[360px] bg-white p-6 rounded-3xl border border-slate-100 shadow-xl">
          <div className="flex justify-center gap-1 mb-6 bg-slate-50 p-1 rounded-xl">
            {["en", "ne", "bn", "ms"].map((lang) => (
              <button key={lang} onClick={() => handleLanguageChange(lang)} className="flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg hover:bg-white transition-all text-slate-500 hover:text-blue-600">
                {lang}
              </button>
            ))}
          </div>

          <div className="mb-6 text-center">
            <h2 data-translate="registerTitle" className="text-xl font-black text-slate-900">Pendaftaran</h2>
            <p data-translate="registerSubtitle" className="text-xs text-slate-400 mt-0.5">Sila isi maklumat akaun anda.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-3">
            {[
              { icon: User, type: "text", value: fullName, setter: setFullName, ph: "fullNamePlaceholder" },
              { icon: Building2, type: "text", value: company, setter: setCompany, ph: "companyPlaceholder" },
              { icon: Mail, type: "email", value: email, setter: setEmail, ph: "emailPlaceholder" },
            ].map((field, idx) => (
              <div key={idx} className="relative">
                <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  data-translate-placeholder={field.ph}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            ))}

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-translate-placeholder="passwordPlaceholder"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {error && <div className="p-2 text-xs text-red-600 bg-red-50 rounded-xl border border-red-100 text-center">{error}</div>}

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs shadow-md">
              {loading ? <Loader2 className="animate-spin" size={16} /> : <span data-translate="signIn">Daftar Sekarang</span>}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            <span data-translate="alreadyHaveAccount">Sudah ada akaun?</span>{" "}
            <button onClick={() => navigate("/login")} data-translate="loginHere" className="text-blue-600 font-bold hover:underline">
              Log Masuk
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default UserRegister;