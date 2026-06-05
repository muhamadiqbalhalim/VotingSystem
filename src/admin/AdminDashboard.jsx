import React, { useState } from 'react';
import { Users, FileText, Settings, Radio } from 'lucide-react';

import AdminController from './VotingControl';
import Candidates from './Candidates';
import AdminReport from './Results';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('controller');

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-72 bg-slate-900 text-white flex flex-col shadow-xl z-20 md:min-h-screen">
        <div className="p-8 border-b border-slate-800">
          <div className="flex items-center gap-3 text-blue-400 mb-2">
            <Radio className="animate-pulse" size={28} />
          </div>
          <h2 className="text-2xl font-black tracking-tight">P2SA Admin</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Central Control Console</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-3">
          <button
            onClick={() => setActiveTab('controller')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
              activeTab === 'controller' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings size={20} /> Election Controller
          </button>
          
          <button
            onClick={() => setActiveTab('candidates')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
              activeTab === 'candidates' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users size={20} /> Manage Candidates
          </button>
          
          <button
            onClick={() => setActiveTab('report')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
              activeTab === 'report' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText size={20} /> Reports & Audits
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-screen overflow-y-auto bg-slate-50 relative">
        {activeTab === 'controller' && (
          <div className="animate-in fade-in duration-500">
            <AdminController />
          </div>
        )}
        {activeTab === 'candidates' && (
          <div className="animate-in fade-in duration-500">
            <AdminCandidates />
          </div>
        )}
        {activeTab === 'report' && (
          <div className="animate-in fade-in duration-500">
            <AdminReport />
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;