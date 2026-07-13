import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CopilotEngine } from "@/lib/copilot";
import { CopilotClient } from "@/features/copilot/CopilotClient";

export default async function CopilotPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let list = await prisma.conversation.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  if (list.length === 0) {
    await prisma.conversation.create({
      data: {
        userId: user.id,
        title: "Initial Advisory Chat",
      },
    });

    list = await prisma.conversation.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });
  }

  const activeId = list[0]?.id;
  const copilot = new CopilotEngine();
  const messages = activeId ? await copilot.getConversationHistory(activeId) : [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">AI Financial Copilot Desk</h1>
      <CopilotClient
        initialConversations={list}
        initialMessages={messages}
      />
    </div>
  );
}
