
// This file is being moved to the root to resolve a duplicate route conflict.
// Please use src/app/settings/page.tsx instead.
import { redirect } from 'next/navigation';

export default function SettingsRedirect() {
    redirect('/settings');
}
