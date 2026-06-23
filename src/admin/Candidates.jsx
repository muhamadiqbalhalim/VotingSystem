import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, doc, onSnapshot, query, orderBy, serverTimestamp, updateDoc } from 'firebase/firestore';
import { PlusCircle, Trash2, Users } from 'lucide-react';
import { CATEGORY_LIST } from '../lib/electionConfig';

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
      alert('Gagal menambah calon.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Adakah anda pasti mahu memadam calon ini?')) return;
    try {
      await updateDoc(doc(db, 'candidates', id), { active: false, archivedAt: serverTimestamp() });
    } catch (error) {
      alert('Gagal memadam calon.');
    }
  };

  const renderCandidateGroup = (ids) => {
    const filtered = candidates.filter(c => c.active !== false && ids.includes(c.category));
    if (filtered.length === 0) return <p className="text-xs text-slate-400 italic px-4">Tiada calon di sini.</p>;
    
    return (
      <div className="grid gap-3">
        {filtered.map((c) => (
          <div key={c.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-blue-200 transition-all">
            <div>
              <h3 className="font-bold text-sm text-slate-900">{c.name}</h3>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                {CATEGORY_LIST.find(cat => cat.id === c.category)?.title}
              </p>
            </div>
            <button onClick={() => handleDelete(c.id)} className="text-slate-400 hover:text-red-600 transition p-2">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const utamaIds = ['president', 'deputy', 'vice', 'secretary', 'assistant_secretary', 'treasurer', 'assistant_treasurer'];
  const excoIds = ['exco1', 'exco2', 'exco3'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-600 text-white rounded-2xl">
          <Users size={20} />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900">Pengurusan Calon</h1>
          <p className="text-xs text-slate-500">Tambah dan uruskan senarai calon pilihan raya.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl grid md:grid-cols-[1fr,auto,auto] gap-4">
        <input
          type="text"
          placeholder="Nama Calon"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-3 border border-slate-200 rounded-2xl text-sm outline-none cursor-pointer"
        >
          {CATEGORY_LIST.map((item) => (
            <option key={item.id} value={item.id}>{item.title}</option>
          ))}
        </select>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all">
          <PlusCircle size={18} /> Tambah
        </button>
      </form>

      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <h2 className="font-black text-slate-900 mb-4 text-xs uppercase tracking-widest text-slate-400">Jawatan Utama</h2>
          {loading ? <p className="text-xs text-slate-400">Sedang memuatkan...</p> : renderCandidateGroup(utamaIds)}
        </section>
        <section>
          <h2 className="font-black text-slate-900 mb-4 text-xs uppercase tracking-widest text-slate-400">Jawatankuasa Kerja</h2>
          {loading ? <p className="text-xs text-slate-400">Sedang memuatkan...</p> : renderCandidateGroup(excoIds)}
        </section>
      </div>
    </div>
  );
};

export default Candidates;