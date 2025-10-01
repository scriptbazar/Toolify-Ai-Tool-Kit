
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
  favorites?: string[];
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
        try {
            const token = await firebaseUser.getIdToken();
            // Call the new API route to set the session cookie
            await fetch('/api/auth/session-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            const userDocRef = doc(db, "users", firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const data = userDocSnap.data() as AppUser;
                setUserData(data);
                setIsAdmin(data.role === 'admin');
                setUser({ ...firebaseUser, ...data } as CombinedUser);
            } else {
                // Handle case where user exists in Auth but not Firestore
                setUser(firebaseUser as CombinedUser);
            }
        } catch (error) {
            console.error("Auth hook error:", error);
            setUser(null);
            setUserData(null);
            setIsAdmin(false);
        } finally {
            setLoading(false);
        }
      } else {
        // User is signed out
        await fetch('/api/auth/session-logout', { method: 'POST' });
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
