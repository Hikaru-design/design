import { Category, Card } from "./types";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "food", name: "食費", color: "#f97316", isDefault: true },
  { id: "utilities", name: "光熱費", color: "#3b82f6", isDefault: true },
  { id: "subscription", name: "サブスク", color: "#8b5cf6", isDefault: true },
  { id: "entertainment", name: "エンタメ", color: "#ec4899", isDefault: true },
  { id: "self-investment", name: "自己投資", color: "#10b981", isDefault: true },
  { id: "medical", name: "医療", color: "#ef4444", isDefault: true },
  { id: "transport", name: "交通", color: "#06b6d4", isDefault: true },
  { id: "daily", name: "日用品", color: "#f59e0b", isDefault: true },
  { id: "rent", name: "家賃", color: "#6366f1", isDefault: true },
  { id: "other", name: "その他", color: "#6b7280", isDefault: true },
];

export const DEFAULT_CARDS: Card[] = [
  { id: "rakuten", name: "楽天カード", color: "#e00000", isDefault: true },
  { id: "amazon", name: "Amazonカード", color: "#ff9900", isDefault: true },
  { id: "view", name: "ビューカード", color: "#1a56db", isDefault: true },
  { id: "cash", name: "現金", color: "#10b981", isDefault: true },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: "salary", name: "給与", color: "#10b981", isDefault: true },
  { id: "bonus", name: "賞与", color: "#f59e0b", isDefault: true },
  { id: "other-income", name: "その他収入", color: "#6b7280", isDefault: true },
];
