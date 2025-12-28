"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import CircularProgress from "@/components/ui/CircularProgress";
import ActivityLineChart from "@/components/charts/ActivityLineChart";
import { formatCurrency, formatDate } from "@/lib/utils";
import { User, TrendingUp, CreditCard } from "lucide-react";
import Link from "next/link";

interface OverviewData {
  totalTransactions: number;
  totalRevenue: number;
  subscribers: number;
  notSubscribed: number;
  revenueGrowth: string;
  activityData: Array<{ month: string; value: number }>;
  latestTransactions: Array<{
    id: string;
    description: string;
    amount: number;
    date: string;
    status: string;
  }>;
  latestRegistrations: Array<{
    id: string;
    name: string;
    date: string;
  }>;
}

export default function OverviewPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await fetch("/api/overview");
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch overview:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const currency = user?.currency || "USD";
  const revenuePercentage = data ? Math.min((data.totalRevenue / 100000) * 100, 100) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6">
      {/* User Profile Section */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="bg-background-card rounded-2xl p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">{user?.name || "User"}</h2>
              <p className="text-sm text-text-muted">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Overview</h1>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Card - Large */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-2xl p-6 text-white relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-600/30 rounded-full -ml-12 -mb-12" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Total Transactions</p>
                    <p className="text-3xl font-bold">{data?.totalTransactions.toLocaleString() || "0"}</p>
                    <p className="text-xs opacity-75 mt-1">{data?.revenueGrowth || "+5%"} New User</p>
                  </div>
                </div>

                <div className="flex items-center justify-center my-6">
                  <CircularProgress
                    percentage={revenuePercentage}
                    size={200}
                    strokeWidth={14}
                    color="#FF6B35"
                    backgroundColor="rgba(255, 255, 255, 0.1)"
                  >
                    <div className="text-center">
                      <p className="text-sm opacity-90">Total Revenue</p>
                      <p className="text-2xl font-bold mt-1">
                        {formatCurrency(data?.totalRevenue || 0, currency)}
                      </p>
                    </div>
                  </CircularProgress>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                  <div>
                    <p className="text-sm opacity-90">Subscriber</p>
                    <p className="text-xl font-bold">{data?.subscribers.toLocaleString() || "0"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90">Not Subscribed</p>
                    <p className="text-xl font-bold">{data?.notSubscribed.toLocaleString() || "0"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Activity Chart */}
            <div className="bg-background-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary">Transaction Activity</h3>
                <select className="text-sm bg-background-secondary border border-border rounded-lg px-3 py-1 text-text-primary">
                  <option>6 Months</option>
                  <option>3 Months</option>
                  <option>1 Year</option>
                </select>
              </div>
              {data?.activityData && data.activityData.length > 0 ? (
                <ActivityLineChart data={data.activityData} />
              ) : (
                <div className="h-48 flex items-center justify-center text-text-muted">
                  No activity data yet
                </div>
              )}
            </div>

            {/* AI Card */}
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">AI-Powered Insights</p>
                  <p className="text-xs opacity-90">
                    Get smart recommendations and spending analysis based on your transaction patterns.
                  </p>
                </div>
              </div>
            </div>

            {/* Latest Transactions */}
            <div className="bg-background-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary">Latest Transactions</h3>
                <select className="text-sm bg-background-secondary border border-border rounded-lg px-3 py-1 text-text-primary">
                  <option>6 Months</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">
                        Description
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.latestTransactions && data.latestTransactions.length > 0 ? (
                      data.latestTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-border hover:bg-background-hover">
                          <td className="py-3 px-4 text-sm text-text-primary">
                            {transaction.description || "Transaction"}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-text-primary">
                            {formatCurrency(transaction.amount, currency)}
                          </td>
                          <td className="py-3 px-4 text-sm text-text-muted">
                            {formatDate(transaction.date)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-green/10 text-accent-green">
                              {transaction.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-text-muted text-sm">
                          No transactions yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Latest Registrations - Bottom Right */}
          <div className="lg:col-start-3 bg-background-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-primary">Recent Categories</h3>
              <select className="text-sm bg-background-secondary border border-border rounded-lg px-3 py-1 text-text-primary">
                <option>6 Months</option>
              </select>
            </div>

            <div className="space-y-4">
              {data?.latestRegistrations && data.latestRegistrations.length > 0 ? (
                data.latestRegistrations.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{item.name}</p>
                      </div>
                    </div>
                    <p className="text-xs text-text-muted">{formatDate(item.date)}</p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-text-muted text-sm">
                  No recent categories
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
