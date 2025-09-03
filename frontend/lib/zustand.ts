import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { UserRole, UserProfile } from './types'; // Assuming types.ts defines UserRole

interface UserState {
  id: string | null;
  email: string | null;
  role: UserRole | null;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  stripeAccountId?: string | null;
  stripeAccountCompleted?: boolean;
  profile?: UserProfile; // Include full profile
}

interface AuthStore {
  user: UserState | null;
  isAuthenticated: boolean;
  isLoading: boolean; // For initial auth check
  login: (user: UserState) => void;
  logout: () => void;
  setUser: (user: UserState) => void; // For updating profile
  startLoading: () => void;
  stopLoading: () => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        login: (user) => set({ user, isAuthenticated: true, isLoading: false }),
        logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
        setUser: (user) => set((state) => ({ ...state, user: { ...state.user, ...user } })), // Merge updates
        startLoading: () => set({ isLoading: true }),
        stopLoading: () => set({ isLoading: false }),
      }),
      {
        name: 'auth-storage', // unique name for local storage
        getStorage: () => localStorage, // default is localStorage
      },
    ),
    { name: 'AuthStore' },
  ),
);

interface UIStore {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      isSidebarOpen: false,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    }),
    { name: 'UIStore' },
  ),
);