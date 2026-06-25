import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { TrendingUp, Loader2, Trophy, BarChart3 } from 'lucide-react';
import { CATEGORY_LIST } from '../lib/electionConfig';

const PublicResults = () => {
  const [tally, setTally] = useState({});
  const [loading, setLoading] = useState(true);

  const utamaIds = ['president', 'deputy', 'vice', 'secretary', 'assistant_secretary', 'treasurer', 'assistant_treasurer'];
  const excoIds = ['exco1', 'exco2', 'exco3'];

  useEffect(() => {
    const fetchData = async () => {
      const [votersSnap, candSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'candidates'))
      ]);
      const candMap = {};
      candSnap.forEach(d => candMap[d.id] = d.data().name);
      const voteCount = {};
      votersSnap.docs.filter(v => v.data().role !== 'admin').forEach(voter => {
        const votes = voter.data().votes || {};
        Object.entries(votes).forEach(([pos, cands]) => {
          if (!voteCount[pos]) voteCount[pos] = {};
          cands.forEach(cId => {
            const name = candMap[cId] || cId;
            voteCount[pos][name] = (voteCount[pos][name] || 0) + 1;
          });
        });
      });
      setTally(voteCount);
      setLoading(false);
    };
    fetchData();
  }, []);

  const renderSection = (ids, title) => (
    <div className="mb-12 animate-in fade-in zoom-in duration-700">
      <h2 className="text-xl font-black text-slate-400 uppercase tracking-[0.3em] mb-8 text-center">{title}</h2>
      <div className="grid lg:grid-cols-2 gap-6">
        {ids.map(id => {
          const category = CATEGORY_LIST.find(c => c.id === id);
          const votes = tally[id] || {};
          const sorted = Object.entries(votes).sort((a,b) => b[1] - a[1]);
          const total = Object.values(votes).reduce((a,b) => a+b, 0);

          return (
            <div key={id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all">
              <h3 className="font-black text-blue-900 mb-6 text-xl flex items-center gap-2">
                <BarChart3 className="text-blue-500" size={20}/> {category?.title}
              </h3>
              {sorted.length > 0 ? (
                <div className="space-y-5">
                  {sorted.map(([name, count], idx) => (
                    <div key={name} className="relative">
                      <div className="flex justify-between items-end mb-1 text-sm">
                        <span className={`font-bold ${idx === 0 ? 'text-blue-700' : 'text-slate-600'}`}>
                          {idx === 0 && <Trophy size={14} className="inline mr-1 text-yellow-500"/>} {name}
                        </span>
                        <span className="font-black text-slate-900">{count} <span className="text-slate-400 font-normal">undi</span></span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${idx === 0 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-slate-300'}`}
                          style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-slate-400 italic text-center py-4">Tiada undian direkodkan</p>}
            </div>
          );
        })}
      </div>
    </div>
  );

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={48}/></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-600 text-white font-bold mb-6 shadow-lg shadow-blue-500/30">
            <TrendingUp size={18}/> KEPUTUSAN RASMI
          </div>
          <h1 className="text-6xl font-black text-slate-900 mb-4 tracking-tight">Keputusan Pilihan Raya</h1>
          <p className="text-slate-500 text-lg font-medium">KSNSSB - Keputusan Telus, Sah, dan Berintegriti</p>
        </div>
        
        {renderSection(utamaIds, "Jawatan Utama")}
        {renderSection(excoIds, "Jawatankuasa Kerja")}

        <footer className="text-center text-slate-400 text-sm mt-20 border-t pt-8">
          (c) 2026 KSNSSB - Sistem Pengundian Berintegriti
        </footer>
      </div>
    </div>
  );
};

export default PublicResults;
