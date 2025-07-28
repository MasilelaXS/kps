import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PcoUser } from '../services/pcoService';

interface PcoAuthState {
  pcoUser: PcoUser | null;
  isAuthenticated: boolean;
  
  // Actions
  setPcoUser: (user: PcoUser) => void;
  clearPcoUser: () => void;
}

export const usePcoAuthStore = create<PcoAuthState>()(
  persist(
    (set) => ({
      pcoUser: null,
      isAuthenticated: false,
      
      setPcoUser: (user: PcoUser) => {
        console.log('Setting PCO user in store:', user);
        set({ 
          pcoUser: user, 
          isAuthenticated: true 
        });
        console.log('PCO user set, new state should be:', { pcoUser: user, isAuthenticated: true });
      },
      
      clearPcoUser: () => {
        console.log('Clearing PCO user from store');
        set({ 
          pcoUser: null, 
          isAuthenticated: false 
        });
      },
    }),
    {
      name: 'pco-auth-storage',
    }
  )
);
