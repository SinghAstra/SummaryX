import { DashboardSidebar } from "@/features/dashboard/components/sidebar";
import React from "react";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <div className="flex h-screen bg-background w-full">
      <DashboardSidebar />

      {children}
    </div>
  );
}
