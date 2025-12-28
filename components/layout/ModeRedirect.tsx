"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function ModeRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    // Skip if still loading or not authenticated
    if (isLoading || !user) return;

    // Skip if already on welcome page
    if (pathname === "/welcome") return;

    // Skip if on settings (allow access to change mode)
    if (pathname === "/settings") return;

    // If user hasn't selected a mode, redirect to welcome
    if (!user.preferredMode) {
      router.push("/welcome");
      return;
    }

    // If user has selected a mode, ensure they're on the right default page
    // Only redirect from dashboard/pocket to the other if it's the root visit
    if (pathname === "/dashboard" && user.preferredMode === "pocket") {
      router.push("/pocket");
    } else if (pathname === "/pocket" && user.preferredMode === "detailed") {
      router.push("/dashboard");
    }
  }, [user, isLoading, pathname, router]);

  return null;
}
