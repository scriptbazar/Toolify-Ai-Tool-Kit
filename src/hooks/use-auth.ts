
'use client';

import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

// This custom hook now simply consumes the context
export const useAuth = () => {
  return useContext(AuthContext);
};
