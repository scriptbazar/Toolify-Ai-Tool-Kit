
import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import serviceAccount from '../firebase-service-account-key.json';

if (!getApps().find(app => app?.name === 'admin-auth')) {
  initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
  }, 'admin-auth');
}

export const adminAuth = getAuth(getApps().find(app => app?.name === 'admin-auth'));
