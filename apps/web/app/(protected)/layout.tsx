import { DashboardHeader } from "@/features/dashboard/components/header";
import { DashboardSidebar } from "@/features/dashboard/components/sidebar";
import React from "react";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <div className="flex h-screen bg-background w-full">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 w-full min-h-full flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
