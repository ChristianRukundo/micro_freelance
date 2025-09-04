import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { UserRole, UserProfile } from "./types";

export interface UserState {
  id: string | null;
  email: string | null;
  role: UserRole | null;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  stripeAccountId?: string | null;
  stripeAccountCompleted?: boolean;
  profile?: UserProfile;
}

interface AuthStore {
  user: UserState | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  isClient: boolean;
  isFreelancer: boolean;
  isAdmin: boolean;
  login: (user: UserState) => void;
  logout: () => void;
  setUser: (user: UserState) => void;
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
        logout: () =>
          set({ user: null, isAuthenticated: false, isLoading: false }),
        setUser: (user) =>
          set((state) => ({ ...state, user: { ...state.user, ...user } })),
        startLoading: () => set({ isLoading: true }),
        stopLoading: () => set({ isLoading: false }),
      }),
      {
        name: "auth-storage",
        storage:
          typeof window !== "undefined" ? localStorage : (undefined as any),
      }
    ),
    { name: "AuthStore" }
  )
);

interface UIStore {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        isSidebarOpen: true,
        toggleSidebar: () =>
          set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
        setSidebarOpen: (isOpen: boolean) => set({ isSidebarOpen: isOpen }),
      }),
      {
        name: "ui-sidebar-storage",
        storage:
          typeof window !== "undefined" ? localStorage : (undefined as any),
      }
    ),
    { name: "UIStore" }
  )
);
