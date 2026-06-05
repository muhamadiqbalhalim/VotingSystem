import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';

import {
  PlusCircle,
  Trash2
} from 'lucide-react';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('president');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'candidates'),
      orderBy('category', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = [];

        snapshot.forEach((doc) => {
          data.push({
            id: doc.id,
            ...doc.data()
          });
        });

        setCandidates(data);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    try {
      await addDoc(
        collection(db, 'candidates'),
        {
          name: name.trim(),
          category
        }
      );

      setName('');
    } catch (error) {
      console.error(error);
      alert('Failed to add candidate.');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Delete this candidate?'
    );

    if (!confirmed) return;

    try {
      await deleteDoc(
        doc(db, 'candidates', id)
      );
    } catch (error) {
      console.error(error);
      alert('Failed to delete candidate.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">

      <div>
        <h1 className="text-3xl font-black text-slate-900">
          Candidate Management
        </h1>

        <p className="text-slate-500 mt-1">
          Add and manage election candidates.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6">

        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-4"
        >

          <input
            type="text"
            placeholder="Candidate Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="flex-1 px-4 py-3 border rounded-xl"
            required
          />

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            className="px-4 py-3 border rounded-xl bg-white"
          >
            <option value="president">
              President
            </option>

            <option value="deputy">
              Deputy President
            </option>

            <option value="vice">
              Vice President
            </option>

            <option value="secretary">
              Secretary
            </option>

            <option value="treasurer">
              Treasurer
            </option>

            <option value="exco">
              Exco
            </option>
          </select>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
          >
            <PlusCircle size={18} />
            Add Candidate
          </button>

        </form>

      </div>

      <div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="font-black text-slate-900">
            Candidate List
          </h2>

          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
            {candidates.length} Candidates
          </span>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl border p-10 text-center">
            Loading...
          </div>
        ) : candidates.length === 0 ? (
          <div className="bg-white rounded-3xl border p-10 text-center text-slate-500">
            No candidates found.
          </div>
        ) : (
          <div className="space-y-3">

            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="bg-white border rounded-2xl p-5 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold text-lg text-slate-900">
                    {candidate.name}
                  </h3>

                  <p className="text-sm text-slate-500 capitalize">
                    {candidate.category}
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleDelete(candidate.id)
                  }
                  className="text-red-600 hover:bg-red-50 p-2 rounded-xl"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
};

export default Candidates;