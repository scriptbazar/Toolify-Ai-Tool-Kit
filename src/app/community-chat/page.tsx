
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function CommunityChatRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
                    router.replace('/admin/community-chat');
                } else {
                    // For regular users, you might create a separate chat page later
                    // For now, redirect them to their dashboard
                    router.replace('/dashboard');
                }
            } else {
                router.replace('/login');
            }
        });

        return () => unsubscribe();
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <p>Redirecting to Community Chat...</p>
        </div>
    );
}
