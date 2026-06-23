import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Building2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import logo from '../assets/logo.png';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { CATEGORY_IDS } from '../lib/electionConfig';
import { initializeWithDetection } from '../languageTranslator.js';

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    initializeWithDetection();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData({ id: user.uid, ...userDoc.data() });
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
        setTimeout(initializeWithDetection, 100);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const completedVoting = userData?.hasVoted || (userData?.votedCategories?.length || 0) >= CATEGORY_IDS.length;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    } catch (error) { console.error(error); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 px-4 py-8 lg:py-16 text-slate-900">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <img src={logo} alt="Logo" className="h-12 mx-auto mb-4 object-contain" />
          <h1 data-translate="dashboardTitle" className="text-4xl lg:text-5xl font-black text-slate-900">Voting Portal</h1>
          <p data-translate="dashboardSubtitle" className="text-sm text-slate-500 mt-2">KSNSSB E-Voting System • Integrity in every vote</p>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 space-y-6 border border-slate-100 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600"><User size={24} /></div>
            <div>
              <p data-translate="voterLabel" className="text-[10px] uppercase font-bold text-slate-400">Registered Voter</p>
              <p className="font-bold text-slate-900">{userData?.fullName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600"><Building2 size={24} /></div>
            <div>
              <p data-translate="orgLabel" className="text-[10px] uppercase font-bold text-slate-400">Organization</p>
              <p className="font-bold text-slate-900">{userData?.company}</p>
            </div>
          </div>

          {/* Voting Status Card */}
          <div className={`rounded-2xl p-4 flex items-center gap-4 border ${userData?.hasVoted ? 'bg-green-50 border-green-200 text-green-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
            {userData?.hasVoted ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <div>
              <p className="text-sm font-bold" data-translate={userData?.hasVoted ? "voteSubmitted" : "voteNotCast"}>
                {userData?.hasVoted ? 'Vote Submitted' : 'Vote Not Yet Cast'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => navigate('/vote')}
            disabled={completedVoting}
            className={`w-full rounded-2xl py-4 font-bold transition-all ${completedVoting ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'}`}
          >
            <span data-translate={completedVoting ? "votingDone" : "beginVoting"}>
              {completedVoting ? 'Voting Completed' : '→ Begin Voting'}
            </span>
          </button>

          <button onClick={handleLogout} className="w-full rounded-2xl border border-slate-200 bg-white py-4 font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2">
            <LogOut size={18} />
            <span data-translate="logout">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;