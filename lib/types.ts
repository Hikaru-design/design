export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  amount: number;
  category: string;
  cardId: string | null;
  memo: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
}

export interface Card {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
  closingDay?: number;   // 締め日 (1-31)
  paymentDay?: number;   // 支払日 (1-31)
  budgetAmount?: number; // 月予算額（円）
}

export interface MonthlySummary {
  year: number;
  month: number;
  income: number;
  expense: number;
  balance: number;
}
