import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { Lock, AlertTriangle } from 'lucide-react';
import { CATEGORY_LIST, LOCKED_CATEGORY } from '../lib/electionConfig';

const VotingControl = () => {
  const [activeCategory, setActiveCategory] = useState(LOCKED_CATEGORY);
  const [loading, setLoading] = useState(false);

  const utamaIds = CATEGORY_LIST.filter((category) => !category.id.startsWith('exco')).map((category) => category.id);
  const excoIds = CATEGORY_LIST.filter((category) => category.id.startsWith('exco')).map((category) => category.id);

  const getCategoryLabel = (category) => {
    const item = CATEGORY_LIST.find((c) => c.id === category);
    return item ? item.title : category;
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'election'),
      (snapshot) => {
        if (snapshot.exists()) {
          setActiveCategory(snapshot.data().activeCategory || LOCKED_CATEGORY);
        }
      },
      (error) => {
        console.error("Ralat memuatkan tetapan:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSwitch = async (category) => {
    const confirmMessage = category === LOCKED_CATEGORY
      ? 'Tutup semua sesi pengundian?'
      : `Buka pengundian untuk ${getCategoryLabel(category).toUpperCase()}?`;

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    setLoading(true);
    try {
      await setDoc(
        doc(db, 'settings', 'election'),
        {
          activeCategory: category,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (error) {
      console.error(error);
      alert('Gagal mengemaskini status pengundian.');
    } finally {
      setLoading(false);
    }
  };

  const renderButtonList = (ids) => (
    <div className="grid md:grid-cols-2 gap-4">
      {ids.map((id) => {
        const category = CATEGORY_LIST.find((c) => c.id === id);
        if (!category) return null;
        return (
          <button
            key={category.id}
            onClick={() => handleSwitch(category.id)}
            disabled={loading}
            className={`p-4 rounded-xl border font-bold transition-all ${
              activeCategory === category.id
                ? 'bg-blue-100 border-blue-600 text-blue-700'
                : 'bg-white border-slate-300 hover:border-blue-400'
            }`}
          >
            Buka Pengundian: <br /> {category.title}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 text-slate-900">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Panel Kawalan Pemilihan</h1>
        <p className="text-slate-600 mt-1">Urus fasa pengundian aktif bagi kesatuan.</p>
      </div>

      <div className="glass-panel-soft rounded-[2rem] p-6 border-slate-200 bg-white">
        <div className="bg-blue-50 text-slate-900 rounded-[2rem] p-6 border border-blue-200">
          <p className="text-sm text-slate-600">Status Pengundian Semasa</p>
          <h2 className="text-2xl font-black mt-2 text-slate-900">
            {activeCategory === LOCKED_CATEGORY
              ? 'Pengundian Ditutup'
              : `Pengundian Dibuka: ${getCategoryLabel(activeCategory)}`}
          </h2>
        </div>

        <div className="mt-6">
          <button
            onClick={() => handleSwitch(LOCKED_CATEGORY)}
            disabled={loading || activeCategory === LOCKED_CATEGORY}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 ${
              activeCategory === LOCKED_CATEGORY
                ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            <Lock size={18} /> Tutup Semua Pengundian
          </button>
        </div>

        <div className="mt-8 space-y-8">
          <div>
            <h3 className="text-xl font-black text-slate-800 mb-4 uppercase tracking-wider border-b pb-2">Jawatan Utama</h3>
            {renderButtonList(utamaIds)}
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 mb-4 uppercase tracking-wider border-b pb-2">Jawatankuasa Kerja</h3>
            {renderButtonList(excoIds)}
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3">
        <AlertTriangle size={22} className="text-amber-700 shrink-0" />
        <div className="text-sm text-amber-800">
          Sebarang perubahan yang dibuat di sini akan memberi kesan serta-merta kepada semua pengundi yang sedang menggunakan sistem.
        </div>
      </div>
    </div>
  );
};

export default VotingControl;