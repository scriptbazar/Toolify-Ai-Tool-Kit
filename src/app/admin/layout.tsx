
import { AdminLayoutClient } from '@/app/admin/_components/AdminLayoutClient';
import { getAdminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import type { User as FirebaseUser } from 'firebase/auth';

// This is now a simplified root layout for /admin routes
// Authentication logic is moved to the (dashboard) group layout
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  // This layout doesn't need to be a client component anymore.
  // We pass null for user/userData because the authentication check
  // will happen in a deeper, more specific layout.
  // The AdminLayoutClient component will handle showing a login
  // state if it receives null user.
  return (
      <AdminLayoutClient user={null} userData={null}>
        {children}
      </AdminLayoutClient>
  );
}
