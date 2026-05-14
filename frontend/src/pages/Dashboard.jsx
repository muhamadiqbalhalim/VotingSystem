import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Copy, CheckCircle2, ChevronLeft, LogOut } from 'lucide-react';

const Dashboard = () => {
  const [token, setToken] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem('voterToken');
    if (!savedToken) navigate('/login');
    setToken(savedToken);
  }, [navigate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fd] p-6 flex flex-col items-center font-sans">
      <div className="w-full max-w-md">
        
        {/* Header with Back Button */}
        <header className="relative flex flex-col items-center mb-10 mt-4">
          <button 
            onClick={() => navigate('/login')}
            className="absolute left-0 top-1 p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Your Token</h1>
          <p className="text-slate-400 text-sm">Use this to start voting</p>
        </header>

        <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-100 border border-white text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-12">
            <Ticket size={40} />
          </div>
          
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Voting Token</h2>
          
          <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 mb-6 group relative">
            <span className="text-3xl font-black text-slate-800 tracking-widest">{token}</span>
          </div>

          <button 
            onClick={handleCopy}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
              copied ? 'bg-green-500 text-white shadow-green-100' : 'bg-blue-600 text-white shadow-blue-100'
            } shadow-lg`}
          >
            {copied ? <><CheckCircle2 size={20} /> Copied!</> : <><Copy size={20} /> Copy Token</>}
          </button>
        </div>

        <button 
          onClick={() => navigate('/verify')}
          className="w-full mt-8 bg-white text-slate-800 py-5 rounded-2xl font-black shadow-sm border border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
        >
          Proceed to Verification <CheckCircle2 size={20} className="text-blue-500" />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;