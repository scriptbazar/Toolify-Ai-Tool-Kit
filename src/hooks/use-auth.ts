

'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

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
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Use onSnapshot for real-time updates to user data (like favorites)
        const unsubscribeFirestore = onSnapshot(userDocRef, (userDocSnap) => {
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
              // Case where auth user exists but no firestore doc
              setUser(firebaseUser as CombinedUser);
          }
           setLoading(false); // Set loading to false once data is fetched
        }, (error) => {
          console.error("Firestore snapshot error:", error);
          setLoading(false);
        });

        // Return the firestore unsubscribe function to be called on cleanup
        return () => unsubscribeFirestore();

      } else {
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
