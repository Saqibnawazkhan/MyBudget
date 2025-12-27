"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { ArrowRight, TrendingUp, PieChart, Download, Loader2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Glow effects */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-glow-blue pointer-events-none" />
      <div className="fixed top-1/4 right-1/4 w-[600px] h-[600px] bg-glow-purple pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center animate-pulse-glow">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className="text-xl font-bold text-text-primary">MyBudget</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-text-secondary hover:text-text-primary transition-colors hover:scale-105 transform">
            Features
          </a>
          <a href="#pricing" className="text-text-secondary hover:text-text-primary transition-colors hover:scale-105 transform">
            Pricing
          </a>
          <Link
            href="/login"
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl btn-press ripple hover:scale-105"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 md:px-12 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            The AI Budget Planner
            <br />
            <span className="gradient-text">That Thinks Ahead</span>
          </h1>

          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            Finances made effortless. Our intelligent engine predicts future
            spending, finds hidden savings, and customizes a plan just for you.
            Spend smarter, not harder.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <Link
              href="/signup"
              className="flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl btn-press ripple hover:scale-105 group"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 bg-background-card hover:bg-background-hover text-text-primary rounded-full font-medium border border-border transition-all duration-200 btn-press hover:scale-105"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="max-w-6xl mx-auto mt-32 grid md:grid-cols-3 gap-8">
          <div
            className="bg-background-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 card-interactive animate-fade-in-up"
            style={{ animationDelay: "400ms" }}
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 transition-transform hover:scale-110 hover:rotate-3">
              <TrendingUp className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-3">
              Smart Tracking
            </h3>
            <p className="text-text-secondary">
              Automatically categorize your transactions and track spending
              patterns across all your accounts.
            </p>
          </div>

          <div
            className="bg-background-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 hover:border-accent-purple/50 transition-all duration-300 card-interactive animate-fade-in-up"
            style={{ animationDelay: "500ms" }}
          >
            <div className="w-14 h-14 rounded-xl bg-accent-purple/10 flex items-center justify-center mb-6 transition-transform hover:scale-110 hover:rotate-3">
              <PieChart className="w-7 h-7 text-accent-purple" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-3">
              Visual Reports
            </h3>
            <p className="text-text-secondary">
              Beautiful charts and insights that help you understand where your
              money goes each month.
            </p>
          </div>

          <div
            className="bg-background-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 hover:border-accent-green/50 transition-all duration-300 card-interactive animate-fade-in-up"
            style={{ animationDelay: "600ms" }}
          >
            <div className="w-14 h-14 rounded-xl bg-accent-green/10 flex items-center justify-center mb-6 transition-transform hover:scale-110 hover:rotate-3">
              <Download className="w-7 h-7 text-accent-green" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-3">
              Export Anywhere
            </h3>
            <p className="text-text-secondary">
              Export your reports to PDF or Excel. Perfect for tax season or
              sharing with your accountant.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border mt-20 py-8 px-6 md:px-12 animate-fade-in" style={{ animationDelay: "700ms" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center transition-transform hover:scale-110">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-text-secondary">
              &copy; 2025 MyBudget. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-text-muted">
            <a href="#" className="hover:text-text-primary transition-all duration-200 hover:scale-105">
              Privacy
            </a>
            <a href="#" className="hover:text-text-primary transition-all duration-200 hover:scale-105">
              Terms
            </a>
            <a href="#" className="hover:text-text-primary transition-all duration-200 hover:scale-105">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
