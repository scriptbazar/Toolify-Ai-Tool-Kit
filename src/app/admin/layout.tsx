
'use client';

// This is now a simplified root layout for /admin routes
// Authentication logic is handled in the (dashboard) group layout
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
