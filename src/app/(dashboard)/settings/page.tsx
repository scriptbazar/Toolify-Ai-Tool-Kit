
import { redirect } from 'next/navigation';

export default function SettingsRedirect() {
    // Redirecting to the root settings page to avoid parallel route conflict
    redirect('/settings');
}
