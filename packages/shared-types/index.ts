/**
 * Shared Type Definitions — Package: @finance/shared-types
 * All platform clients (Web, Android, iOS, Desktop) reference these canonical types.
 */

export type Platform = "web" | "android" | "ios" | "desktop" | "pwa";

export type TransactionType = "Income" | "Expense";
export type TransactionSource = "Manual" | "Import" | "BankSync" | "Recurring";

export interface UserDTO {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface TransactionDTO {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: TransactionType;
  description: string;
  date: string;
  categoryId: string | null;
  categoryName: string | null;
  source: TransactionSource;
  amountBase?: number;
  rate?: number;
  converted?: boolean;
  baseCurrency?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetDTO {
  id: string;
  userId: string;
  categoryId: string | null;
  name: string;
  amount: number;
  spent: number;
  period: string;
  startDate: string;
  endDate: string | null;
}

export interface GoalDTO {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  category: string;
  status: string;
}

export interface ForecastDTO {
  month: string;
  projectedIncome: number;
  projectedExpenses: number;
  projectedSavings: number;
  confidence: number;
}

export interface AssetDTO {
  id: string;
  userId: string;
  name: string;
  type: string;
  value: number;
  currency: string;
}

export interface LiabilityDTO {
  id: string;
  userId: string;
  name: string;
  type: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
}

export interface NotificationDTO {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface WorkspaceDTO {
  id: string;
  name: string;
  ownerId: string;
  plan: string;
}

export interface AIConversationDTO {
  id: string;
  userId: string;
  messages: AIMessageDTO[];
  createdAt: string;
}

export interface AIMessageDTO {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  ok: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}
