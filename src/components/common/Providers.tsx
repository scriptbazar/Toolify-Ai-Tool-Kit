'use client';

import { ThemeProvider } from '@/components/common/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { AuthContextProvider } from '@/context/AuthContext';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthContextProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster />
        <FirebaseErrorListener />
      </ThemeProvider>
    </AuthContextProvider>
  );
}