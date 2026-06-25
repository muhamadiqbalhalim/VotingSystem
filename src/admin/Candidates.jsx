import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, doc, onSnapshot, query, orderBy, serverTimestamp, updateDoc } from 'firebase/firestore';
import { PlusCircle, Trash2, Users } from 'lucide-react';
import { CATEGORIES, CATEGORY_LIST } from '../lib/electionConfig';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('president');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'candidates'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCandidates(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await addDoc(collection(db, 'candidates'), {
        name: name.trim(),
        category,
        active: true,
        createdAt: serverTimestamp()
      });
      setName('');
    } catch (error) {
      console.error('Failed to add candidate:', error);
      alert('Gagal menambah calon.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Adakah anda pasti mahu memadam calon ini?')) return;
    try {
      await updateDoc(doc(db, 'candidates', id), { active: false, archivedAt: serverTimestamp() });
    } catch (error) {
      console.error('Failed to archive candidate:', error);
      alert('Gagal memadam calon.');
    }
  };

  const renderGroupedCandidates = (categoryIds) => {
    return categoryIds.map((catId) => {
      const catConfig = CATEGORIES[catId];
      const filtered = candidates.filter(c => c.active !== false && c.category === catId);
      
      return (
        <div key={catId} className="mb-6">
          <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
            {catConfig?.title}
          </h3>
          <div className="space-y-2">
            {filtered.length > 0 ? (
              filtered.map((c) => (
                <div key={c.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-blue-200 transition-all overflow-hidden">
                  <span className="font-bold text-sm text-slate-900 truncate mr-3">{c.name}</span>
                  <button onClick={() => handleDelete(c.id)} className="text-slate-400 hover:text-red-600 transition p-1 shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-slate-300 italic px-4">Tiada calon.</p>
            )}
          </div>
        </div>
      );
    });
  };

  const utamaIds = ['president', 'deputy', 'vice', 'secretary', 'assistant_secretary', 'treasurer', 'assistant_treasurer'];
  const excoIds = ['exco1', 'exco2', 'exco3'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-600 text-white rounded-2xl"><Users size={20} /></div>
        <div>
          <h1 className="text-xl font-black text-slate-900">Pengurusan Calon</h1>
          <p className="text-xs text-slate-500">Tambah dan uruskan senarai calon pilihan raya.</p>
        </div>
      </div>

      {/* BERIKUT ADALAH BAHAGIAN YANG TELAH DIKEMAS KINI */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-xl flex flex-col md:grid md:grid-cols-[1fr,auto,auto] gap-4 w-full"
      >
        <input 
          type="text" 
          placeholder="Nama Calon" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500" 
          required 
        />
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)} 
          className="w-full md:w-auto px-4 py-3 border border-slate-200 rounded-2xl text-sm outline-none cursor-pointer"
        >
          {CATEGORY_LIST.map((item) => (
            <option key={item.id} value={item.id}>{item.title}</option>
          ))}
        </select>
        <button 
          type="submit" 
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
        >
          <PlusCircle size={18} /> Tambah
        </button>
      </form>

      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <h2 className="font-black text-slate-900 mb-6 text-xs uppercase tracking-widest border-b pb-2">Jawatan Utama</h2>
          {loading ? <p className="text-xs text-slate-400">Sedang memuatkan...</p> : renderGroupedCandidates(utamaIds)}
        </section>
        <section>
          <h2 className="font-black text-slate-900 mb-6 text-xs uppercase tracking-widest border-b pb-2">Jawatankuasa Kerja</h2>
          {loading ? <p className="text-xs text-slate-400">Sedang memuatkan...</p> : renderGroupedCandidates(excoIds)}
        </section>
      </div>
    </div>
  );
};

export default Candidates;