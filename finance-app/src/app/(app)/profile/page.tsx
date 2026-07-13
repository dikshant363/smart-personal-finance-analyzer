import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileClient } from "@/components/profile/ProfileClient";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [profile, settings] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.userSettings.findUnique({ where: { userId: user.id } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <ProfileClient
        profile={profile}
        settings={settings}
        email={user.email}
        name={user.name}
      />
    </div>
  );
}
