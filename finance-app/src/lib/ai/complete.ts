import OpenAI from "openai";

export async function completeText(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return "";

  const client = new OpenAI({ apiKey });
  const res = await client.chat.completions.create({
    model: process.env.AI_MODEL ?? "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a concise, trustworthy personal-finance coach. Use ONLY the data provided. Never invent numbers, transactions, or facts.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.4,
  });

  return res.choices[0]?.message?.content?.trim() ?? "";
}
