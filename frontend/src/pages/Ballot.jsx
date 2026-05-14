import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, ChevronLeft, Lock } from 'lucide-react';

const Ballot = () => {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Senarai calon selaras dengan Live Results di Backend
  const candidates = [
    { id: 1, name: 'Tuan Haji Musa Zahidin', role: 'Candidate 01' },
    { id: 2, name: 'Tuan Ismail Marlan', role: 'Candidate 02' },
    { id: 3, name: 'Tuan Mohd Sirajuddean  AB Rahim', role: 'Candidate 03' },
    { id: 4, name: 'Puan Shuhaida Nur', role: 'Candidate 04' },
    { id: 5, name: 'Tuan Thesamany Tesaguru', role: 'Candidate 05' },
    { id: 6, name: 'Yusof Sunil', role: 'Candidate 06' }
  ];

  const handleVote = async () => {
    const activeToken = sessionStorage.getItem('activeVotingToken');
    const selectedCandidate = candidates.find(c => c.id === selected);

    if (!activeToken) {
      setError('Sesi tamat. Sila verify token semula.');
      return;
    }

    if (!selectedCandidate) {
      setError('Sila pilih calon terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      // Hantar token DAN nama calon ke backend
      const response = await axios.post('http://localhost:5000/api/vote', { 
        token: activeToken,
        candidateName: selectedCandidate.name 
      });

      if (response.data.success) {
        // Selepas berjaya "burn" token, bawa ke page Live Results
        navigate('/results'); 
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghantar undi. Sila cuba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fd] p-4 flex flex-col items-center font-sans">
      <div className="max-w-md w-full">
        
        {/* Header Section */}
        <header className="relative flex flex-col items-center mb-8 mt-4">
          <button 
            onClick={() => navigate('/verify')}
            className="absolute left-0 top-1 p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Cast Your Vote</h1>
          <p className="text-slate-400 text-sm font-medium">Select one candidate</p>
        </header>

        {/* Official Badge */}
        <div className="bg-blue-50/50 self-start px-4 py-1.5 rounded-full flex items-center gap-2 mb-6 border border-blue-100/50 w-fit">
          <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
            <CheckCircle size={10} className="text-blue-600" />
          </div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Official Ballot</span>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 flex items-center gap-3 rounded-2xl animate-pulse">
            <AlertCircle size={18} />
            <span className="font-bold text-xs">{error}</span>
          </div>
        )}

        {/* Candidates List */}
        <div className="space-y-4">
          {candidates.map((c) => (
            <div 
              key={c.id}
              onClick={() => setSelected(c.id)}
              className={`group relative p-6 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer flex items-start gap-4 ${
                selected === c.id 
                ? 'border-blue-400 bg-blue-50/30 shadow-lg shadow-blue-100/50' 
                : 'border-gray-100 bg-white hover:border-blue-200 shadow-sm'
              }`}
            >
              <div className="flex-1">
                <h3 className={`font-black text-lg transition-colors ${selected === c.id ? 'text-blue-600' : 'text-slate-800'}`}>
                  {c.name}
                </h3>
                <p className="text-slate-400 text-[11px] leading-relaxed mt-1 font-medium italic">
                  "{c.desc}"
                </p>
              </div>
              
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 mt-1 ${
                selected === c.id ? 'border-blue-500 bg-blue-500' : 'border-gray-200'
              }`}>
                {selected === c.id && <CheckCircle size={14} className="text-white" />}
              </div>
            </div>
          ))}
        </div>

        {/* Action Button Section */}
        <div className="mt-12 flex flex-col items-center">
          <button 
            onClick={handleVote}
            disabled={!selected || loading}
            className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-xl ${
              selected 
              ? 'bg-[#638cf0] text-white hover:bg-blue-600 active:scale-95 shadow-blue-200' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <CheckCircle size={22} />
            {loading ? 'Processing Vote...' : 'Submit Vote'}
          </button>
          
          <p className="mt-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest text-center">
            This action is permanent and cannot be undone.
          </p>

          {/* Privacy Footer */}
          <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3 w-full">
             <Lock size={14} className="text-slate-300 mt-0.5 shrink-0" />
             <p className="text-[9px] text-slate-400 leading-normal">
               Tokens are decoupled from identities upon successful verification to ensure 100% anonymity. Your choice is never linked back to your account.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Ballot;