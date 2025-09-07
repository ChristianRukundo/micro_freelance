"use client";

import { Sidebar } from "@/components/layouts/Sidebar";
import { Header } from "@/components/layouts/Header";
import { useUIStore } from "@/lib/zustand";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarOpen } = useUIStore();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main
          className={cn(
            "flex-1 overflow-y-auto p-6 transition-all duration-300 ease-in-out",

          // {
            //   "md:ml-72": isSidebarOpen,
            //   "md:ml-18": !isSidebarOpen,
            // }
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
