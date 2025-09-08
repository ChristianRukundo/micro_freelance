"use client";

import { useQuery } from "@tanstack/react-query";
import * as actions from "@/lib/actions";
import { ClientDashboardStats, FreelancerDashboardStats } from "@/lib/types";
import { useAuthStore } from "@/lib/zustand";
import { UserRole } from "@/lib/types";

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
      const response = await actions.getClientDashboardStatsAction();
      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Failed to fetch client dashboard stats."
        );
      }
      return response.data;
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
      const response = await actions.getFreelancerDashboardStatsAction();
      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Failed to fetch freelancer dashboard stats."
        );
      }
      return response.data;
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
