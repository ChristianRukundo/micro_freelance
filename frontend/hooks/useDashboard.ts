import { useQuery } from "@tanstack/react-query";
import { ClientDashboardStats, FreelancerDashboardStats } from "@/lib/types";
import { useAuthStore } from "@/lib/zustand";
import { UserRole } from "@/lib/types";
import api from "@/lib/api";

/**
 * Custom hook to fetch and manage dashboard statistics based on user role.
 */
export function useDashboardStats() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  const {
    data: clientStats,
    isLoading: isLoadingClientStats,
    isError: isErrorClientStats,
    error: errorClientStats,
  } = useQuery<ClientDashboardStats, Error>({
    queryKey: ["clientDashboardStats", user?.id],
    queryFn: async (): Promise<ClientDashboardStats> => {
      if (!user?.id) throw new Error("User not authenticated.");
      const response = await api.get("/users/dashboard/client-stats");
      return response.data.data;
    },
    enabled:
      isAuthenticated && !isAuthLoading && user?.role === UserRole.CLIENT,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const {
    data: freelancerStats,
    isLoading: isLoadingFreelancerStats,
    isError: isErrorFreelancerStats,
    error: errorFreelancerStats,
  } = useQuery<FreelancerDashboardStats, Error>({
    queryKey: ["freelancerDashboardStats", user?.id],
    queryFn: async (): Promise<FreelancerDashboardStats> => {
      if (!user?.id) throw new Error("User not authenticated.");
      const response = await api.get("/users/dashboard/freelancer-stats");
      return response.data.data;
    },
    enabled:
      isAuthenticated && !isAuthLoading && user?.role === UserRole.FREELANCER,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return {
    clientStats,
    isLoadingClientStats,
    isErrorClientStats,
    errorClientStats,
    freelancerStats,
    isLoadingFreelancerStats,
    isErrorFreelancerStats,
    errorFreelancerStats,
  };
}
