"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Smartphone, LayoutDashboard, ArrowRight, Zap, BarChart3 } from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();
  const { user, updateSettings } = useAuthStore();
  const [selectedMode, setSelectedMode] = useState<"pocket" | "detailed" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!selectedMode) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the auth store's updateSettings to ensure state is updated
      const success = await updateSettings({ preferredMode: selectedMode });

      if (success) {
        // Small delay to ensure state is fully updated
        await new Promise(resolve => setTimeout(resolve, 100));

        // Force redirect using window.location for reliability
        if (selectedMode === "pocket") {
          window.location.href = "/pocket";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        alert("Failed to save preference. Please try again.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Failed to save preference:", error);
      alert("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent-purple/5 to-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Welcome Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent-purple rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-3xl">M</span>
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-3">
            Welcome, {user?.name?.split(" ")[0] || "there"}! 👋
          </h1>
          <p className="text-lg text-text-muted">
            Choose how you'd like to manage your budget
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Pocket Pro Mode */}
          <button
            onClick={() => setSelectedMode("pocket")}
            className={`group relative bg-background-card border-2 rounded-3xl p-8 text-left transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
              selectedMode === "pocket"
                ? "border-primary shadow-xl ring-4 ring-primary/20"
                : "border-border hover:border-primary/50"
            }`}
          >
            {/* Badge */}
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-accent-green/20 text-accent-green text-xs font-bold rounded-full">
                QUICK & EASY
              </span>
            </div>

            {/* Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Smartphone className="w-8 h-8 text-white" />
            </div>

            {/* Content */}
            <h2 className="text-2xl font-bold text-text-primary mb-3">
              Pocket Pro
            </h2>
            <p className="text-text-muted mb-6 leading-relaxed">
              Simple, fast, and mobile-friendly. Perfect for daily expense tracking on the go.
            </p>

            {/* Features */}
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-sm text-text-secondary">
                <Zap className="w-4 h-4 text-accent-green" />
                Quick add transactions in seconds
              </li>
              <li className="flex items-center gap-2 text-sm text-text-secondary">
                <Zap className="w-4 h-4 text-accent-green" />
                Calendar view for daily tracking
              </li>
              <li className="flex items-center gap-2 text-sm text-text-secondary">
                <Zap className="w-4 h-4 text-accent-green" />
                Simple charts and summaries
              </li>
            </ul>

            {/* Selection Indicator */}
            {selectedMode === "pocket" && (
              <div className="flex items-center gap-2 text-primary font-semibold animate-fade-in">
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Selected
              </div>
            )}
          </button>

          {/* Detailed Mode */}
          <button
            onClick={() => setSelectedMode("detailed")}
            className={`group relative bg-background-card border-2 rounded-3xl p-8 text-left transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
              selectedMode === "detailed"
                ? "border-primary shadow-xl ring-4 ring-primary/20"
                : "border-border hover:border-primary/50"
            }`}
          >
            {/* Badge */}
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full">
                POWERFUL
              </span>
            </div>

            {/* Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent-purple rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <LayoutDashboard className="w-8 h-8 text-white" />
            </div>

            {/* Content */}
            <h2 className="text-2xl font-bold text-text-primary mb-3">
              Detailed Dashboard
            </h2>
            <p className="text-text-muted mb-6 leading-relaxed">
              Complete budget management with advanced features, charts, and insights.
            </p>

            {/* Features */}
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-sm text-text-secondary">
                <BarChart3 className="w-4 h-4 text-primary" />
                Advanced analytics and reports
              </li>
              <li className="flex items-center gap-2 text-sm text-text-secondary">
                <BarChart3 className="w-4 h-4 text-primary" />
                Budget planning and tracking
              </li>
              <li className="flex items-center gap-2 text-sm text-text-secondary">
                <BarChart3 className="w-4 h-4 text-primary" />
                Multiple views and customization
              </li>
            </ul>

            {/* Selection Indicator */}
            {selectedMode === "detailed" && (
              <div className="flex items-center gap-2 text-primary font-semibold animate-fade-in">
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Selected
              </div>
            )}
          </button>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedMode || isSubmitting}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-accent-purple text-white font-semibold rounded-2xl shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
          >
            {isSubmitting ? (
              "Loading..."
            ) : (
              <>
                Continue to {selectedMode === "pocket" ? "Pocket Pro" : "Dashboard"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {/* Skip/Change Later */}
          <p className="mt-4 text-sm text-text-muted">
            You can always switch modes later in Settings
          </p>
        </div>
      </div>
    </div>
  );
}
