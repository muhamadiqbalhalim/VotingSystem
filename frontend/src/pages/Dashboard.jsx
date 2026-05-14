import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Copy, CheckCircle2, LogOut, User, Building2, Loader2, Trophy } from 'lucide-react';

// Import auth & db dari konfigurasi lokal firebase kita
import { auth, db } from '../firebase';

// KEMASKINI: Menggunakan import standard NPM (Bukan lagi gstatic URL)
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check jika ada user yang login melalui Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Tarik data 'live' user ini dari database koleksi 'voting'
          const userRef = doc(db, "voting", user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            console.error("Data tidak dijumpai dalam database");
            handleLogout();
          }
        } catch (error) {
          console.error("Ralat mengambil data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        // Jika tiada user login, tendang balik ke page login
        navigate('/login');
      }
    });

    // Cleanup listener bila komponen unmount
    return () => unsubscribe();
  }, [navigate]);

  const handleCopy = () => {
    if (userData?.voterToken) {
      navigator.clipboard.writeText(userData.voterToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fd] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fd] p-6 flex flex-col items-center font-sans">
      <div className="w-full max-w-md">
        
        {/* Header with Logout Button */}
        <header className="relative flex flex-col items-center mb-10 mt-4">
          <button 
            onClick={handleLogout}
            className="absolute left-0 top-1 p-2 bg-white rounded-full shadow-sm text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Voter Dashboard</h1>
          <p className="text-slate-400 text-sm">Welcome back, {userData?.fullName?.split(' ')[0]}</p>
        </header>

        {/* User Info Card */}
        <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-100 border border-slate-100 mb-6 flex flex-col gap-3">
          <div className="flex items-center gap-3 text-slate-600">
            <User size={18} className="text-blue-500"/>
            <span className="font-semibold text-sm">{userData?.fullName}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <Building2 size={18} className="text-blue-500"/>
            <span className="font-semibold text-sm">{userData?.company || "N/A"}</span>
          </div>
        </div>

        {/* Token Section */}
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-100 border border-white text-center relative overflow-hidden">
          
          {/* Overlay jika sudah mengundi */}
          {userData?.hasVoted && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
              <CheckCircle2 size={60} className="text-green-500 mb-4" />
              <h3 className="text-xl font-black text-slate-800">Vote Submitted</h3>
              <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                Undian anda telah dikunci secara selamat dalam pangkalan data.
              </p>
            </div>
          )}

          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-12">
            <Ticket size={40} />
          </div>
          
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Voting Token</h2>
          
          <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 mb-6 group relative">
            <span className="text-3xl font-black text-slate-800 tracking-widest">
              {userData?.voterToken}
            </span>
          </div>

          <button 
            onClick={handleCopy}
            disabled={userData?.hasVoted}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
              copied ? 'bg-green-500 text-white shadow-green-100' : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700 active:scale-95'
            } shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {copied ? <><CheckCircle2 size={20} /> Copied!</> : <><Copy size={20} /> Copy Token</>}
          </button>
        </div>

        {/* Butang Utama */}
        {!userData?.hasVoted ? (
          <button 
            onClick={() => navigate('/verify')}
            className="w-full mt-8 bg-white text-slate-800 py-5 rounded-2xl font-black shadow-sm border border-slate-100 hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            Proceed to Verification <CheckCircle2 size={20} className="text-blue-500" />
          </button>
        ) : (
          <button 
            onClick={() => navigate('/winner')} 
            className="w-full mt-8 bg-slate-800 text-white py-5 rounded-2xl font-black shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3 group"
          >
            View Official Winners <Trophy size={20} className="text-yellow-400 group-hover:scale-125 transition-transform" />
          </button>
        )}

      </div>
    </div>
  );
};

export default Dashboard;