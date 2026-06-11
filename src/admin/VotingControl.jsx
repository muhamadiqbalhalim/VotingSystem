import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import {
  doc,
  setDoc,
  onSnapshot
} from 'firebase/firestore';

import {
  Lock,
  AlertTriangle
} from 'lucide-react';
import { CATEGORY_LIST, LOCKED_CATEGORY } from '../lib/electionConfig';

const VotingControl = () => {
  const [activeCategory, setActiveCategory] =
    useState(LOCKED_CATEGORY);

  const [loading, setLoading] =
    useState(false);

  const getCategoryLabel = (category) => {
  const item = CATEGORY_LIST.find(
    (c) => c.id === category
  );

  return item ? item.title : category;
};

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'election'),
      (snapshot) => {
        if (snapshot.exists()) {
          setActiveCategory(
            snapshot.data().activeCategory ||
              LOCKED_CATEGORY
          );
        }
      },
      (error) => {
        console.error(error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSwitch = async (
    category
  ) => {
    const confirmMessage =
      category === LOCKED_CATEGORY
        ? 'Lock all voting sessions?'
        : `Open voting for ${category.toUpperCase()}?`;

    const confirmed =
      window.confirm(confirmMessage);

    if (!confirmed) return;

    setLoading(true);

    try {
      await setDoc(
        doc(
          db,
          'settings',
          'election'
        ),
        {
          activeCategory: category,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (error) {
      console.error(error);
      alert(
        'Failed to update voting status.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 text-slate-900">

      <div>
        <h1 className="text-3xl font-black text-slate-900">
         Election Control Panel
        </h1>

        <p className="text-slate-600 mt-1">
          Manage the active voting stage for your organization.
        </p>
      </div>

      <div className="glass-panel-soft rounded-[2rem] p-6 border-slate-200">

        <div className="bg-blue-50 text-slate-900 rounded-[2rem] p-6 border border-blue-200">

          <p className="text-sm text-slate-600">
            Current Voting Status
          </p>

        <h2 className="text-2xl font-black mt-2 text-slate-900">
          {activeCategory === LOCKED_CATEGORY
            ? 'All Voting Closed'
            : `Voting Open: ${getCategoryLabel(activeCategory)}`}
        </h2>

        </div>

        <div className="mt-6">

          <button
            onClick={() =>
              handleSwitch(
                LOCKED_CATEGORY
              )
            }
            disabled={
              loading ||
              activeCategory ===
                LOCKED_CATEGORY
            }
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 ${
              activeCategory ===
              LOCKED_CATEGORY
                ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            <Lock size={18} />
            Close All Voting
          </button>

        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-6">

          {CATEGORY_LIST.map(
            (category) => (
              <button
                key={
                  category.id
                }
                onClick={() =>
                  handleSwitch(
                    category.id
                  )
                }
                disabled={
                  loading
                }
                className={`p-4 rounded-xl border font-bold transition-all ${
                  activeCategory ===
                  category.id
                    ? 'bg-blue-100 border-blue-600 text-blue-700'
                    : 'bg-white border-slate-300 hover:border-blue-400'
                }`}
              >
                Open Voting:
                <br />
                {
                  category.title
                }
              </button>
            )
          )}

        </div>

      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3">

        <AlertTriangle
          size={22}
          className="text-amber-700 shrink-0"
        />

        <div className="text-sm text-amber-800">
          Any changes made here
          will immediately affect
          all voters currently using
          the system.
        </div>

      </div>

    </div>
  );
};

export default VotingControl;
