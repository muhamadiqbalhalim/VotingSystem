import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, Award, Star, Loader2, ArrowLeft, Users, Crown, Lock } from 'lucide-react';

// Import config database dari firebase (Gunakan npm syntax)
import { db } from '../firebase';
import { collection, getDocs } from "firebase/firestore";

const Winner = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "voting_results"));
        
        const tally = {
          president: {},
          deputy: {},
          vice: {},
          secretary: {},
          treasurer: {},
          exco: {}
        };

        querySnapshot.forEach((doc) => {
          const userVotes = doc.data().votes;
          for (const category in userVotes) {
            const selectedCandidates = userVotes[category];
            // Pastikan selectedCandidates adalah array sebelum looping
            if (Array.isArray(selectedCandidates)) {
              selectedCandidates.forEach(candidateName => {
                if (tally[category]) {
                  tally[category][candidateName] = (tally[category][candidateName] || 0) + 1;
                }
              });
            }
          }
        });

        const winnersOnly = {};
        for (const category in tally) {
          const candidatesArray = Object.keys(tally[category]).map(name => ({
            name: name,
            votes: tally[category][name]
          }));

          // Susun dan ambil yang No. 1 sahaja
          candidatesArray.sort((a, b) => b.votes - a.votes);
          winnersOnly[category] = candidatesArray[0] || null;
        }

        setResults(winnersOnly);
      } catch (error) {
        console.error("Ralat mengira undian:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  // Komponen Kad Pemenang Tunggal (Hanya No. 1)
  const WinnerCard = ({ title, winner, icon: Icon, colorClass }) => {
    if (!winner) return null;

    return (
      <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 border border-white mb-8 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
        {/* Dekorasi Latar Belakang */}
        <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-10 blur-3xl ${colorClass.bg}`}></div>
        
        <div className="flex flex-col items-center text-center relative z-10">
          {/* Ikon Kemenangan */}
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-lg rotate-12 group-hover:rotate-0 transition-transform duration-500 ${colorClass.bg} ${colorClass.text}`}>
            <Icon size={40} />
          </div>
          
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">
            Official {title}
          </span>
          
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-4 px-4">
            {winner.name}
          </h2>

          <div className={`flex items-center gap-2 px-6 py-2 rounded-full font-black text-sm border-2 ${colorClass.border} ${colorClass.text} bg-white shadow-sm`}>
            <Crown size={16} />
            {winner.votes} <span className="opacity-70 font-bold ml-1 text-[10px] uppercase tracking-widest">Votes Received</span>
          </div>
        </div>

        {/* Badge No 1 */}
        <div className={`absolute top-6 left-6 w-10 h-10 rounded-full flex items-center justify-center font-black text-white shadow-md text-xl ${colorClass.mainBg}`}>
          1
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fd] flex flex-col items-center justify-center font-sans gap-6">
        <div className="relative">
          <Loader2 className="animate-spin text-blue-500" size={60} />
          <Trophy className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-200" size={24} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800">Finalizing Results...</h2>
          <p className="text-slate-400 font-medium mt-2">The people have spoken. Just a moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fd] p-6 flex flex-col items-center font-sans pb-24">
      <div className="max-w-xl w-full">
        
        {/* Header Section */}
        <header className="relative flex flex-col items-center mb-16 mt-10 text-center">
          <button 
            onClick={() => navigate('/dashboard')}
            className="absolute left-0 top-1 p-3 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-blue-600 transition-all active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="w-16 h-16 bg-yellow-400 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-yellow-200 animate-bounce">
            <Trophy size={32} />
          </div>
          
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter mb-3">
            The Winners
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
            Official Election Mandate 2026
          </p>
        </header>

        {/* Paparan Pemenang Tunggal Setiap Kategori */}
        <div className="space-y-2">
          {results?.president && (
            <WinnerCard 
              title="President" 
              winner={results.president} 
              icon={Trophy} 
              colorClass={{ mainBg: 'bg-yellow-500', border: 'border-yellow-100', bg: 'bg-yellow-50', text: 'text-yellow-600' }} 
            />
          )}
          
          {results?.deputy && (
            <WinnerCard 
              title="Deputy President" 
              winner={results.deputy} 
              icon={Medal} 
              colorClass={{ mainBg: 'bg-blue-500', border: 'border-blue-100', bg: 'bg-blue-50', text: 'text-blue-600' }} 
            />
          )}
          
          {results?.vice && (
            <WinnerCard 
              title="Vice President" 
              winner={results.vice} 
              icon={Award} 
              colorClass={{ mainBg: 'bg-purple-500', border: 'border-purple-100', bg: 'bg-purple-50', text: 'text-purple-600' }} 
            />
          )}
          
          {results?.secretary && (
            <WinnerCard 
              title="Secretary" 
              winner={results.secretary} 
              icon={Star} 
              colorClass={{ mainBg: 'bg-emerald-500', border: 'border-emerald-100', bg: 'bg-emerald-50', text: 'text-emerald-600' }} 
            />
          )}
          
          {results?.treasurer && (
            <WinnerCard 
              title="Treasurer" 
              winner={results.treasurer} 
              icon={Star} 
              colorClass={{ mainBg: 'bg-orange-500', border: 'border-orange-100', bg: 'bg-orange-100/50', text: 'text-orange-600' }} 
            />
          )}
          
          {results?.exco && (
            <WinnerCard 
              title="Chief Exco" 
              winner={results.exco} 
              icon={Users} 
              colorClass={{ mainBg: 'bg-indigo-500', border: 'border-indigo-100', bg: 'bg-indigo-50', text: 'text-indigo-600' }} 
            />
          )}
        </div>

        {/* Footer Integrity */}
        <div className="mt-12 p-8 bg-white/50 border border-slate-100 rounded-[2rem] text-center">
            <Lock className="mx-auto text-slate-300 mb-4" size={24} />
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              Authenticated & Verified by E-Voting Audit System
            </p>
        </div>

      </div>
    </div>
  );
};

export default Winner;