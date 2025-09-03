"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  type User,
} from "@/lib/api/auth";
import { useToast } from "@/hooks/use-toast";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import type { ApiError } from "@/lib/api/api-utils";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: "USER" | "AGENT"
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function AuthProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { refetch: refetchUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const response = await getCurrentUser();
        return response.data.user;
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        return null;
      }
    },
    enabled: false,
  });

  const refreshUser = async () => {
    try {
      const userData = await refetchUser();
      if (userData.data) {
        setUser(userData.data);
      }
    } catch (error) {
      setUser(null);
      console.error("Failed to refresh user:", error);
    }
  };

  const loginMutation = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      apiLogin(credentials.email, credentials.password),
    onSuccess: (data) => {
      const { user, accessToken, refreshToken } = data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      setUser(user);

      toast({
        title: "Success",
        description: "You have successfully logged in.",
      });

      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: (error: ApiError) => {
      console.error("Login error:", error);

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (userData: {
      name: string;
      email: string;
      password: string;
      role: "USER" | "AGENT";
    }) =>
      apiRegister(
        userData.name,
        userData.email,
        userData.password,
        userData.role
      ),
    onSuccess: (data) => {
      const { user, accessToken, refreshToken } = data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      setUser(user);

      toast({
        title: "Account Created",
        description: "Your account has been successfully created.",
      });

      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: (error: ApiError) => {
      console.error("Registration error:", error);

      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token found");
      }
      return apiLogout(refreshToken);
    },
    onSuccess: () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });

      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      router.push("/auth/login");
    },
    onError: (error: ApiError) => {
      console.error("Logout error:", error);

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);

      toast({
        title: "Logout Failed",
        description:
          "There was an issue logging out, but you've been logged out locally.",
      });

      router.push("/auth/login");
    },
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await refetchUser();
        if (userData.data) {
          setUser(userData.data);
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await loginMutation.mutateAsync({ email, password });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: "USER" | "AGENT"
  ) => {
    setIsLoading(true);
    try {
      await registerMutation.mutateAsync({ name, email, password, role });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutMutation.mutateAsync();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading:
          isLoading ||
          loginMutation.isPending ||
          registerMutation.isPending ||
          logoutMutation.isPending,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
