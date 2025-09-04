import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { UserRole, UserProfile } from './types'; // Assuming types.ts defines UserRole

export interface UserState {
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
  // Add role-based getters
  isClient: boolean;
  isFreelancer: boolean;
  isAdmin: boolean;
  login: (user: UserState) => void;
  logout: () => void;
  setUser: (user: UserState) => void; // For updating profile
  startLoading: () => void;
  stopLoading: () => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        // Computed properties for role checks
        get isClient() {
          return get().user?.role === UserRole.CLIENT;
        },
        get isFreelancer() {
          return get().user?.role === UserRole.FREELANCER;
        },
        get isAdmin() {
          return get().user?.role === UserRole.ADMIN;
        },
        login: (user) => set({ user, isAuthenticated: true, isLoading: false }),
        logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
        setUser: (user) => set((state) => ({ ...state, user: { ...state.user, ...user } })), // Merge updates
        startLoading: () => set({ isLoading: true }),
        stopLoading: () => set({ isLoading: false }),
      }),
      {
        name: 'auth-storage',
        storage: typeof window !== 'undefined' ? localStorage : undefined as any,
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
