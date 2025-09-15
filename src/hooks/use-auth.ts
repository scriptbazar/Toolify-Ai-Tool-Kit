
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AppUser {
  firstName: string;
  lastName: string;
  email: string;
  planId?: string;
  role?: 'user' | 'admin';
}

interface CombinedUser extends FirebaseUser {
    planId?: string;
    role?: 'user' | 'admin';
}

export function useAuth() {
  const [user, setUser] = useState<CombinedUser | null>(null);
  const [userData, setUserData] = useState<AppUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const data = userDocSnap.data() as AppUser;
          setUserData(data);
          setIsAdmin(data.role === 'admin');
          // Combine Firebase user with Firestore data
          const combinedUser: CombinedUser = Object.assign(firebaseUser, {
              planId: data.planId,
              role: data.role,
          });
          setUser(combinedUser);
        } else {
            // Case where auth user exists but no firestore doc
             setUser(firebaseUser as CombinedUser);
        }

      } else {
        setUser(null);
        setUserData(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, userData, isAdmin, loading };
}
