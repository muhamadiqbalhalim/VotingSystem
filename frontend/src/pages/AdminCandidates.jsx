import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, getDocs } from "firebase/firestore";
import { PlusCircle, Trash2, Users, Loader2, Database } from 'lucide-react';

const AdminCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('president');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "candidates"), orderBy("category", "asc"));
    
    // Ditambah blok error catcher untuk tahu jika Firestore block rules kau yang bermasalah
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach((d) => {
        data.push({ id: d.id, ...d.data() });
      });
      setCandidates(data);
    }, (error) => {
      console.error("Firebase Rules Error atau Connection Error:", error);
      alert("Firestore Error: " + error.message);
    });

    return () => unsubscribe();
  }, []);

  const initializeCollection = async () => {
    setLoading(true);
    try {
      const q = await getDocs(collection(db, "candidates"));
      if (q.empty) {
        await addDoc(collection(db, "candidates"), {
          name: "Test Candidate",
          category: "president",
          role: "Candidate President"
        });
        alert("Koleksi 'candidates' diinisialisasi!");
      } else {
        alert("Koleksi sudah mempunyai data.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
      await addDoc(collection(db, "candidates"), {
        name: name.trim(),
        category: category,
        role: `Candidate ${formattedCategory === 'Deputy' ? 'Deputy President' : formattedCategory}`
      });
      setName('');
    } catch (error) {
      console.error("Ralat menambah:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Pasti mahu padam?")) {
      try {
        await deleteDoc(doc(db, "candidates", id));
      } catch (err) {
        alert("Ralat memadam: " + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fd] p-6 font-sans">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-[2rem] shadow-2xl shadow-blue-100 border border-white">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users className="text-blue-600" size={32} />
            <h1 className="text-2xl font-black text-slate-800">Urus Calon (Admin)</h1>
          </div>
          <button 
            onClick={initializeCollection}
            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <Database size={20} />
          </button>
        </div>

        <form onSubmit={handleAddCandidate} className="space-y-4 mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-bold text-slate-600 bg-white"
            >
              <option value="president">President</option>
              <option value="deputy">Deputy President</option>
              <option value="vice">Vice President</option>
              <option value="secretary">Hon. Secretary</option>
              <option value="treasurer">Hon. Treasurer</option>
              <option value="exco">Exco</option>
            </select>

            <input 
              type="text" 
              placeholder="Nama Calon Baru..." 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium bg-white"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:bg-slate-300"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <PlusCircle size={20} />}
            Tambah Calon Live
          </button>
        </form>

        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Senarai Calon Live</h2>
            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-bold">
              {candidates.length} Calon
            </span>
          </div>

          {candidates.length > 0 ? (
            candidates.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-5 bg-white border-2 border-slate-50 rounded-2xl hover:border-blue-200 transition-all group shadow-sm">
                <div>
                  {/* Hanya nama calon dikekalkan di sini */}
                  <p className="font-black text-slate-800 text-lg">{c.name}</p>
                </div>
                <button 
                  onClick={() => handleDelete(c.id)} 
                  className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl bg-white">
               <p className="text-slate-400 font-medium text-sm">Tiada calon dijumpai. Sila masukkan nama calon di atas.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminCandidates;