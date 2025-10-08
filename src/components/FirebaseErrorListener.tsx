'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error("Caught Firestore Permission Error:", error.message);
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: `Your request was denied by security rules. Check the console for details. Path: ${error.context.path}`,
        duration: 10000,
      });

      // In a dev environment, you might throw this to let Next.js overlay handle it.
      // Be careful with this in production.
      if (process.env.NODE_ENV === 'development') {
        // We throw it in a timeout to break out of the event emitter's call stack
        setTimeout(() => {
          throw error;
        }, 0);
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}
