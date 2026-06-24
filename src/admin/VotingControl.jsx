import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { Lock, AlertTriangle, Settings } from 'lucide-react';
import { CATEGORIES, CATEGORY_LIST, LOCKED_CATEGORY } from '../lib/electionConfig'; // Pastikan import CATEGORIES
import { initializeWithDetection } from '../languageTranslator.js';

const VotingControl = () => {
  const [activeCategory, setActiveCategory] = useState(LOCKED_CATEGORY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeWithDetection();
    const unsubscribe = onSnapshot(doc(db, 'settings', 'election'), (snapshot) => {
      if (snapshot.exists()) {
        setActiveCategory(snapshot.data().activeCategory || LOCKED_CATEGORY);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSwitch = async (category) => {
    if (!window.confirm("Tukar status pengundian?")) return;
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'election'), {
        activeCategory: category,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      alert('Gagal mengemaskini status.');
    } finally {
      setLoading(false);
    }
  };

  const renderButtonList = (ids) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {ids.map((id) => {
        const cat = CATEGORY_LIST.find((c) => c.id === id);
        if (!cat) return null;
        return (
          <button
            key={cat.id}
            onClick={() => handleSwitch(cat.id)}
            disabled={loading}
            className={`p-4 rounded-2xl border-2 font-bold text-xs transition-all ${
              activeCategory === cat.id
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
            {cat.title}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-600 text-white rounded-2xl"><Settings size={20} /></div>
        <div>
          <h1 className="text-xl font-black text-slate-900" data-translate="navElectionControl">Kawalan Pilihan Raya</h1>
          <p className="text-xs text-slate-500">Urus fasa pengundian aktif.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl">
        <div className="bg-slate-900 text-white rounded-2xl p-6 mb-6">
          <p className="text-[10px] uppercase font-bold opacity-60">Status Semasa</p>
          <h2 className="text-xl font-black mt-1">
            {/* PERUBAHAN DI SINI: Guna CATEGORIES[activeCategory]?.title */}
            {activeCategory === LOCKED_CATEGORY 
              ? 'Pengundian Ditutup' 
              : `Sedang Aktif: ${CATEGORIES[activeCategory]?.title || activeCategory.toUpperCase()}`}
          </h2>
        </div>

        <button
          onClick={() => handleSwitch(LOCKED_CATEGORY)}
          disabled={loading || activeCategory === LOCKED_CATEGORY}
          className="w-full py-4 rounded-2xl font-bold text-xs bg-red-600 text-white hover:bg-red-700 transition-all flex items-center justify-center gap-2 mb-8"
        >
          <Lock size={16} /> Tutup Semua Pengundian
        </button>

        <div className="space-y-6">
          <div>
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Jawatan Utama</h3>
            {renderButtonList(CATEGORY_LIST.filter(c => !c.id.startsWith('exco')).map(c => c.id))}
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Jawatankuasa Kerja</h3>
            {renderButtonList(CATEGORY_LIST.filter(c => c.id.startsWith('exco')).map(c => c.id))}
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-amber-800">
        <AlertTriangle size={20} className="shrink-0" />
        <p className="text-[10px] font-medium leading-relaxed">Perubahan akan memberi kesan serta-merta kepada semua pengundi.</p>
      </div>
    </div>
  );
};

export default VotingControl;