import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Lock, Users, Trophy } from 'lucide-react';
import { db } from '../firebase';

// KEMASKINI: Menggunakan import standard NPM (Elak ralat build Vercel)
import { collection, onSnapshot } from "firebase/firestore";

const WaitingRoom = () => {
  const [totalVoters, setTotalVoters] = useState(0);
  const [votedCount, setVotedCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Dengar perubahan live dari database
    const unsubscribe = onSnapshot(collection(db, "voting"), (snapshot) => {
      let total = 0;
      let voted = 0;
      
      snapshot.forEach((doc) => {
        total += 1;
        if (doc.data().hasVoted) voted += 1;
      });

      setTotalVoters(total);
      setVotedCount(voted);

      // JIKA SEMUA ORANG DAH UNDI, AUTOKOMATIK PERGI KE RESULT PAGE
      if (total > 0 && voted === total) {
        setTimeout(() => {
          navigate('/winner'); 
        }, 3000); 
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Kira percentage untuk progress bar
  const progressPercent = totalVoters === 0 ? 0 : Math.round((votedCount / totalVoters) * 100);

  return (
    <div className="min-h-screen bg-[#f8f9fd] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-100 text-center border border-white">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
          <Loader2 className="animate-spin" size={36} />
        </div>

        <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Waiting Room</h1>
        <p className="text-slate-400 text-sm mb-10">Sila tunggu sebentar sementara pengundi lain menyelesaikan undian mereka.</p>

        <div className="p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl text-left shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Users size={14}/> Polling Status
            </span>
            <span className="text-sm font-black text-blue-600">{progressPercent}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="text-lg font-black text-slate-800">
            {votedCount} <span className="text-slate-400 font-medium text-sm">/ {totalVoters} Voted</span>
          </div>
        </div>

        {progressPercent === 100 ? (
          <div className="mt-8 flex items-center justify-center gap-2 text-green-600 font-bold animate-bounce">
            <Trophy size={20} /> Tabulating Results...
          </div>
        ) : (
          <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 font-medium text-sm">
            <Lock size={14} /> Kept secure in real-time
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitingRoom;