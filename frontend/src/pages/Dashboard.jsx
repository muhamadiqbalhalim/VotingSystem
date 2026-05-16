import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Building2, Loader2, Radio } from 'lucide-react';

import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
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
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    sessionStorage.clear();
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
        
        <header className="relative flex flex-col items-center mb-10 mt-4">
          <button 
            onClick={handleLogout}
            className="absolute left-0 top-1 p-2 bg-white rounded-full shadow-sm text-red-400 hover:text-red-600 transition-colors"
            title="Log Keluar"
          >
            <LogOut size={20} />
          </button>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Voter Portal</h1>
          <p className="text-slate-400 text-sm">Sesi AGM Live 2026</p>
        </header>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8 space-y-3">
          <div className="flex items-center gap-3 text-slate-600">
            <User size={18} className="text-blue-500"/>
            <span className="font-semibold text-sm">{userData?.fullName}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <Building2 size={18} className="text-blue-500"/>
            <span className="font-semibold text-sm">{userData?.company || "N/A"}</span>
          </div>
        </div>

        {/* Butang Gateway ke Terminal Live */}
        <button 
          onClick={() => navigate('/ballot')}
          className="w-full bg-blue-600 text-white p-8 rounded-[3rem] font-black shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 flex flex-col items-center justify-center gap-4 relative overflow-hidden group"
        >
          {/* Efek Radio/Live di latar belakang butang */}
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-150 transition-transform duration-700">
            <Radio size={100} />
          </div>
          
          <Radio size={40} className="animate-pulse" />
          <span className="text-xl">Masuk ke Terminal Live</span>
          <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest text-center">
            Sistem Undian Berfasa (Dikawal Admin)
          </span>
        </button>

      </div>
    </div>
  );
};

export default Dashboard;