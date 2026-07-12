import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const categorySchema = z.object({
  name: z.string().min(1).max(40),
  type: z.enum(["Income", "Expense"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().max(40).optional(),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const transactionSchema = z.object({
  type: z.enum(["Income", "Expense"]),
  amount: z.number().positive(),
  currency: z.string().length(3).optional(),
  categoryId: z.string().nullable().optional(),
  description: z.string().max(200).optional(),
  date: z.string().datetime().optional(),
});
export type TransactionInput = z.infer<typeof transactionSchema>;

export const budgetSchema = z.object({
  name: z.string().min(1).max(60),
  amount: z.number().positive(),
  period: z.enum(["Weekly", "Monthly", "Yearly"]).optional(),
  categoryId: z.string().nullable().optional(),
});
export type BudgetInput = z.infer<typeof budgetSchema>;

export const settingsSchema = z.object({
  theme: z.enum(["Light", "Dark", "System"]).optional(),
  emailNotifications: z.boolean().optional(),
  aiInsightsEnabled: z.boolean().optional(),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

export const goalSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(200).optional().nullable(),
  targetAmount: z.number().positive(),
  currentAmount: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  deadline: z.string().optional().nullable(), // Allow string formats for easy input from forms
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  status: z.enum(["planning", "active", "behind_schedule", "ahead_of_schedule", "completed", "paused", "archived", "cancelled"]).optional(),
  type: z.string().min(1).max(40).optional(),
  estimatedMonthlyContribution: z.number().nonnegative().optional(),
  actualMonthlyContribution: z.number().nonnegative().optional(),
  expectedCompletion: z.string().optional().nullable(),
  forecastCompletion: z.string().optional().nullable(),
});
export type GoalInput = z.infer<typeof goalSchema>;

export const goalUpdateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  description: z.string().max(200).optional().nullable(),
  targetAmount: z.number().positive().optional(),
  currentAmount: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  deadline: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  status: z.enum(["planning", "active", "behind_schedule", "ahead_of_schedule", "completed", "paused", "archived", "cancelled"]).optional(),
  type: z.string().min(1).max(40).optional(),
  estimatedMonthlyContribution: z.number().nonnegative().optional(),
  actualMonthlyContribution: z.number().nonnegative().optional(),
  expectedCompletion: z.string().optional().nullable(),
  forecastCompletion: z.string().optional().nullable(),
});
export type GoalUpdateInput = z.infer<typeof goalUpdateSchema>;
