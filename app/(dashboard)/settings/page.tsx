"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Card, Button, Input, Select } from "@/components/ui";
import Header from "@/components/layout/Header";
import { CURRENCIES } from "@/lib/utils";
import { Save, User, Globe, Calendar, Check } from "lucide-react";

const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (US & Canada)" },
  { value: "America/Chicago", label: "Central Time (US & Canada)" },
  { value: "America/Denver", label: "Mountain Time (US & Canada)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Kolkata", label: "India Standard Time" },
  { value: "Asia/Karachi", label: "Pakistan Standard Time" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Shanghai", label: "China Standard Time" },
  { value: "Australia/Sydney", label: "Sydney" },
];

const MONTH_START_DAYS = Array.from({ length: 28 }, (_, i) => ({
  value: (i + 1).toString(),
  label: `${i + 1}${getOrdinalSuffix(i + 1)} of each month`,
}));

function getOrdinalSuffix(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export default function SettingsPage() {
  const { user, updateSettings } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    currency: "USD",
    timezone: "UTC",
    monthStartDay: "1",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        currency: user.currency || "USD",
        timezone: user.timezone || "UTC",
        monthStartDay: user.monthStartDay?.toString() || "1",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const success = await updateSettings({
        name: formData.name,
        currency: formData.currency,
        timezone: formData.timezone,
        monthStartDay: parseInt(formData.monthStartDay),
      });

      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="py-6">
      <Header
        title="Settings"
        subtitle="Manage your account preferences"
      />

      <form onSubmit={handleSubmit} className="mt-6 space-y-6 max-w-2xl">
        {/* Profile Section */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                Profile
              </h3>
              <p className="text-sm text-text-muted">
                Your personal information
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Display Name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Email Address
              </label>
              <p className="px-4 py-2.5 bg-background-secondary border border-border rounded-lg text-text-muted">
                {user?.email || "Loading..."}
              </p>
              <p className="text-xs text-text-muted mt-1">
                Email cannot be changed
              </p>
            </div>
          </div>
        </Card>

        {/* Regional Settings */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-accent-purple/10 rounded-lg">
              <Globe className="w-5 h-5 text-accent-purple" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                Regional Settings
              </h3>
              <p className="text-sm text-text-muted">
                Currency and timezone preferences
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Select
              label="Currency"
              options={CURRENCIES}
              value={formData.currency}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, currency: e.target.value }))
              }
            />

            <Select
              label="Timezone"
              options={TIMEZONES}
              value={formData.timezone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, timezone: e.target.value }))
              }
            />
          </div>
        </Card>

        {/* Budget Cycle */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-accent-green/10 rounded-lg">
              <Calendar className="w-5 h-5 text-accent-green" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                Budget Cycle
              </h3>
              <p className="text-sm text-text-muted">
                When your monthly budget resets
              </p>
            </div>
          </div>

          <Select
            label="Month Start Day"
            options={MONTH_START_DAYS}
            value={formData.monthStartDay}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, monthStartDay: e.target.value }))
            }
          />
          <p className="text-sm text-text-muted mt-2">
            Set this to match your salary cycle for more accurate budgeting
          </p>
        </Card>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <Button type="submit" isLoading={isSaving}>
            <Save className="w-4 h-4" />
            Save Changes
          </Button>

          {saveSuccess && (
            <div className="flex items-center gap-2 text-accent-green">
              <Check className="w-4 h-4" />
              <span className="text-sm">Settings saved successfully</span>
            </div>
          )}
        </div>
      </form>

      {/* Danger Zone */}
      <Card className="mt-12 max-w-2xl border-accent-red/50">
        <h3 className="text-lg font-semibold text-accent-red mb-2">
          Danger Zone
        </h3>
        <p className="text-sm text-text-muted mb-4">
          These actions are irreversible. Please be careful.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" disabled>
            Export All Data
          </Button>
          <Button variant="danger" disabled>
            Delete Account
          </Button>
        </div>
        <p className="text-xs text-text-muted mt-2">
          Account deletion is not yet available. Contact support if needed.
        </p>
      </Card>
    </div>
  );
}
