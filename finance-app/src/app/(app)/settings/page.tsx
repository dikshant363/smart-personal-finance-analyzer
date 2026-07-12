import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "@/components/settings/settings-client";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const settings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <SettingsClient settings={settings} />
    </div>
  );
}
