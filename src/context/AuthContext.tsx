
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
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
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  isAdmin: false,
  loading: true,
});

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
            const userDocRef = doc(db, "users", firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const data = userDocSnap.data() as AppUser;
                setUserData(data);
                setUser(firebaseUser);
            } else {
                // This can happen briefly during user creation
                setUser(firebaseUser);
                setUserData(null);
            }
        } catch (error) {
            console.error("Auth context error:", error);
            // Reset to a clean state on error
            setUser(null);
            setUserData(null);
        } finally {
            setLoading(false);
        }
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);
  
  const isAdmin = userData?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, userData, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
