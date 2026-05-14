import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BarChart3, CheckCircle2, Lock, ChevronLeft, RefreshCw } from 'lucide-react';

const Results = () => {
  const [data, setData] = useState({ votes: {}, totalVotes: 0 });
  const navigate = useNavigate();

  const fetchResults = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/results');
      setData(res.data);
    } catch (err) {
      console.error("Gagal ambil data");
    }
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 5000);
    return () => clearInterval(interval);
  }, []);

  const calculatePercent = (val) => {
    return data.totalVotes > 0 ? Math.round((val / data.totalVotes) * 100) : 0;
  };

  const candidates = [
    { name: 'Tuan Haji Musa Zahidin', color: 'bg-blue-500' },
    { name: 'Tuan Ismail Marlan', color: 'bg-purple-500' },
    { name: 'Tuan Mohd Sirajuddean  AB Rahim', color: 'bg-pink-500' },
    { name: 'Puan Shuhaida Nur', color: 'bg-pink-500' },
    { name: 'Tuan Thesamany Tesaguru', color: 'bg-pink-500' },
    { name: 'Tuan Yusof Sunil', color: 'bg-pink-500' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fd] flex flex-col items-center p-6 font-sans">
      <div className="w-full max-w-md">
        
        {/* Header with Back Button */}
        <header className="relative flex flex-col items-center mb-8 mt-4">
          <button 
            onClick={() => navigate('/verify')}
            className="absolute left-0 top-1 p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Live Results</h1>
          <p className="text-slate-400 text-sm">Real-time voting statistics</p>
        </header>

        {/* Success Alert */}
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-[2rem] flex items-center gap-4 mb-8">
          <div className="bg-blue-500 p-2 rounded-full text-white shadow-lg shadow-blue-100">
            <CheckCircle2 size={20} />
          </div>
          <p className="text-xs font-bold text-blue-700 uppercase tracking-tight">Your vote has been counted!</p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-50 p-8 border border-white">
          <div className="bg-slate-50 text-slate-600 px-4 py-2 rounded-full inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-8 border border-slate-100">
            <BarChart3 size={14} className="text-blue-500" /> {data.totalVotes} Total Votes
          </div>

          <div className="space-y-10">
            {candidates.map((c) => {
              const count = data.votes[c.name] || 0;
              const percent = calculatePercent(count);
              return (
                <div key={c.name} className="relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-black text-slate-700 text-sm">{c.name}</span>
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                      {count} Votes
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div 
                      className={`${c.color} h-full transition-all duration-1000 ease-out`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="text-right mt-1">
                    <span className={`text-[10px] font-black ${c.color.replace('bg-', 'text-')}`}>{percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button 
          onClick={fetchResults}
          className="w-full mt-8 bg-white text-blue-600 py-4 rounded-2xl font-bold shadow-sm border border-blue-50 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <RefreshCw size={16} /> Refresh Results
        </button>
      </div>
    </div>
  );
};

export default Results;