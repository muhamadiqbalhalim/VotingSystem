import React, { useEffect, useState } from 'react';
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

const VotingControl = () => {
  const [activeCategory, setActiveCategory] =
    useState('locked');

  const [loading, setLoading] =
    useState(false);

  const categories = [
    {
      id: 'president',
      title: 'President'
    },
    {
      id: 'deputy',
      title: 'Deputy President'
    },
    {
      id: 'vice',
      title: 'Vice President'
    },
    {
      id: 'secretary',
      title: 'Secretary'
    },
    {
      id: 'treasurer',
      title: 'Treasurer'
    },
    {
      id: 'exco',
      title: 'Exco'
    }
  ];

  const getCategoryLabel = (category) => {
  const item = categories.find(
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
              'locked'
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
      category === 'locked'
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
          activeCategory: category
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
    <div className="max-w-5xl mx-auto p-6 space-y-8">

      <div>
        <h1 className="text-3xl font-black text-slate-900">
         Election Control Panel
        </h1>

        <p className="text-slate-500 mt-1">
          Manage the active voting stage 
          for all members.
        </p>
      </div>

      <div className="bg-white border rounded-3xl p-6">

        <div className="bg-slate-900 text-white rounded-2xl p-6">

          <p className="text-sm text-slate-300">
            Current Voting Status
          </p>

        <h2 className="text-2xl font-black mt-2">
          {activeCategory === 'locked'
            ? 'All Voting Closed'
            : `Voting Open: ${getCategoryLabel(activeCategory)}`}
        </h2>

        </div>

        <div className="mt-6">

          <button
            onClick={() =>
              handleSwitch(
                'locked'
              )
            }
            disabled={
              loading ||
              activeCategory ===
                'locked'
            }
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 ${
              activeCategory ===
              'locked'
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            <Lock size={18} />
            Close All Voting
          </button>

        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-6">

          {categories.map(
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
                    ? 'bg-blue-50 border-blue-600 text-blue-700'
                    : 'bg-white border-slate-200 hover:border-blue-300'
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
          className="text-amber-600 shrink-0"
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