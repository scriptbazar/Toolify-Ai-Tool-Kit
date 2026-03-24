'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { DocumentData } from 'firebase/firestore';

interface AppUser extends DocumentData {
  firstName: string;
  lastName: string;
  email: string;
  planId?: string;
  role?: 'user' | 'admin';
  favorites?: string[];
}

interface AuthContextType {
  user: FirebaseUser | null;
  userData: AppUser | null;
  isAdmin: boolean;
  loading: boolean;
  syncSession: (forceUser?: FirebaseUser) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  isAdmin: false,
  loading: true,
  syncSession: async () => false,
});

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setLocalUserData] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncSession = useCallback(async (forceUser?: FirebaseUser) => {
    const currentUser = forceUser || auth.currentUser;
    if (currentUser) {
      try {
        const token = await currentUser.getIdToken(true);
        const res = await fetch('/api/auth/session-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        return res.ok;
      } catch (e) {
        console.error("AuthContext: Session sync error", e);
        return false;
      }
    }
    return false;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
            const userDocRef = doc(db, "users", firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                setLocalUserData(userDocSnap.data() as AppUser);
            } else {
                setLocalUserData(null);
            }
        } catch (error) {
            console.error("AuthContext: Firestore fetch error:", error);
            setLocalUserData(null);
        }
      } else {
        setUser(null);
        setLocalUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const isAdmin = userData?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, userData, isAdmin, loading, syncSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
