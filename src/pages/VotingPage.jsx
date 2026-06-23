import { useMemo, useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Lock, CheckSquare, Square, Loader2 } from 'lucide-react';

import { db, auth } from '../firebase/config';
import {
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";
import { CATEGORIES, CATEGORY_IDS, LOCKED_CATEGORY, isValidCategory } from '../lib/electionConfig';
import { initializeWithDetection } from '../languageTranslator.js';

const VotingPage = () => {
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState(null); 
  const [votedCategories, setVotedCategories] = useState([]); 
  const [showReview, setShowReview] = useState(false);
  const [liveCandidates, setLiveCandidates] = useState({});
  
  const navigate = useNavigate();

  useLayoutEffect(() => {
    initializeWithDetection();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) { navigate('/login'); return; }

    const unsubUser = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.role === 'admin') { navigate('/admin'); return; }
        setVotedCategories(userData.votedCategories || []);
      }
    });

    const unsubSettings = onSnapshot(doc(db, "settings", "election"), (docSnap) => {
      setActiveCategory(docSnap.exists() ? docSnap.data().activeCategory : LOCKED_CATEGORY);
    });

    const unsubCandidates = onSnapshot(collection(db, "candidates"), (snapshot) => {
      const grouped = {};
      snapshot.forEach((d) => {
        const data = d.data();
        const cat = data.category;
        if (!grouped[cat]) grouped[cat] = [];
        if (data.active !== false) grouped[cat].push({ id: d.id, ...data });
      });
      Object.keys(grouped).forEach((key) => grouped[key].sort((a, b) => a.name.localeCompare(b.name)));
      setLiveCandidates(grouped);
    });

    return () => { unsubUser(); unsubSettings(); unsubCandidates(); };
  }, [navigate]);

  const isLocked = activeCategory === LOCKED_CATEGORY || !activeCategory || !isValidCategory(activeCategory);
  const currentCategoryConfig = CATEGORIES[activeCategory];
  const hasVotedForCurrent = votedCategories.includes(activeCategory);
  const completedCategoryCount = CATEGORY_IDS.filter((id) => votedCategories.includes(id)).length;
  const hasCompletedAll = completedCategoryCount >= CATEGORY_IDS.length;
  
  const currentCandidates = useMemo(() => liveCandidates[activeCategory] || [], [activeCategory, liveCandidates]);
  const selectedCandidates = useMemo(() => currentCandidates.filter((c) => selections.includes(c.id)), [currentCandidates, selections]);

  useEffect(() => {
      setSelections([]);
      setError('');
      setShowReview(false);
      setTimeout(initializeWithDetection, 100);
  }, [activeCategory]);

  const toggleSelection = (candidateId) => {
    if (loading) return;
    setError('');
    let updated = selections.includes(candidateId) 
      ? selections.filter(id => id !== candidateId)
      : [...selections, candidateId];
    
    const max = currentCategoryConfig?.max || 1;
    if (updated.length > max) return;
    setSelections(updated);
  };

  const confirmSubmitVote = async () => {
    setLoading(true);
    setError('');
    try {
      const user = auth.currentUser;
      const userRef = doc(db, "users", user.uid);
      const settingsRef = doc(db, "settings", "election");

      await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);
        const settingsSnap = await transaction.get(settingsRef);
        
        if (!settingsSnap.exists() || settingsSnap.data().activeCategory !== activeCategory) {
          throw new Error('PHASE_CHANGED');
        }

        const currentVoted = userSnap.data().votedCategories || [];
        const updatedVoted = Array.from(new Set([...currentVoted, activeCategory]));
        const isLastVote = updatedVoted.length >= CATEGORY_IDS.length;

        transaction.update(userRef, {
          [`votes.${activeCategory}`]: selections,
          [`voteDetails.${activeCategory}`]: {
             candidateIds: selections,
             submittedAt: serverTimestamp()
          },
          votedCategories: updatedVoted,
          hasVoted: isLastVote,
          lastVotedAt: serverTimestamp()
        });
      });
      
      setSelections([]);
      setShowReview(false);
    } catch (err) {
      console.error("Voting Error:", err);
      setError(err.message === 'PHASE_CHANGED' ? 'Fasa undian telah bertukar.' : 'Ralat penghantaran undi.');
    } finally {
      setLoading(false);
    }
  };

  if (hasCompletedAll) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white p-8 rounded-3xl shadow-xl text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h1 data-translate="votingCompleted" className="text-xl font-black mb-2">Voting Completed</h1>
        <button onClick={() => navigate('/dashboard')} className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl font-bold" data-translate="returnDashboard">Return</button>
      </div>
    </div>
  );

  if (isLocked) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white p-8 rounded-3xl shadow-xl text-center">
        <Lock className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h1 data-translate="votingNotOpen" className="text-xl font-black">Not Open</h1>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8 flex flex-col items-center">
      <div className="max-w-md w-full bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
        <header className="text-center mb-8">
          <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-600 px-3 py-1 rounded-full" data-translate="activeBallot">Active Ballot</span>
          <h1 className="text-2xl font-black mt-3">{currentCategoryConfig?.title}</h1>
        </header>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl text-center">{error}</div>}

        <div className="space-y-3 mb-8">
          {currentCandidates.map((c) => (
            <div key={c.id} onClick={() => toggleSelection(c.id)} className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between ${selections.includes(c.id) ? 'border-blue-500 bg-blue-50' : 'border-slate-100'}`}>
              <span className="font-bold text-sm">{c.name}</span>
              {selections.includes(c.id) ? <CheckSquare className="text-blue-600" size={20} /> : <Square className="text-slate-300" size={20} />}
            </div>
          ))}
        </div>

        <button 
          onClick={() => selections.length > 0 && setShowReview(true)} 
          disabled={loading}
          className={`w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm ${loading ? 'opacity-50' : ''}`} 
          data-translate="submitBallot"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      {showReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm">
            <h2 className="text-lg font-black mb-4" data-translate="reviewBallot">Review</h2>
            {selectedCandidates.map(c => <div key={c.id} className="text-sm font-bold mb-2">{c.name}</div>)}
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowReview(false)} className="flex-1 py-3 border rounded-xl font-bold text-sm" data-translate="back">Back</button>
              <button onClick={confirmSubmitVote} disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm" data-translate="confirm">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingPage;