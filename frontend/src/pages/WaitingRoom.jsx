import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Lock, Users, Trophy } from 'lucide-react';

// PEMBETULAN 1: Menggunakan import database lokal dan Firebase SDK NPM standard
import { db } from '../firebase';
import { collection, onSnapshot } from "firebase/firestore";

const WaitingRoom = () => {
  const [totalVoters, setTotalVoters] = useState(0);
  const [votedCount, setVotedCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Dengar perubahan live dari database secara selamat
    const unsubscribe = onSnapshot(collection(db, "voting"), (snapshot) => {
      let total = 0;
      let voted = 0;
      
      // PEMBETULAN 2: Gunakan parameter 'd' bagi mengelakkan clashing skop global
      snapshot.forEach((d) => {
        total += 1;
        if (d.data().hasVoted) voted += 1;
      });

      setTotalVoters(total);
      setVotedCount(voted);

      // JIKA SEMUA ORANG DAH UNDI, AUTOMATIK PERGI KE RESULT PAGE
      if (total > 0 && voted === total) {
        const timer = setTimeout(() => {
          navigate('/winner'); 
        }, 3000); 
        return () => clearTimeout(timer);
      }
    }, (error) => {
      console.error("WaitingRoom Listener Error:", error);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Kira percentage untuk progress bar
  const progressPercent = totalVoters === 0 ? 0 : Math.round((votedCount / totalVoters) * 100);

  return (
    <div className="min-h-screen bg-[#f8f9fd] p-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-md text-center">
        
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-100 border border-white relative overflow-hidden">
          
          <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
            <Lock size={48} />
          </div>

          <h1 className="text-3xl font-black text-slate-800 mb-2">Vote Locked</h1>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Your vote has been securely saved. Results will be revealed once everyone has completed voting.
          </p>

          {/* Progress Bar Area */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Users size={14}/> Polling Status
              </span>
              <span className="text-sm font-black text-blue-600">{progressPercent}%</span>
            </div>

            {/* Bar */}
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
              <Loader2 size={16} className="animate-spin" /> Waiting for others...
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;