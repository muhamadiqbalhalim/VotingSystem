import { useState } from 'react';
import {
  Users,
  FileText,
  Settings,
  Radio
} from 'lucide-react';

import VotingControl from './VotingControl';
import Candidates from './Candidates';
import Results from './Results';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('controller');

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 text-slate-900 flex flex-col md:flex-row">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.06),transparent_25%)]" />

      {/* SIDEBAR */}
      <div className="w-full md:w-72 bg-white text-slate-900 flex flex-col shadow-xl border-r border-slate-200">
        <div className="p-8 border-b border-slate-200">
          <div className="flex items-center gap-3 text-blue-600 mb-2">
            <Radio className="animate-pulse" size={28} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            Panel Admin KSNSSB
          </h2>
          <p className="text-slate-600 text-xs font-bold uppercase tracking-widest mt-1">
            Konsol Kawalan Pusat
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-3">
          <button
            onClick={() => setActiveTab('controller')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
              activeTab === 'controller'
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Settings size={20} />
            Kawalan Pilihan Raya
          </button>

          <button
            onClick={() => setActiveTab('candidates')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
              activeTab === 'candidates'
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users size={20} />
            Calon
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
              activeTab === 'results'
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText size={20} />
            Keputusan
          </button>
        </nav>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <div className="glass-panel-soft min-h-[calc(100vh-48px)] rounded-[2rem] border-slate-200 p-6 sm:p-8 bg-white/50">
          {activeTab === 'controller' && <VotingControl />}
          {activeTab === 'candidates' && <Candidates />}
          {activeTab === 'results' && <Results />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;