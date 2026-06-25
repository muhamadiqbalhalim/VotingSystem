import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Lock, CheckSquare, Square } from 'lucide-react';

import { db, auth } from '../firebase/config';
import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [candidateSnapshot, setCandidateSnapshot] = useState({ category: null, candidates: [] });
  const activeCategoryRef = useRef(null);
  
  const navigate = useNavigate();

  useLayoutEffect(() => {
    initializeWithDetection();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) { navigate('/login'); return; }

    const userUid = user.uid;
    const unsubUser = onSnapshot(doc(db, "users", userUid), (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.role === 'admin') { navigate('/admin'); return; }
        setVotedCategories(userData.votedCategories || []);
      }
      setLoadingUser(false);
    }, () => {
      setError('Unable to load voter profile.');
      setLoadingUser(false);
    });

    const unsubSettings = onSnapshot(doc(db, "settings", "election"), (docSnap) => {
      const nextCategory = docSnap.exists() ? docSnap.data().activeCategory : LOCKED_CATEGORY;
      if (activeCategoryRef.current !== nextCategory) {
        activeCategoryRef.current = nextCategory;
        setSelections([]);
        setError('');
        setShowReview(false);
        setTimeout(initializeWithDetection, 100);
      }
      setActiveCategory(nextCategory);
      setLoadingSettings(false);
    }, () => {
      activeCategoryRef.current = LOCKED_CATEGORY;
      setActiveCategory(LOCKED_CATEGORY);
      setLoadingSettings(false);
    });

    return () => { unsubUser(); unsubSettings(); };
  }, [navigate]);

  useEffect(() => {
    if (!activeCategory || activeCategory === LOCKED_CATEGORY || !isValidCategory(activeCategory)) {
      return undefined;
    }

    const candidatesQuery = query(
      collection(db, "candidates"),
      where("category", "==", activeCategory),
      where("active", "==", true)
    );

    const unsubscribe = onSnapshot(candidatesQuery, (snapshot) => {
      const candidates = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setCandidateSnapshot({ category: activeCategory, candidates });
    }, () => {
      setError('Unable to load candidates for this ballot.');
    });

    return () => unsubscribe();
  }, [activeCategory]);

  const isLocked = activeCategory === LOCKED_CATEGORY || !activeCategory || !isValidCategory(activeCategory);
  const currentCategoryConfig = CATEGORIES[activeCategory];
  const currentCandidates = useMemo(
    () => candidateSnapshot.category === activeCategory ? candidateSnapshot.candidates : [],
    [activeCategory, candidateSnapshot]
  );
  const loadingCandidates = !isLocked && candidateSnapshot.category !== activeCategory;
  const hasVotedForCurrent = votedCategories.includes(activeCategory);
  const totalCategories = CATEGORY_IDS.length;
  const completedCategoryCount = CATEGORY_IDS.filter((categoryId) => votedCategories.includes(categoryId)).length;
  const hasCompletedAll = completedCategoryCount >= totalCategories;

  const selectedCandidates = useMemo(() => currentCandidates.filter((c) => selections.includes(c.id)), [currentCandidates, selections]);

  const toggleSelection = useCallback((candidateId) => {
    if (loading) return;
    setError('');
    setSelections((current) => {
      const updated = current.includes(candidateId)
        ? current.filter(id => id !== candidateId)
        : [...current, candidateId];

      const max = currentCategoryConfig?.max || 1;
      if (updated.length > max) {
        setError(`Maximum selection limit reached. You can only choose up to ${max} candidate${max > 1 ? 's' : ''}.`);
        return current;
      }
      return updated;
    });
  }, [currentCategoryConfig?.max, loading]);

  const handleSubmitVote = async () => {
    if (selections.length < 1) { setError('Please select at least 1 candidate.'); return; }
    if (selectedCandidates.length !== selections.length) {
      setError('Candidate list changed. Please review your selection again.');
      return;
    }
    setShowReview(true);
  };

  const confirmSubmitVote = async () => {
    if (hasVotedForCurrent) return;
    setLoading(true);
    try {
      const user = auth.currentUser;
      const userRef = doc(db, "users", user.uid);
      const settingsRef = doc(db, "settings", "election");

      await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);
        const settingsSnap = await transaction.get(settingsRef);
        
        if (!userSnap.exists()) {
          throw new Error('USER_NOT_FOUND');
        }
        if (!settingsSnap.exists() || settingsSnap.data().activeCategory !== activeCategory) {
          throw new Error('VOTING_PHASE_CHANGED');
        }
        if (!isValidCategory(activeCategory)) {
          throw new Error('INVALID_CATEGORY');
        }

        const maxSelections = CATEGORIES[activeCategory].max || 1;
        const uniqueSelections = Array.from(new Set(selections));
        if (uniqueSelections.length !== selections.length || uniqueSelections.length < 1 || uniqueSelections.length > maxSelections) {
          throw new Error('INVALID_SELECTION');
        }

        const candidateSnaps = await Promise.all(
          uniqueSelections.map((candidateId) => transaction.get(doc(db, "candidates", candidateId)))
        );
        const candidateNames = candidateSnaps.map((candidateSnap) => {
          const data = candidateSnap.data();
          if (!candidateSnap.exists() || data.category !== activeCategory || data.active === false) {
            throw new Error('INVALID_SELECTION');
          }
          return data.name;
        });

        const currentVoted = userSnap.data()?.votedCategories || [];
        if (currentVoted.includes(activeCategory)) {
          throw new Error('ALREADY_VOTED');
        }
        const updatedVoted = Array.from(new Set([...currentVoted, activeCategory]));
        const isLastVote = updatedVoted.length >= CATEGORY_IDS.length;

        transaction.update(userRef, {
          [`votes.${activeCategory}`]: uniqueSelections,
          [`voteDetails.${activeCategory}`]: {
            candidateIds: uniqueSelections,
            candidateNames,
            category: activeCategory,
            submittedAt: serverTimestamp()
          },
          votedCategories: updatedVoted,
          hasVoted: isLastVote,
          lastVotedAt: serverTimestamp()
        });
      });
      
      setSelections([]);
      setShowReview(false);
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (err) {
      console.error("Voting Error:", err);
      const message = err.message === 'VOTING_PHASE_CHANGED'
        ? 'The voting phase has changed.'
        : err.message === 'ALREADY_VOTED'
          ? 'Your vote for this category is already recorded.'
          : err.message === 'INVALID_SELECTION'
            ? 'Your selection is no longer valid. Please choose again.'
            : 'Transmission Error.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser || loadingSettings) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white px-6 py-4 rounded-2xl shadow-sm text-sm font-bold text-slate-500">
        Preparing ballot...
      </div>
    </div>
  );

  if (isSubmitted) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-[3rem] shadow-xl text-center">
        <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
        <h1 className="text-2xl font-black">Vote Submitted</h1>
      </div>
    </div>
  );

  if (hasCompletedAll) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-lg text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
        <h1 data-translate="votingCompleted" className="text-2xl font-black mb-3">Voting Completed</h1>
        <p data-translate="votingCompletedDesc" className="text-slate-600 text-sm mb-8">Thank you. Your selections are secured.</p>
        <button onClick={async () => { await updateDoc(doc(db, "users", auth.currentUser.uid), { hasVoted: true }); navigate('/dashboard'); }} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold" data-translate="returnDashboard">Return to Dashboard</button>
      </div>
    </div>
  );

  if (isLocked) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-lg text-center">
        <Lock className="w-16 h-16 text-blue-600 mx-auto mb-6" />
        <h1 data-translate="votingNotOpen" className="text-2xl font-black mb-2">Voting Not Open Yet</h1>
      </div>
    </div>
  );

  if (hasVotedForCurrent) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-lg text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
        <h1 data-translate="voteSubmitted" className="text-2xl font-black mb-2">Vote Submitted</h1>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 lg:p-8 flex flex-col items-center justify-center">
      <div className="glass-panel relative max-w-2xl w-full rounded-3xl p-10 lg:p-14 border-slate-200/50 bg-white">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 mb-6">
            <span className="text-xs font-bold text-blue-700 uppercase" data-translate="activeBallot">Active Ballot</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-3">{currentCategoryConfig?.title}</h1>
          <p className="text-slate-600" data-translate="selectNominees">Select your candidates</p>
        </header>

        {error && <div className="mb-8 p-5 bg-red-50 text-red-700 rounded-2xl font-bold text-center">{error}</div>}

        <div className="space-y-3 mb-10">
          {loadingCandidates && (
            <div className="p-6 rounded-[2rem] border-2 border-slate-100 bg-slate-50 text-center text-sm font-bold text-slate-400">
              Loading candidates...
            </div>
          )}
          {!loadingCandidates && currentCandidates.length === 0 && (
            <div className="p-6 rounded-[2rem] border-2 border-amber-100 bg-amber-50 text-center text-sm font-bold text-amber-700">
              No active candidates for this ballot.
            </div>
          )}
          {currentCandidates.map((c) => (
            <div key={c.id} onClick={() => toggleSelection(c.id)} className={`p-6 rounded-[2rem] border-2 cursor-pointer flex items-center justify-between ${selections.includes(c.id) ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}>
              <h3 className="font-black text-xl">{c.name}</h3>
              {selections.includes(c.id) ? <CheckSquare className="text-blue-600" size={24} /> : <Square className="text-slate-400" size={24} />}
            </div>
          ))}
        </div>

        <button onClick={handleSubmitVote} disabled={loading || loadingCandidates || currentCandidates.length === 0} className="w-full py-5 bg-blue-700 text-white rounded-3xl font-black disabled:bg-slate-300 disabled:cursor-not-allowed" data-translate="submitBallot">Submit Ballot</button>
      </div>

      {showReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
            <h2 data-translate="reviewBallot" className="text-xl font-black mb-4">Review your ballot</h2>
            <div className="space-y-2 mb-6">{selectedCandidates.map(c => <div key={c.id} className="bg-slate-100 p-3 rounded-xl font-bold">{c.name}</div>)}</div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowReview(false)} disabled={loading} className="py-3 border rounded-2xl font-bold disabled:opacity-60" data-translate="back">Back</button>
              <button onClick={confirmSubmitVote} disabled={loading} className="py-3 bg-blue-700 text-white rounded-2xl font-bold disabled:bg-slate-300" data-translate="confirm">{loading ? 'Submitting...' : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingPage;
