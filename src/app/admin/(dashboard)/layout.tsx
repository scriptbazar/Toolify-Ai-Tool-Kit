
'use client';

// This file is no longer needed as the layout logic is handled by `src/app/admin/layout.tsx`
// and `src/components/admin/AdminLayoutClient.tsx`.
// The parent layout will handle auth checks and render the main structure.
export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
