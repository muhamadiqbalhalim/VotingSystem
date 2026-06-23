import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';

import { PlusCircle, Trash2 } from 'lucide-react';
import { CATEGORY_LIST } from '../lib/electionConfig';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('president');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'candidates'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
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
      console.error(error);
      alert('Gagal menambah calon.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Adakah anda pasti mahu memadam calon ini?')) return;
    try {
      await updateDoc(doc(db, 'candidates', id), { active: false, archivedAt: serverTimestamp() });
    } catch (error) {
      console.error(error);
      alert('Gagal memadam calon.');
    }
  };

  // Fungsi untuk menapis dan memaparkan senarai mengikut kategori
  const renderCandidateGroup = (ids) => {
    const filtered = candidates.filter(c => c.active !== false && ids.includes(c.category));
    if (filtered.length === 0) return <p className="text-sm text-slate-500 italic p-4">Tiada calon.</p>;
    
    return (
      <div className="space-y-3">
        {filtered.map((candidate) => (
          <div key={candidate.id} className="glass-panel-soft border-slate-200 rounded-2xl p-5 flex justify-between items-center bg-white">
            <div>
              <h3 className="font-bold text-lg text-slate-900">{candidate.name}</h3>
              <p className="text-sm text-blue-600 font-medium">
                {CATEGORY_LIST.find(c => c.id === candidate.category)?.title}
              </p>
            </div>
            <button onClick={() => handleDelete(candidate.id)} className="text-red-600 hover:bg-red-100 p-2 rounded-xl transition">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const utamaIds = ['president', 'deputy', 'vice', 'secretary', 'assistant_secretary', 'treasurer', 'assistant_treasurer'];
  const excoIds = ['exco1', 'exco2', 'exco3'];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 text-slate-900">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Pengurusan Calon</h1>
        <p className="text-slate-600 mt-1">Tambah dan uruskan calon pilihan raya.</p>
      </div>

      <div className="glass-panel-soft rounded-[2rem] border-slate-200 p-6 bg-white">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Nama Calon"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl bg-slate-50"
            required
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-xl bg-slate-50"
          >
            {CATEGORY_LIST.map((item) => (
              <option key={item.id} value={item.id}>{item.title}</option>
            ))}
          </select>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
            <PlusCircle size={18} /> Tambah Calon
          </button>
        </form>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="font-black text-slate-900 mb-4 uppercase tracking-wider">Jawatan Utama</h2>
          {loading ? <p className="text-slate-500">Sedang memuatkan...</p> : renderCandidateGroup(utamaIds)}
        </div>
        <div>
          <h2 className="font-black text-slate-900 mb-4 uppercase tracking-wider">Jawatankuasa Kerja</h2>
          {loading ? <p className="text-slate-500">Sedang memuatkan...</p> : renderCandidateGroup(excoIds)}
        </div>
      </div>
    </div>
  );
};

export default Candidates;