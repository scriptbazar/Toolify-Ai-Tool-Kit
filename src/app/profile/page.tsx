
'use client';

// This is a proxy component to reuse the admin profile page for regular users.
// No UI is rendered here directly.

import AdminProfilePage from '@/app/admin/profile/page';

export default function UserProfilePage() {
  return <AdminProfilePage />;
}
