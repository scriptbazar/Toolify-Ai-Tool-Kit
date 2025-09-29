

'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import nookies from 'nookies';

interface AppUser {
  firstName: string;
  lastName: string;
  email: string;
  planId?: string;
  role?: 'user' | 'admin';
  favorites?: string[];
}

// Ensure planId and role are part of the CombinedUser type
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
        const token = await firebaseUser.getIdToken();
        nookies.set(undefined, 'session', token, { path: '/' });
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const data = userDocSnap.data() as AppUser;
                setUserData(data);
                const userIsAdmin = data.role === 'admin';
                setIsAdmin(userIsAdmin);
                
                const combinedUser: CombinedUser = {
                    ...firebaseUser,
                    planId: data.planId,
                    role: data.role,
                };
                setUser(combinedUser);
            } else {
                 setUser(firebaseUser as CombinedUser);
            }
        } catch(error) {
            console.error("Auth hook error fetching user data:", error);
            setUser(firebaseUser as CombinedUser); // Still set auth user on firestore error
        } finally {
            setLoading(false);
        }
      } else {
        nookies.destroy(undefined, 'session', { path: '/' });
        setUser(null);
        setUserData(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, userData, isAdmin, loading };
}
