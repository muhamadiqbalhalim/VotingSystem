import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { Award, TrendingUp, Loader2 } from 'lucide-react';
import { CATEGORY_LIST } from '../lib/electionConfig';

const PublicResults = () => {
  const [tally, setTally] = useState({});
  const [loading, setLoading] = useState(true);

  // Kumpulan ID Jawatan
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
    <div className="mb-10">
      <h2 className="text-2xl font-black mb-6 uppercase text-slate-800 border-b pb-2">{title}</h2>
      <div className="grid lg:grid-cols-2 gap-6">
        {ids.map(id => {
          const category = CATEGORY_LIST.find(c => c.id === id);
          const votes = tally[id] || {};
          const sorted = Object.entries(votes).sort((a,b) => b[1] - a[1]);
          const total = Object.values(votes).reduce((a,b) => a+b, 0);

          return (
            <div key={id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-blue-600 mb-4 text-lg">{category?.title}</h3>
              {sorted.length > 0 ? (
                <div className="space-y-3">
                  {sorted.map(([name, count], idx) => (
                    <div key={name} className={`flex justify-between items-center p-3 rounded-lg ${idx === 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-slate-50'}`}>
                      <span className={`font-bold ${idx === 0 ? 'text-yellow-700' : 'text-slate-700'}`}>
                        {idx === 0 && <Award size={16} className="inline mr-2"/>} {name}
                      </span>
                      <span className="font-black">{count} undi</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-slate-400 italic">Tiada undian</p>}
            </div>
          );
        })}
      </div>
    </div>
  );

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" size={40}/></div>;

  return (
    <div className="max-w-6xl mx-auto p-8 bg-slate-50 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-slate-900">Keputusan Rasmi Pilihan Raya</h1>
        <p className="text-slate-600 mt-2">KSNSSB - Keputusan Telus & Sah</p>
      </div>
      {renderSection(utamaIds, "Jawatan Utama")}
      {renderSection(excoIds, "Jawatankuasa Kerja")}
    </div>
  );
};

export default PublicResults;