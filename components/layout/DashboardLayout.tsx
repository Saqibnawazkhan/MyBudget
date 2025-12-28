"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Sidebar from "./Sidebar";
import ModeRedirect from "./ModeRedirect";
import ModeSwitcher from "./ModeSwitcher";
import { FloatingActionButton } from "@/components/ui";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <ModeRedirect />
      <Sidebar />

      {/* Top Header with Mode Switcher */}
      <div className="fixed top-0 left-0 right-0 lg:left-64 z-30 bg-background border-b border-border">
        <div className="flex items-center justify-center py-3 px-4">
          <ModeSwitcher />
        </div>
      </div>

      <main className="lg:ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-16 pb-24 lg:pb-8">
          {children}
        </div>
      </main>
      <FloatingActionButton />
    </div>
  );
}
