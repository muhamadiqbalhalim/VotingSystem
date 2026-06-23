import { useState, useEffect } from 'react';
import { Users, FileText, Settings, Radio } from 'lucide-react';
import { initializeWithDetection } from '../languageTranslator.js';

import VotingControl from './VotingControl';
import Candidates from './Candidates';
import Results from './Results';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('controller');

  useEffect(() => {
    initializeWithDetection();
  }, []);

  const navItems = [
    { id: 'controller', label: 'Kawalan Pilihan Raya', icon: Settings },
    { id: 'candidates', label: 'Calon', icon: Users },
    { id: 'results', label: 'Keputusan', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center gap-3 text-blue-600 mb-2">
            <Radio className="animate-pulse" size={24} />
          </div>
          <h2 className="text-xl font-black text-slate-900">Panel Admin KSNSSB</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Konsol Kawalan Pusat</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 sm:p-8 min-h-[calc(100vh-64px)] shadow-xl">
          {activeTab === 'controller' && <VotingControl />}
          {activeTab === 'candidates' && <Candidates />}
          {activeTab === 'results' && <Results />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;