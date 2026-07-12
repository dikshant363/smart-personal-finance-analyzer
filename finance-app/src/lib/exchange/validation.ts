import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/currency";

export type Db = typeof prisma;

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ValidatedTransaction {
  type: "Income" | "Expense";
  amount: number;
  description: string;
  date: Date;
  categoryName?: string;
  isDuplicate?: boolean;
  isProbableDuplicate?: boolean;
}

export function validateTransactionRow(
  row: Record<string, string>,
  index: number
): { data?: ValidatedTransaction; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  const rawType = row["type"] || row["Type"] || "";
  const rawAmount = row["amount"] || row["Amount"] || "";
  const rawDescription = row["description"] || row["Description"] || "";
  const rawDate = row["date"] || row["Date"] || "";
  const categoryName = row["category"] || row["Category"] || "";

  // Type check
  let type: "Income" | "Expense" = "Expense";
  if (rawType.toLowerCase() === "income") {
    type = "Income";
  } else if (rawType.toLowerCase() !== "expense" && rawType.trim().length > 0) {
    errors.push({
      row: index + 1,
      field: "type",
      message: `Invalid type '${rawType}'. Must be 'Income' or 'Expense'`,
    });
  }

  // Amount check
  const amount = parseFloat(rawAmount);
  if (isNaN(amount) || amount <= 0) {
    errors.push({
      row: index + 1,
      field: "amount",
      message: `Invalid amount '${rawAmount}'. Must be a positive number`,
    });
  }

  // Date check
  const date = new Date(rawDate);
  if (isNaN(date.getTime())) {
    errors.push({
      row: index + 1,
      field: "date",
      message: `Invalid date format '${rawDate}'. Use YYYY-MM-DD`,
    });
  }

  // Description check
  if (!rawDescription.trim()) {
    errors.push({
      row: index + 1,
      field: "description",
      message: "Description is a required field",
    });
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    data: {
      type,
      amount,
      description: rawDescription.trim(),
      date,
      categoryName: categoryName.trim() || undefined,
    },
    errors: [],
  };
}

export async function detectDuplicateTransactions(
  userId: string,
  candidateList: ValidatedTransaction[],
  db: Db = prisma
): Promise<ValidatedTransaction[]> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  // Fetch user's transactions from the last 6 months to match against
  const existing = await db.transaction.findMany({
    where: {
      userId,
      date: { gte: start },
    },
  });

  return candidateList.map((cand) => {
    const candDateStr = cand.date.toISOString().slice(0, 10);
    const candAmt = cand.amount;
    const candDesc = cand.description.toLowerCase();

    // Look for exact matches
    const exactMatch = existing.some((exist) => {
      const existDateStr = new Date(exist.date).toISOString().slice(0, 10);
      const existAmt = toNumber(exist.amount);
      const existDesc = (exist.description || "").toLowerCase();
      return existDateStr === candDateStr && existAmt === candAmt && existDesc === candDesc;
    });

    if (exactMatch) {
      return { ...cand, isDuplicate: true };
    }

    // Look for probable matches (same date & amount, similar description)
    const probableMatch = existing.some((exist) => {
      const existDateStr = new Date(exist.date).toISOString().slice(0, 10);
      const existAmt = toNumber(exist.amount);
      const existDesc = (exist.description || "").toLowerCase();
      return (
        existDateStr === candDateStr &&
        existAmt === candAmt &&
        (existDesc.includes(candDesc) || candDesc.includes(existDesc))
      );
    });

    if (probableMatch) {
      return { ...cand, isProbableDuplicate: true };
    }

    return cand;
  });
}
