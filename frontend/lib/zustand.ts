import { create } from "zustand";
import {
  persist,
  devtools,
  PersistStorage,
  StorageValue,
} from "zustand/middleware";
import { UserRole } from "./types";

export interface ProfileState {
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
}

export interface UserState {
  id: string | null;
  email: string | null;
  role: UserRole | null;
  profile?: ProfileState | null; 
  stripeAccountId?: string | null;
  stripeAccountCompleted?: boolean;
}
interface AuthStore {
  user: UserState | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: UserState) => void;
  logout: () => void;
  setUser: (user: UserState) => void;
  startLoading: () => void;
  stopLoading: () => void;
}

const storage: PersistStorage<AuthStore> = {
  getItem: (name) => {
    if (typeof window === "undefined") {
      return null;
    }
    const str = localStorage.getItem(name);
    if (!str) {
      return null;
    }
    return JSON.parse(str);
  },
  setItem: (name, value) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(name, JSON.stringify(value));
    }
  },
  removeItem: (name) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(name);
    }
  },
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: true,
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
        storage: storage,
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
    (set) => ({
      isSidebarOpen: false,
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
    }),
    { name: "UIStore" }
  )
);
