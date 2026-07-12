"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type Settings = {
  theme: "Light" | "Dark" | "System";
  emailNotifications: boolean;
  aiInsightsEnabled: boolean;
} | null;

export function SettingsClient({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [theme, setTheme] = React.useState<"Light" | "Dark" | "System">(
    settings?.theme ?? "System"
  );
  const [emailNotifications, setEmailNotifications] = React.useState(
    settings?.emailNotifications ?? false
  );
  const [aiInsightsEnabled, setAiInsightsEnabled] = React.useState(
    settings?.aiInsightsEnabled ?? true
  );
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, emailNotifications, aiInsightsEnabled }),
      });
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        {saved && <span className="text-sm text-green-600">Saved</span>}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <Label htmlFor="theme">Theme</Label>
            <Select
              id="theme"
              value={theme}
              onChange={(e) =>
                setTheme(e.target.value as "Light" | "Dark" | "System")
              }
            >
              <option value="Light">Light</option>
              <option value="Dark">Dark</option>
              <option value="System">System</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="emailNotifications">Email notifications</Label>
            <Select
              id="emailNotifications"
              value={emailNotifications ? "yes" : "no"}
              onChange={(e) => setEmailNotifications(e.target.value === "yes")}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="aiInsightsEnabled">AI insights enabled</Label>
            <Select
              id="aiInsightsEnabled"
              value={aiInsightsEnabled ? "yes" : "no"}
              onChange={(e) => setAiInsightsEnabled(e.target.value === "yes")}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Select>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Theme is saved as your preference.
          </p>
          <div className="flex justify-end pt-1">
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
