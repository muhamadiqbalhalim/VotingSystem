import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ChevronLeft, AlertCircle, Loader2 } from 'lucide-react';

// Import config database dari firebase lokal
import { db } from '../firebase';

// KEMASKINI: Menggunakan import standard NPM (Bukan lagi gstatic URL)
import { collection, query, where, getDocs } from "firebase/firestore";

const VerifyToken = () => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // 1. Buat carian (query) ke koleksi 'voting' di mana voterToken sama dengan token yang diisi
      const q = query(collection(db, "voting"), where("voterToken", "==", token));
      const querySnapshot = await getDocs(q);

      // 2. Jika tiada dokumen dijumpai (Token salah)
      if (querySnapshot.empty) {
        setError('Token tidak sah atau tidak wujud dalam pangkalan data!');
        setLoading(false);
        return;
      }

      let userData = null;
      let userDocId = null;

      // KEMASKINI LOGIK: Menukar parameter 'doc' kepada 'd' untuk mengelakkan 'shadowing variable clash' dengan fungsi doc() dari Firestore
      querySnapshot.forEach((d) => {
        userData = d.data();
        userDocId = d.id;
      });

      // 3. Semak jika token ini sudah digunakan (hasVoted == true)
      if (userData.hasVoted) {
        setError('Token ini sudah digunakan untuk mengundi!');
        setLoading(false);
        return;
      }

      // 4. Jika berjaya dan token belum digunakan
      // Simpan token dan Doc ID untuk kegunaan di page Ballot nanti
      sessionStorage.setItem('activeVotingToken', token);
      sessionStorage.setItem('voterDocId', userDocId); 
      
      navigate('/ballot');

    } catch (err) {
      console.error("Ralat pengesahan token:", err);
      setError('Ralat sistem. Sila cuba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fd] p-6 flex flex-col items-center font-sans">
      <div className="w-full max-w-md">
        
        {/* Header with Back Button */}
        <header className="relative flex flex-col items-center mb-10 mt-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="absolute left-0 top-1 p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Verify Token</h1>
          <p className="text-slate-400 text-sm">Enter your unique code</p>
        </header>

        <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-100 border border-white">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <ShieldCheck size={32} />
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Input Token</label>
              <input 
                type="text" 
                placeholder="VOTE-XXXX"
                className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-400 focus:outline-none text-center font-black tracking-widest text-xl transition-all uppercase"
                onChange={(e) => setToken(e.target.value.toUpperCase())}
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full bg-[#638cf0] hover:bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:bg-slate-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Verifying...
                </>
              ) : (
                'Verify & Enter Ballot'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyToken;