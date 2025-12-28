"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function ModeRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuthStore();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Skip if still loading or not authenticated
    if (isLoading || !user) return;

    // Skip if already on welcome page
    if (pathname === "/welcome") return;

    // Skip if on settings (allow access to change mode)
    if (pathname === "/settings") return;

    // Skip other pages like overview, transactions, budgets, etc
    // Only handle redirects for dashboard and pocket pages
    const protectedPages = ["/dashboard", "/pocket"];
    if (!protectedPages.includes(pathname) && pathname !== "/") return;

    // If user hasn't selected a mode, redirect to welcome (only once)
    if (!user.preferredMode && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push("/welcome");
      return;
    }

    // If user has selected a mode and is on the root path, redirect to preferred mode
    if (user.preferredMode && pathname === "/") {
      if (user.preferredMode === "pocket") {
        router.push("/pocket");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, pathname, router]);

  return null;
}
