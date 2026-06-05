import React, { useEffect, useState } from 'react';
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

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
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
            'voting',
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
        }
      }
    );

    return () => unsubscribe();
  }, [navigate]);

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2
          className="animate-spin text-blue-600"
          size={40}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="P2SA Logo"
            className="h-20 mx-auto mb-4 object-contain"
          />

          <h1 className="text-3xl font-black text-slate-900">
            P2SA Election Portal
          </h1>

          <p className="text-slate-500 mt-2">
            AGM Election 2026
          </p>
        </div>

        {/* User Information */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-5">

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <User size={22} />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                Member Name
              </p>

              <p className="font-bold text-slate-900 text-lg">
                {userData?.fullName || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t pt-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <Building2 size={22} />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                Company
              </p>

              <p className="font-medium text-slate-700">
                {userData?.company || 'N/A'}
              </p>
            </div>
          </div>

          {/* Voting Status */}
          <div
            className={`rounded-xl p-4 flex items-center gap-3 font-bold ${
              userData?.hasVoted
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {userData?.hasVoted ? (
              <>
                <CheckCircle2 size={20} />
                <span>
                  Vote Submitted Successfully
                </span>
              </>
            ) : (
              <>
                <AlertCircle size={20} />
                <span>
                  You Have Not Voted Yet
                </span>
              </>
            )}
          </div>

        </div>

        {/* Vote Button */}
        <div className="mt-8">
          <button
            onClick={() => navigate('/vote')}
            disabled={userData?.hasVoted}
            className={`w-full py-6 rounded-3xl font-bold text-lg transition-all ${
              userData?.hasVoted
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {userData?.hasVoted
              ? 'Voting Completed'
              : 'Vote Now'}
          </button>
        </div>

        {/* Logout */}
        <div className="mt-4">
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl border border-red-200 text-red-600 font-bold hover:bg-red-50 flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;