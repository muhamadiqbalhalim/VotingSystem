import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, ChevronLeft, Lock, CheckSquare, Square, Loader2 } from 'lucide-react';

// Import config database dari firebase lokal
import { db } from '../firebase';
import { doc, updateDoc, collection, addDoc, onSnapshot } from "firebase/firestore";

const Ballot = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({}); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State untuk Live Candidates
  const [liveCandidates, setLiveCandidates] = useState({
    president: [], deputy: [], vice: [], secretary: [], treasurer: [], exco: []
  });
  
  const navigate = useNavigate();

  // Konfigurasi Kategori
  const categories = [
    { id: 'president', title: 'President', max: 1 },
    { id: 'deputy', title: 'Deputy President', max: 1 },
    { id: 'vice', title: 'Vice President', max: 2 },
    { id: 'secretary', title: 'Secretary', max: 1 },
    { id: 'treasurer', title: 'Treasurer', max: 1 },
    { id: 'exco', title: 'Exco', max: 10 }
  ];

  useEffect(() => {
    // 1. SAFEGUARD SECURITY: Tendang pengundi jika tiada token aktif dalam sesi
    const activeToken = sessionStorage.getItem('activeVotingToken');
    const voterDocId = sessionStorage.getItem('voterDocId');
    if (!activeToken || !voterDocId) {
      navigate('/dashboard');
      return;
    }

    // 2. LIVE FETCH: Tarik nama calon dari database masa nyata
    const unsubCandidates = onSnapshot(collection(db, "candidates"), (snapshot) => {
      const grouped = { president: [], deputy: [], vice: [], secretary: [], treasurer: [], exco: [] };
      
      // KEMASKINI LOGIK: Tukar parameter 'doc' kepada 'd' untuk elak clashing skop pembolehubah
      snapshot.forEach(d => {
        const data = d.data();
        if (grouped[data.category]) {
          grouped[data.category].push({ id: d.id, ...data });
        }
      });
      setLiveCandidates(grouped);
    });

    return () => {
      unsubCandidates();
    };
  }, [navigate]);

  const currentCategory = categories[currentStep];
  const currentCandidates = liveCandidates[currentCategory.id] || [];
  const currentSelected = selections[currentCategory.id] || [];

  const toggleSelection = (candidateId) => {
    setError('');
    let updatedSelection = [...currentSelected];

    if (updatedSelection.includes(candidateId)) {
      updatedSelection = updatedSelection.filter(id => id !== candidateId);
    } else {
      if (updatedSelection.length >= currentCategory.max) {
        setError(`Maksimum ${currentCategory.max} calon sahaja untuk kategori ini.`);
        return;
      }
      updatedSelection.push(candidateId);
    }

    setSelections({
      ...selections,
      [currentCategory.id]: updatedSelection
    });
  };

  const handleNextOrSubmit = async () => {
    if (currentSelected.length < 1) {
      setError('Sila pilih sekurang-kurangnya 1 calon terlebih dahulu.');
      return;
    }

    if (currentStep < categories.length - 1) {
      setCurrentStep(currentStep + 1);
      setError('');
      window.scrollTo(0, 0); 
      return;
    }

    const activeToken = sessionStorage.getItem('activeVotingToken');
    const voterDocId = sessionStorage.getItem('voterDocId');

    if (!activeToken || !voterDocId) {
      setError('Sesi tamat. Sila verify token semula.');
      return;
    }

    setLoading(true);
    
    try {
      const finalVotes = {};
      categories.forEach(cat => {
        const cands = liveCandidates[cat.id] || [];
        finalVotes[cat.id] = cands
          .filter(c => selections[cat.id]?.includes(c.id))
          .map(c => c.name);
      });

      // Simpan rekod undian ke database
      await addDoc(collection(db, "voting_results"), {
        voterDocId: voterDocId,
        voterToken: activeToken,
        votes: finalVotes,
        timestamp: new Date().toISOString()
      });

      // Kemaskini status pengundi dalam pangkalan data
      await updateDoc(doc(db, "voting", voterDocId), { hasVoted: true });

      // Bersihkan storan sesi untuk perlindungan privasi
      sessionStorage.removeItem('activeVotingToken');
      sessionStorage.removeItem('voterDocId');
      
      // KEMASKINI NAVIGASI: Selaraskan terus ke laluan '/waiting' yang sah
      navigate('/waiting'); 
      
    } catch (err) {
      console.error("Ralat hantar undian:", err);
      setError('Gagal menghantar undi. Sila cuba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fd] p-4 flex flex-col items-center font-sans">
      <div className="max-w-md w-full">
        
        {/* Header Section */}
        <header className="relative flex flex-col items-center mb-8 mt-2">
          {currentStep > 0 && (
            <button 
              onClick={() => setCurrentStep(currentStep - 1)}
              className="absolute left-0 top-1 p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-2">
            Step {currentStep + 1} of {categories.length}
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight text-center">
            {currentCategory.title}
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1 text-center">
            Please select 1 to {currentCategory.max} candidates
          </p>
          <p className="text-blue-500 text-xs font-bold mt-2 bg-blue-50 px-3 py-1 rounded-full">
            Selected: {currentSelected.length} / {currentCategory.max}
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
              const isSelected = currentSelected.includes(c.id);
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
                    {c.role && (
                      <p className="text-slate-400 text-[11px] leading-relaxed mt-1 font-medium italic">
                        {c.role}
                      </p>
                    )}
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
            onClick={handleNextOrSubmit}
            disabled={currentSelected.length === 0 || loading || currentCandidates.length === 0}
            className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-xl ${
              currentSelected.length > 0 && currentCandidates.length > 0
              ? 'bg-[#638cf0] text-white hover:bg-blue-600 active:scale-95 shadow-blue-200' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={22} /> Processing...</>
            ) : currentStep === categories.length - 1 ? (
              <><CheckCircle size={22} /> Submit All Votes</>
            ) : (
              <>Next Category <ChevronLeft size={22} className="rotate-180" /></>
            )}
          </button>
          
          {currentStep === categories.length - 1 && (
            <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3 w-full">
               <Lock size={14} className="text-slate-300 mt-0.5 shrink-0" />
               <p className="text-[9px] text-slate-400 leading-normal">
                 Rekod undian disulitkan. Hanya pentadbir sistem yang mempunyai akses kepada log undian untuk tujuan audit.
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ballot;