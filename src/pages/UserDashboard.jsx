import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  User,
  Building2,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

import logo from '../assets/image_be4763.png';

import { auth, db } from '../firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { CATEGORY_IDS } from '../lib/electionConfig';
// Import fungsi penterjemah
import { initializeWithDetection } from '../languageTranslator.js';

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    // Memastikan bahasa kekal mengikut pilihan pengguna
    initializeWithDetection();

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          navigate('/login');
          return;
        }

        try {
          const userRef = doc(
            db,
            'users',
            user.uid
          );

          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            setUserData({
              id: user.uid,
              ...userDoc.data()
            });
          } else {
            await signOut(auth);
            localStorage.clear();
            sessionStorage.clear();
            navigate('/login');
          }
        } catch (error) {
          console.error(
            'Error loading user profile:',
            error
          );
        } finally {
          setLoading(false);
          // Panggil semula selepas data dimuatkan untuk memastikan teks baru dikemaskini
          setTimeout(initializeWithDetection, 100);
        }
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  const completedVoting = userData?.hasVoted || (userData?.votedCategories?.length || 0) >= CATEGORY_IDS.length;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <Loader2
          className="animate-spin text-blue-600"
          size={40}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 px-4 lg:px-8 py-12 lg:py-16 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.06),transparent_25%)]" />
      <div className="relative max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <img
            src={logo}
            alt="P2SA Logo"
            className="h-16 mx-auto mb-6 object-contain"
          />

          <div className="space-y-3">
            <h1 data-translate="dashboardTitle" className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">
              Voting Portal
            </h1>
            <p data-translate="dashboardSubtitle" className="text-lg text-slate-600 max-w-2xl mx-auto">
              AGM Election 2026 • Your secure vote matters
            </p>
          </div>
        </div>

        {/* User Information */}
        <div className="glass-panel rounded-3xl p-10 lg:p-12 space-y-8 border-slate-200/50">

          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <User size={28} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p data-translate="voterLabel" className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">
                Registered Voter
              </p>
              <p className="font-bold text-slate-900 text-lg">
                {userData?.fullName || 'N/A'}
              </p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-slate-300/20 via-slate-300/40 to-slate-300/20"></div>

          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
              <Building2 size={28} className="text-indigo-600" />
            </div>
            <div className="flex-1">
              <p data-translate="orgLabel" className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">
                Organization
              </p>
              <p className="font-medium text-slate-700 text-lg">
                {userData?.company || 'N/A'}
              </p>
            </div>
          </div>

          {/* Voting Status */}
          <div
            className={`rounded-2xl p-5 flex items-center gap-4 font-bold transition-all ${
              userData?.hasVoted
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-300'
                : 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-300'
            }`}
          >
            <div className={`p-2 rounded-full ${userData?.hasVoted ? 'bg-green-200/30' : 'bg-amber-200/30'}`}>
              {userData?.hasVoted ? (
                <CheckCircle2 size={24} />
              ) : (
                <AlertCircle size={24} />
              )}
            </div>
            <div className="flex-1">
              <p data-translate={userData?.hasVoted ? "voteSubmitted" : "voteNotCast"} className="text-sm font-bold">
                {userData?.hasVoted ? 'Vote Submitted' : 'Vote Not Yet Cast'}
              </p>
              <p className="text-xs font-medium opacity-85">
                {userData?.hasVoted 
                  ? 'Your selections have been securely recorded' 
                  : 'Begin the voting process when ready'}
              </p>
            </div>
          </div>

        </div>

        {/* Vote Button */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 max-w-3xl">
          <button
            onClick={() => navigate('/vote')}
            disabled={completedVoting}
            className={`relative overflow-hidden rounded-2xl px-8 py-5 text-lg font-bold transition-all group ${
              completedVoting
                ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                : 'bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/40 hover:shadow-xl hover:-translate-y-1'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-center gap-2">
              <span data-translate={completedVoting ? "votingDone" : "beginVoting"}>
                {completedVoting ? 'Voting Completed' : '→ Begin Voting'}
              </span>
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="rounded-2xl border-2 border-slate-300 bg-white text-slate-700 font-bold transition-all hover:bg-slate-50 hover:border-slate-400 px-8 py-5 text-lg flex items-center justify-center gap-2 group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span data-translate="logout">Logout</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;