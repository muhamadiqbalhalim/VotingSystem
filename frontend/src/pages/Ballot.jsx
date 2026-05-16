import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Lock, CheckSquare, Square, Loader2 } from 'lucide-react';

import { db, auth } from '../firebase';
import { doc, updateDoc, collection, onSnapshot, getDoc } from "firebase/firestore";

const Ballot = () => {
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState(null); 
  const [votedCategories, setVotedCategories] = useState([]); 
  
  const [liveCandidates, setLiveCandidates] = useState({
    president: [], deputy: [], vice: [], secretary: [], treasurer: [], exco: []
  });
  
  const navigate = useNavigate();

  const categoriesConfig = {
    president: { title: 'President', max: 1 },
    deputy: { title: 'Deputy President', max: 1 },
    vice: { title: 'Vice President', max: 1 },
    secretary: { title: 'Hon. Secretary', max: 1 },
    treasurer: { title: 'Hon. Treasurer', max: 1 },
    exco: { title: 'Exco', max: 10 }
  };

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    const userUid = auth.currentUser.uid;

    const unsubUser = onSnapshot(doc(db, "voting", userUid), (docSnap) => {
        if (docSnap.exists()) {
            const userData = docSnap.data();
            setVotedCategories(userData.votedCategories || []);
        }
    });

    const unsubSettings = onSnapshot(doc(db, "settings", "election"), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            setActiveCategory(data.activeCategory || 'locked');
        } else {
            setActiveCategory('locked');
        }
    });

    const unsubCandidates = onSnapshot(collection(db, "candidates"), (snapshot) => {
      const grouped = { president: [], deputy: [], vice: [], secretary: [], treasurer: [], exco: [] };
      snapshot.forEach(d => {
        const data = d.data();
        if (grouped[data.category]) {
          grouped[data.category].push({ id: d.id, ...data });
        }
      });
      setLiveCandidates(grouped);
    });

    return () => {
      unsubUser();
      unsubSettings();
      unsubCandidates();
    };
  }, [navigate]);

  const isLocked = activeCategory === 'locked' || !activeCategory;
  const currentCategoryConfig = categoriesConfig[activeCategory];
  const currentCandidates = liveCandidates[activeCategory] || [];
  const hasVotedForCurrent = votedCategories.includes(activeCategory);
  
  const totalCategories = Object.keys(categoriesConfig).length;
  const hasCompletedAll = votedCategories.length === totalCategories;

  useEffect(() => {
      setSelections([]);
      setError('');
  }, [activeCategory]);

  const toggleSelection = (candidateId) => {
    setError('');
    let updatedSelection = [...selections];

    if (updatedSelection.includes(candidateId)) {
      updatedSelection = updatedSelection.filter(id => id !== candidateId);
    } else {
      if (updatedSelection.length >= (currentCategoryConfig?.max || 1)) {
        setError(`Maksimum ${currentCategoryConfig.max} calon sahaja untuk kategori ini.`);
        return;
      }
      updatedSelection.push(candidateId);
    }

    setSelections(updatedSelection);
  };

  const handleSubmitVote = async () => {
    if (selections.length < 1) {
      setError('Sila pilih sekurang-kurangnya 1 calon terlebih dahulu.');
      return;
    }

    setLoading(true);
    
    try {
      const userUid = auth.currentUser.uid;
      const userRef = doc(db, "voting", userUid);

      const selectedCandidateNames = currentCandidates
        .filter(c => selections.includes(c.id))
        .map(c => c.name);

      const timestampMY = new Date().toLocaleString("en-US", { 
        timeZone: "Asia/Kuala_Lumpur",
        dateStyle: "medium",
        timeStyle: "medium"
      });

      const docSnap = await getDoc(userRef);
      const existingVotes = docSnap.exists() && docSnap.data().votes ? docSnap.data().votes : {};
      const existingVotedCats = docSnap.exists() && docSnap.data().votedCategories ? docSnap.data().votedCategories : [];

      await updateDoc(userRef, { 
        votes: {
            ...existingVotes,
            [activeCategory]: selectedCandidateNames
        },
        votedCategories: [...existingVotedCats, activeCategory],
        lastVotedAt: timestampMY
      });
      
      setSelections([]);
      
    } catch (err) {
      console.error("Ralat hantar undian:", err);
      setError('Gagal menghantar undi. Sila cuba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER 1: SKRIN TAMAT SEPENUHNYA ---
  if (hasCompletedAll) {
    return (
      <div className="min-h-screen bg-[#f8f9fd] p-4 flex flex-col items-center justify-center font-sans">
          <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl text-center border border-slate-100">
              <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} />
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-3">Tamat Sepenuhnya</h1>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Tahniah! Anda telah melengkapkan undian untuk ke-semua posisi jawatankuasa P2SA. Terima kasih atas kerjasama anda.
              </p>
              <button 
                onClick={async () => {
                  setLoading(true);
                  try {
                    const userUid = auth.currentUser.uid;
                    await updateDoc(doc(db, "voting", userUid), {
                      hasVoted: true
                    });
                    navigate('/dashboard');
                  } catch (err) {
                    console.error("Gagal update status akhir:", err);
                    navigate('/dashboard');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Selesai & Kembali ke Lobi"}
              </button>
          </div>
      </div>
    );
  }

  // --- RENDER 2: WAITING/LOCKED SCREEN ---
  if (isLocked) {
      return (
        <div className="min-h-screen bg-[#f8f9fd] p-4 flex flex-col items-center justify-center font-sans">
            <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-xl text-center border border-slate-100">
                <Lock className="w-16 h-16 text-blue-500 mx-auto mb-6 animate-pulse" />
                <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Sila Tunggu</h1>
                <p className="text-slate-500 text-sm leading-relaxed">Pencalonan sedang dijalankan atau undian telah ditutup sementara waktu. Skrin anda akan diaktifkan secara automatik oleh Pentadbir.</p>
            </div>
        </div>
      );
  }

  // --- RENDER 3: ALREADY VOTED SCREEN (UNTUK KATEGORI SEMASA) ---
  if (hasVotedForCurrent) {
    return (
        <div className="min-h-screen bg-[#f8f9fd] p-4 flex flex-col items-center justify-center font-sans">
            <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-xl text-center border border-slate-100">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Undian Direkodkan</h1>
                <p className="text-slate-500 text-sm leading-relaxed">Anda telah selesai mengundi untuk kategori <strong>{currentCategoryConfig?.title}</strong>. Sila tunggu kategori seterusnya dibuka.</p>
            </div>
        </div>
      );
  }

  // --- RENDER 4: BALLOT SCREEN (LIVE VOTING) ---
  return (
    <div className="min-h-screen bg-[#f8f9fd] p-4 flex flex-col items-center font-sans">
      <div className="max-w-md w-full">
        
        <header className="relative flex flex-col items-center mb-8 mt-2">
          <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-2 animate-pulse flex items-center gap-1">
             <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Live Voting
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight text-center">
            {currentCategoryConfig?.title}
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1 text-center leading-relaxed">
            Sila pilih 1 hingga {currentCategoryConfig?.max} calon
          </p>
          <p className="text-blue-500 text-xs font-bold mt-2 bg-blue-50 px-3 py-1 rounded-full">
            Dipilih: {selections.length} / {currentCategoryConfig?.max}
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 flex items-center gap-3 rounded-2xl animate-pulse">
            <AlertCircle size={18} />
            <span className="font-bold text-xs">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {currentCandidates.length > 0 ? (
            currentCandidates.map((c) => {
              const isSelected = selections.includes(c.id);
              return (
                <div 
                  key={c.id}
                  onClick={() => toggleSelection(c.id)}
                  className={`group relative p-6 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer flex items-start gap-4 active:scale-95 ${
                    isSelected 
                    ? 'border-blue-400 bg-blue-50/30 shadow-lg shadow-blue-100/50' 
                    : 'border-gray-100 bg-white hover:border-blue-200 shadow-sm'
                  }`}
                >
                  <div className="flex-1">
                    <h3 className={`font-black text-lg transition-colors ${isSelected ? 'text-blue-600' : 'text-slate-800'}`}>
                      {c.name}
                    </h3>
                  </div>
                  
                  <div className={`shrink-0 mt-1 transition-all ${isSelected ? 'text-blue-500' : 'text-slate-300'}`}>
                    {isSelected ? <CheckSquare size={24} /> : <Square size={24} />}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center p-12 bg-white border-2 border-dashed border-slate-200 rounded-[2rem] shadow-sm">
              <Loader2 className="animate-spin text-blue-400 mx-auto mb-3" size={24} />
              <p className="text-slate-500 font-medium text-sm">Menunggu data calon...</p>
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-col items-center pb-10">
          <button 
            onClick={handleSubmitVote}
            disabled={selections.length === 0 || loading || currentCandidates.length === 0}
            className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-xl ${
              selections.length > 0 && currentCandidates.length > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-200' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={22} /> Memproses...</>
            ) : (
              <><CheckCircle size={22} /> Hantar Undian {currentCategoryConfig?.title}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ballot;