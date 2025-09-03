"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { AgentDashboard } from "@/components/agent/dashboard";
import { DashboardLayout } from "@/components/dashboard-layout";


export default function AgentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300); 
    return () => clearTimeout(timer);
  }, []);

  
  useEffect(() => {
    if (!user) {
      router.push("/login"); 
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout requireAgent>
      <AgentDashboard />
    </DashboardLayout>
  );
}
