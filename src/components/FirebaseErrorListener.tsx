'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * A hidden component that listens for Firebase permission errors and displays a toast.
 * It also logs the error to the console for debugging during development.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error('Firebase Permission Error Detected:', error.message, error.context);
      
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: 'You do not have permission to perform this action. Please check your account status.',
      });

      // In development, we want to throw the error to trigger the Next.js error overlay
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}