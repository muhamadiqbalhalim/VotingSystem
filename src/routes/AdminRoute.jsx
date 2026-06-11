import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { auth, db } from '../firebase/config';

import { doc, getDoc } from 'firebase/firestore';

export default function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(
          doc(db, 'voting', user.uid)
        );

        if (
          userDoc.exists() &&
          userDoc.data().role === 'admin'
        ) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error(error);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!auth.currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
