import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ChevronLeft, AlertCircle } from 'lucide-react';

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
      const res = await axios.post('http://localhost:5000/api/verify-token', { token });
      if (res.data.success) {
        sessionStorage.setItem('activeVotingToken', token);
        navigate('/ballot');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Token tidak sah!');
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
                className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-400 focus:outline-none text-center font-black tracking-widest text-xl transition-all"
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
              className="w-full bg-[#638cf0] hover:bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:bg-slate-300"
            >
              {loading ? 'Verifying...' : 'Verify & Enter Ballot'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyToken;