import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  isLoading: boolean;
  isOnboarded: boolean;
  setSession: (session: Session | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsOnboarded: (isOnboarded: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: true,
  isOnboarded: false,
  setSession: (session) => set({ session }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsOnboarded: (isOnboarded) => set({ isOnboarded }),
}));
