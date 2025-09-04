"use client";

import React from "react";
import { useAuthStore } from "@/lib/zustand";
import { useRouter, usePathname } from "next/navigation";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import api from "@/lib/api";
import { UserRole } from "@/lib/types";

interface AuthProviderProps {
  children: React.ReactNode;
}

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/tasks",
  "/tasks/[id]",
  "/freelancers",
];

export function AuthProvider({ children }: AuthProviderProps) {
  const {
    user,
    isAuthenticated,
    isLoading,
    startLoading,
    stopLoading,
    login,
    logout,
  } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = publicRoutes.some((route) => {
    if (route.includes("[id]")) {
      const regex = new RegExp(`^${route.replace(/\[id\]/, "[^/]+")}$`);
      return regex.test(pathname);
    }
    return pathname === route;
  });

  React.useEffect(() => {
    const checkAuthStatus = async () => {
      startLoading();
      try {
        const response = await api.post("/auth/refresh-token");
        if (response.data.success && response.data.data.user) {
          login(response.data.data.user);
        } else {
          logout();
        }
      } catch (error) {
        logout();
      } finally {
        stopLoading();
      }
    };

    if (!user && !isAuthenticated) {
      checkAuthStatus();
    } else {
      stopLoading();
    }
  }, [user, isAuthenticated, login, logout, startLoading, stopLoading]);

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isPublicRoute) {
        router.push("/login");
      } else if (
        isAuthenticated &&
        (pathname === "/login" || pathname === "/register")
      ) {
        switch (user?.role) {
          case UserRole.CLIENT:
            router.push("/dashboard/client");
            break;
          case UserRole.FREELANCER:
            router.push("/dashboard/freelancer");
            break;
          case UserRole.ADMIN:
            router.push("/admin/users");
            break;
          default:
            router.push("/dashboard");
            break;
        }
      }
    }
  }, [isLoading, isAuthenticated, isPublicRoute, pathname, router, user?.role]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
