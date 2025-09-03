"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles = [],
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page",
        variant: "destructive",
      });

      router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }

    if (!isLoading && isAuthenticated && allowedRoles.length > 0) {
      if (!user || !allowedRoles.includes(user.role)) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page",
          variant: "destructive",
        });
        router.push("/");
      }
    }
  }, [isLoading, toast ,isAuthenticated, user, router, pathname, allowedRoles]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
