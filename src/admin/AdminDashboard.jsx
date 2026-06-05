import React, { useState } from 'react';

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

  const [activeTab, setActiveTab] =
    useState('controller');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">

      {/* SIDEBAR */}

      <div className="w-full md:w-72 bg-slate-900 text-white flex flex-col shadow-xl">

        <div className="p-8 border-b border-slate-800">

          <div className="flex items-center gap-3 text-blue-400 mb-2">
            <Radio
              className="animate-pulse"
              size={28}
            />
          </div>

          <h2 className="text-2xl font-black">
            P2SA Admin
          </h2>

          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Central Control Console
          </p>

        </div>

        <nav className="flex-1 p-4 space-y-3">

          <button
            onClick={() =>
              setActiveTab(
                'controller'
              )
            }
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
              activeTab ===
              'controller'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings size={20} />
            Election Control
          </button>

          <button
            onClick={() =>
              setActiveTab(
                'candidates'
              )
            }
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
              activeTab ===
              'candidates'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users size={20} />
            Candidates
          </button>

          <button
            onClick={() =>
              setActiveTab(
                'results'
              )
            }
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
              activeTab ===
              'results'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText size={20} />
            Results
          </button>

        </nav>

      </div>

      {/* CONTENT */}

      <div className="flex-1 overflow-y-auto">

        {activeTab ===
          'controller' && (
          <VotingControl />
        )}

        {activeTab ===
          'candidates' && (
          <Candidates />
        )}

        {activeTab ===
          'results' && (
          <Results />
        )}

      </div>

    </div>
  );
};

export default AdminDashboard;