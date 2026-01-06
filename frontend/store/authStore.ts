import { create } from 'zustand';
import { AppUser } from '../types';

interface AuthState {
    user: AppUser | null;
    isAuthenticated: boolean;
    isInitialized: boolean;
    setUser: (user: AppUser | null) => void;
    setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isInitialized: false,
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setInitialized: (isInitialized) => set({ isInitialized }),
}));
