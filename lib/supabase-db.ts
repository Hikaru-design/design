import { supabase } from "./supabase";
import { Transaction, Category, Card, TransactionType } from "./types";
import { DEFAULT_CATEGORIES, DEFAULT_CARDS, INCOME_CATEGORIES } from "./constants";
import { generateId } from "./storage";

// ─────────────────────────────────────────────
// 型マッピング（DB snake_case ↔ TS camelCase）
// ─────────────────────────────────────────────

function rowToTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    date: row.date as string,
    type: row.type as TransactionType,
    amount: row.amount as number,
    category: row.category as string,
    cardId: row.card_id as string | null,
    memo: row.memo as string,
    createdAt: row.created_at as string,
  };
}

function transactionToRow(t: Transaction, userId: string) {
  return {
    id: t.id,
    user_id: userId,
    date: t.date,
    type: t.type,
    amount: t.amount,
    category: t.category,
    card_id: t.cardId,
    memo: t.memo,
    created_at: t.createdAt,
  };
}

function rowToCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    name: row.name as string,
    color: row.color as string,
    isDefault: row.is_default as boolean,
  };
}

function categoryToRow(c: Category, userId: string) {
  return {
    id: c.id,
    user_id: userId,
    name: c.name,
    color: c.color,
    is_default: c.isDefault,
  };
}

function rowToCard(row: Record<string, unknown>): Card {
  return {
    id: row.id as string,
    name: row.name as string,
    color: row.color as string,
    isDefault: row.is_default as boolean,
    closingDay: row.closing_day as number | undefined,
    paymentDay: row.payment_day as number | undefined,
    budgetAmount: row.budget_amount as number | undefined,
  };
}

function cardToRow(c: Card, userId: string) {
  return {
    id: c.id,
    user_id: userId,
    name: c.name,
    color: c.color,
    is_default: c.isDefault,
    closing_day: c.closingDay ?? null,
    payment_day: c.paymentDay ?? null,
    budget_amount: c.budgetAmount ?? null,
  };
}

// ─────────────────────────────────────────────
// Transactions
// ─────────────────────────────────────────────

export async function dbGetTransactions(userId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToTransaction);
}

export async function dbAddTransaction(t: Transaction, userId: string): Promise<void> {
  const { error } = await supabase.from("transactions").insert(transactionToRow(t, userId));
  if (error) throw error;
}

export async function dbUpdateTransaction(t: Transaction, userId: string): Promise<void> {
  const { error } = await supabase
    .from("transactions")
    .update(transactionToRow(t, userId))
    .eq("id", t.id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function dbDeleteTransaction(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

// ─────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────

export async function dbGetCategories(userId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  if (!data || data.length === 0) {
    // 初回: デフォルトカテゴリを挿入
    const defaults = [...DEFAULT_CATEGORIES, ...INCOME_CATEGORIES];
    await supabase.from("categories").insert(
      defaults.map((c) => categoryToRow(c, userId))
    );
    return defaults;
  }
  return data.map(rowToCategory);
}

export async function dbAddCategory(c: Category, userId: string): Promise<void> {
  const { error } = await supabase.from("categories").insert(categoryToRow(c, userId));
  if (error) throw error;
}

export async function dbDeleteCategory(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .eq("is_default", false);
  if (error) throw error;
}

// ─────────────────────────────────────────────
// Cards
// ─────────────────────────────────────────────

export async function dbGetCards(userId: string): Promise<Card[]> {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  if (!data || data.length === 0) {
    // 初回: デフォルトカードを挿入
    await supabase.from("cards").insert(
      DEFAULT_CARDS.map((c) => cardToRow(c, userId))
    );
    return DEFAULT_CARDS;
  }
  return data.map(rowToCard);
}

export async function dbAddCard(c: Card, userId: string): Promise<void> {
  const { error } = await supabase.from("cards").insert(cardToRow(c, userId));
  if (error) throw error;
}

export async function dbUpdateCard(c: Card, userId: string): Promise<void> {
  const { error } = await supabase
    .from("cards")
    .update(cardToRow(c, userId))
    .eq("id", c.id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function dbDeleteCard(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("cards")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .eq("is_default", false);
  if (error) throw error;
}

export { generateId };
