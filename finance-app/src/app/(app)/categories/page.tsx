import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CategoriesClient } from "@/features/categories/CategoriesClient";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Categories</h1>
      <CategoriesClient categories={categories} />
    </div>
  );
}
