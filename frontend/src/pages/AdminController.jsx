import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { Power, Lock, Unlock, AlertTriangle } from 'lucide-react';

const AdminController = () => {
  const [activeCategory, setActiveCategory] = useState('locked');
  const [loading, setLoading] = useState(false);

  // Senarai posisi yang dipertandingkan (mesti sama dengan Ballot.jsx)
  const categories = [
    { id: 'president', title: 'President' },
    { id: 'deputy', title: 'Deputy President' },
    { id: 'vice', title: 'Vice President' },
    { id: 'secretary', title: 'Hon. Secretary' },
    { id: 'treasurer', title: 'Hon. Treasurer' },
    { id: 'exco', title: 'Exco' }
  ];

  useEffect(() => {
    // Dengar status suis semasa dari database (Real-time)
    const unsub = onSnapshot(doc(db, "settings", "election"), (docSnap) => {
      if (docSnap.exists()) {
        setActiveCategory(docSnap.data().activeCategory || 'locked');
      }
    });
    
    return () => unsub();
  }, []);

  const handleSwitch = async (category) => {
    const actionText = category === 'locked' ? 'MENGUNCI SEMUA SKRIN PENGUNDI' : `MEMBUKA UNDIAN: ${category.toUpperCase()}`;
    
    if (window.confirm(`Pasti mahu ${actionText}?`)) {
      setLoading(true);
      try {
        // Tulis arahan ke database supaya semua skrin pengundi berubah serentak
        await setDoc(doc(db, "settings", "election"), {
          activeCategory: category
        });
      } catch (error) {
        console.error("Ralat menukar status:", error);
        alert("Gagal menukar status kawalan.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
        
        {/* Header Controller */}
        <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-6">
          <Power className="text-red-500" size={32} />
          <div>
            <h1 className="text-2xl font-black text-slate-800">Admin Controller</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Kawal skrin pengundi secara "Live"</p>
          </div>
        </div>

        {/* Status Semasa Skrin Pengundi */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl mb-8 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Status Skrin Pengundi Sekarang:</p>
            <h2 className="text-2xl font-black capitalize flex items-center gap-2">
              {activeCategory === 'locked' ? (
                <span className="text-red-400">Terkunci (Sila Tunggu)</span>
              ) : (
                <span className="text-green-400">Undian Dibuka: {activeCategory}</span>
              )}
            </h2>
          </div>
          {activeCategory === 'locked' ? <Lock size={36} className="text-red-400 opacity-50"/> : <Unlock size={36} className="text-green-400 opacity-50"/>}
        </div>

        {/* Suis Kawalan Utama */}
        <div className="space-y-4">
          <button 
            onClick={() => handleSwitch('locked')}
            disabled={loading}
            className={`w-full py-5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
              activeCategory === 'locked' 
              ? 'bg-red-100 text-red-600 border-2 border-red-500 shadow-md' 
              : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-2 border-transparent'
            }`}
          >
            <Lock size={20} /> Kunci Skrin Semua Pengundi (Rehat / Sesi Pencalonan)
          </button>

          {/* Suis Buka Kategori Undian */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-100">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSwitch(cat.id)}
                disabled={loading}
                className={`p-4 rounded-xl font-bold text-sm transition-all border-2 active:scale-95 ${
                  activeCategory === cat.id 
                  ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/50'
                }`}
              >
                Buka Undian: {cat.title}
              </button>
            ))}
          </div>
        </div>

        {/* Amaran Penggunaan */}
        <div className="mt-10 bg-yellow-50 p-5 rounded-2xl flex items-start gap-4 border border-yellow-100">
          <AlertTriangle className="text-yellow-600 shrink-0 mt-1" size={24} />
          <p className="text-xs text-yellow-700 leading-relaxed font-medium">
            <strong className="text-yellow-800 uppercase block mb-1">Amaran Sistem:</strong> 
            Menekan mana-mana butang di atas akan menukar skrin telefon <strong>SEMUA</strong> pengundi secara automatik dalam masa 1 saat. Pastikan pengacara majlis AGM telah memberi arahan yang jelas kepada *floor* sebelum menukar kategori undian.
          </p>
        </div>

      </div>
    </div>
  );
};

export default AdminController;