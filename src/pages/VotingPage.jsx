import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Lock, CheckSquare, Square, Loader2, ShieldCheck, X } from 'lucide-react';

import { db, auth } from '../firebase/config';
import {
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { CATEGORIES, CATEGORY_IDS, LOCKED_CATEGORY, isValidCategory } from '../lib/electionConfig';

const VotingPage = () => {
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState(null); 
  const [votedCategories, setVotedCategories] = useState([]); 
  const [showReview, setShowReview] = useState(false);
  
  const [liveCandidates, setLiveCandidates] = useState({
    president: [], deputy: [], vice: [], secretary: [], treasurer: [], exco: []
  });
  
  const navigate = useNavigate();

    useEffect(() => {
      const user = auth.currentUser;

      if (!user) {
        navigate('/login');
        return;
      }

      const userUid = user.uid;

      const unsubUser = onSnapshot(
        doc(db, "voting", userUid),
        (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            
            // Redirect admins away from voting
            if (userData.role === 'admin') {
              navigate('/admin');
              return;
            }
            
            setVotedCategories(
              userData.votedCategories || []
            );
          }
        }
      );

      const unsubSettings = onSnapshot(
        doc(db, "settings", "election"),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setActiveCategory(
              data.activeCategory || LOCKED_CATEGORY
            );
          } else {
            setActiveCategory(LOCKED_CATEGORY);
          }
        }
      );

      const unsubCandidates = onSnapshot(
        collection(db, "candidates"),
        (snapshot) => {
          const grouped = {
            president: [],
            deputy: [],
            vice: [],
            secretary: [],
            treasurer: [],
            exco: []
          };

          snapshot.forEach((d) => {
            const data = d.data();

            if (grouped[data.category] && data.active !== false) {
              grouped[data.category].push({
                id: d.id,
                ...data
              });
            }
          });

          Object.keys(grouped).forEach((key) => {
            grouped[key].sort((a, b) =>
              a.name.localeCompare(b.name)
            );
          });

          setLiveCandidates(grouped);
        }
      );

      return () => {
        unsubUser();
        unsubSettings();
        unsubCandidates();
      };
    }, [navigate]);

  const isLocked = activeCategory === LOCKED_CATEGORY || !activeCategory || !isValidCategory(activeCategory);
  const currentCategoryConfig = CATEGORIES[activeCategory];
  const currentCandidates = useMemo(
    () => liveCandidates[activeCategory] || [],
    [activeCategory, liveCandidates]
  );
  const hasVotedForCurrent = votedCategories.includes(activeCategory);
  
  const totalCategories = CATEGORY_IDS.length;
  const completedCategoryCount = CATEGORY_IDS.filter((categoryId) =>
    votedCategories.includes(categoryId)
  ).length;
  const hasCompletedAll = completedCategoryCount === totalCategories;

  const selectedCandidates = useMemo(
    () => currentCandidates.filter((candidate) => selections.includes(candidate.id)),
    [currentCandidates, selections]
  );

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
      setSelections([]);
      setError('');
      setShowReview(false);
  }, [activeCategory]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const toggleSelection = (candidateId) => {
    if (loading) return;

    setError('');
    let updatedSelection = [...selections];

    if (updatedSelection.includes(candidateId)) {
      updatedSelection = updatedSelection.filter(id => id !== candidateId);
    } else {
      if (updatedSelection.length >= (currentCategoryConfig?.max || 1)) {
        setError(`Maximum selection limit reached. You can only choose up to ${currentCategoryConfig.max} candidates for this category.`);
        return;
      }
      updatedSelection.push(candidateId);
    }

    setSelections(updatedSelection);
  };

  const handleSubmitVote = async () => {
    if (selections.length < 1) {
      setError('Please select at least 1 candidate before submitting your ballot.');
      return;
    }
    setShowReview(true);
  };

  const confirmSubmitVote = async () => {
    if (hasVotedForCurrent) {
      setError('You have already voted for this category.');
      return;
    }
    setLoading(true);
    
    try {
      const user = auth.currentUser;

      if (!user) {
        navigate('/login');
        return;
      }

      const userUid = user.uid;
      const userRef = doc(db, "voting", userUid);
      const settingsRef = doc(db, "settings", "election");
      const candidateRefs = selections.map((candidateId) =>
        doc(db, "candidates", candidateId)
      );

      await runTransaction(db, async (transaction) => {
        const [userSnap, settingsSnap, ...candidateSnaps] = await Promise.all([
          transaction.get(userRef),
          transaction.get(settingsRef),
          ...candidateRefs.map((candidateRef) => transaction.get(candidateRef))
        ]);

        if (!userSnap.exists()) {
          throw new Error('VOTER_PROFILE_MISSING');
        }

        const serverActiveCategory = settingsSnap.exists()
          ? settingsSnap.data().activeCategory
          : LOCKED_CATEGORY;

        if (serverActiveCategory !== activeCategory || isLocked) {
          throw new Error('VOTING_PHASE_CHANGED');
        }

        const latestVotedCategories = userSnap.data().votedCategories || [];

        if (latestVotedCategories.includes(activeCategory)) {
          throw new Error('CATEGORY_ALREADY_VOTED');
        }

        if (selections.length > currentCategoryConfig.max) {
          throw new Error('SELECTION_LIMIT_EXCEEDED');
        }

        const candidateNames = candidateSnaps.map((candidateSnap) => {
          if (!candidateSnap.exists()) {
            throw new Error('INVALID_CANDIDATE');
          }

          const candidate = candidateSnap.data();

          if (candidate.category !== activeCategory || candidate.active === false) {
            throw new Error('INVALID_CANDIDATE');
          }

          return candidate.name;
        });

        transaction.update(userRef, {
          [`votes.${activeCategory}`]: selections,
          [`voteDetails.${activeCategory}`]: {
            candidateIds: selections,
            candidateNames,
            category: activeCategory,
            submittedAt: serverTimestamp()
          },
          votedCategories: arrayUnion(activeCategory),
          lastVotedAt: serverTimestamp()
        });
      });
      
      setSelections([]);
      setShowReview(false);
      
    } catch (err) {
      console.error("Failed to transmit vote transaction:", err);
      const messageMap = {
        VOTER_PROFILE_MISSING: 'Your voter profile could not be verified. Please contact the administrator.',
        VOTING_PHASE_CHANGED: 'The voting phase changed before submission. Please review the current ballot and try again.',
        CATEGORY_ALREADY_VOTED: 'You have already voted for this category.',
        SELECTION_LIMIT_EXCEEDED: 'Your selection exceeds the allowed limit for this category.',
        INVALID_CANDIDATE: 'One or more selected candidates are no longer valid for this ballot.'
      };

      setError(messageMap[err.message] || 'Transmission Error: Failed to securely record your vote. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER 1: FULLY COMPLETED FINAL SCREEN ---
  if (hasCompletedAll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 flex flex-col items-center justify-center font-sans">
          <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-lg border border-slate-200 text-center">
              <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Voting Completed</h1>
              <p className="text-slate-600 text-sm leading-relaxed mb-8">
                Thank you. You have successfully completed voting for all organizational committee paths and positions. Your selections are legally logged and secured.
              </p>
              <button 
                onClick={async () => {
                  setLoading(true);
                  try {
                    const userUid = auth.currentUser.uid;
                  await updateDoc(doc(db, "voting", userUid), {
                    hasVoted: true,
                    completedAt: serverTimestamp()
                  });
                    navigate('/dashboard');
                  } catch (err) {
                    console.error("Failed to update final session state:", err);
                    navigate('/dashboard');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Return to Dashboard"}
              </button>
          </div>
      </div>
    );
  }

  // --- RENDER 2: WAITING/LOCKED SCREEN ---
  if (isLocked) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 flex flex-col items-center justify-center font-sans">
            <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-lg border border-slate-200 text-center">
                <Lock className="w-16 h-16 text-blue-600 mx-auto mb-6 animate-pulse" />
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Voting Not Open Yet</h1>
                <p className="text-slate-600 text-sm leading-relaxed">The voting gateway is currently locked or the current phase has concluded. Your screen will automatically sync once opened by the System Administrator.</p>
            </div>
        </div>
      );
  }

  // --- RENDER 3: ALREADY VOTED SCREEN (FOR CURRENT ACTIVE CATEGORY) ---
  if (hasVotedForCurrent) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 flex flex-col items-center justify-center font-sans">
            <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-lg border border-slate-200 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Vote Submitted</h1>
                <p className="text-slate-600 text-sm leading-relaxed">Your submission for the <strong>{currentCategoryConfig?.title}</strong> category has been verified and stored. Please wait for the next phase to open.</p>
            </div>
        </div>
      );
  }

  // --- RENDER 4: BALLOT SCREEN (LIVE VOTING GATEWAY) ---
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 lg:p-8 flex flex-col items-center justify-center font-sans text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.06),transparent_25%)]" />
      <div className="glass-panel relative max-w-2xl w-full rounded-3xl p-10 lg:p-14 border-slate-200/50">
        
        <header className="relative flex flex-col items-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/80 border border-blue-200/50 mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Active Ballot</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight text-center leading-tight mb-3">
            {currentCategoryConfig?.title}
          </h1>
          
          <p className="text-slate-600 text-base font-medium text-center max-w-md mb-6">
            Select up to <span className="font-bold text-blue-600">{currentCategoryConfig?.max}</span> nominee{currentCategoryConfig?.max > 1 ? 's' : ''}
          </p>
          
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-2xl border border-blue-200/50">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <span className="text-lg">{selections.length}</span>
              <span className="text-slate-600">/</span>
              <span className="text-lg text-blue-600">{currentCategoryConfig?.max}</span>
            </div>
            <div className="h-6 w-px bg-slate-300"></div>
            <span className="text-sm text-slate-600 font-medium">Selected</span>
          </div>
        </header>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-300/50 bg-red-50/80 p-5 text-red-700 flex items-start gap-4">
            <AlertCircle size={22} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Unable to process</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-3 mb-10">
          {currentCandidates.length > 0 ? (
            currentCandidates.map((c) => {
              const isSelected = selections.includes(c.id);
              return (
                <div 
                  key={c.id}
                  onClick={() => toggleSelection(c.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      toggleSelection(c.id);
                    }
                  }}
                  role="checkbox"
                  tabIndex={0}
                  aria-checked={isSelected}
                  className={`group relative p-6 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer flex items-start gap-4 active:scale-[0.98] ${
                    isSelected 
                    ? 'border-blue-400 bg-blue-50 shadow-lg shadow-blue-500/15 text-slate-900' 
                    : 'border-slate-300 bg-white hover:border-blue-400 shadow-sm text-slate-700'
                  }`}
                >
                  <div className="flex-1">
                    <h3 className={`font-black text-xl transition-colors ${isSelected ? 'text-blue-600' : 'text-slate-800'}`}>
                      {c.name}
                    </h3>
                  </div>
                  
                  <div className={`shrink-0 mt-1 transition-all ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                    {isSelected ? <CheckSquare size={24} /> : <Square size={24} />}
                  </div>
                </div>
              );
            })
          ) : (
              <div className="text-center p-12 bg-slate-100 border-2 border-dashed border-slate-300 rounded-[2rem] shadow-sm">
              <Loader2 className="animate-spin text-blue-600 mx-auto mb-3" size={24} />
              <p className="text-slate-700 font-medium text-sm">Loading candidates...</p>
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-col items-center pb-10">
          <button 
            onClick={handleSubmitVote}
            disabled={selections.length === 0 || loading || currentCandidates.length === 0}
            className={`w-full rounded-3xl px-6 py-5 font-black text-xl flex items-center justify-center gap-3 transition-all duration-300 ${
              selections.length > 0 && currentCandidates.length > 0
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25 hover:-translate-y-0.5' 
              : 'bg-slate-300 text-slate-600 cursor-not-allowed shadow-none'
            }`}
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={22} /> Processing Submission...</>
            ) : (
              <><CheckCircle size={22} /> Submit {currentCategoryConfig?.title} Ballot</>
            )}
          </button>
        </div>
      </div>

      {showReview && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-4">
          <div
            className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl border border-slate-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-vote-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <ShieldCheck size={22} />
                </div>
                <h2 id="review-vote-title" className="text-xl font-black text-slate-900">
                  Review your ballot
                </h2>
                <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">
                  Confirm your selection for {currentCategoryConfig?.title}. This action cannot be changed after submission.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowReview(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close review dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 space-y-2">
              {selectedCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 font-bold text-slate-800"
                >
                  {candidate.name}
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowReview(false)}
                disabled={loading}
                className="rounded-2xl border border-slate-300 px-4 py-3 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Back
              </button>

              <button
                type="button"
                onClick={confirmSubmitVote}
                disabled={loading}
                className="rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingPage;
