import { Transaction, Category, Card } from "./types";
import { DEFAULT_CATEGORIES, DEFAULT_CARDS, INCOME_CATEGORIES } from "./constants";

const KEYS = {
  TRANSACTIONS: "kakeibo_transactions",
  CATEGORIES: "kakeibo_categories",
  CARDS: "kakeibo_cards",
};

function isClient() {
  return typeof window !== "undefined";
}

// Transactions
export function getTransactions(): Transaction[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(KEYS.TRANSACTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  if (!isClient()) return;
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export function addTransaction(transaction: Transaction): void {
  const transactions = getTransactions();
  transactions.unshift(transaction);
  saveTransactions(transactions);
}

export function updateTransaction(updated: Transaction): void {
  const transactions = getTransactions();
  const index = transactions.findIndex((t) => t.id === updated.id);
  if (index !== -1) {
    transactions[index] = updated;
    saveTransactions(transactions);
  }
}

export function deleteTransaction(id: string): void {
  const transactions = getTransactions().filter((t) => t.id !== id);
  saveTransactions(transactions);
}

// Categories
export function getCategories(): Category[] {
  if (!isClient()) return [...DEFAULT_CATEGORIES, ...INCOME_CATEGORIES];
  try {
    const raw = localStorage.getItem(KEYS.CATEGORIES);
    return raw ? JSON.parse(raw) : [...DEFAULT_CATEGORIES, ...INCOME_CATEGORIES];
  } catch {
    return [...DEFAULT_CATEGORIES, ...INCOME_CATEGORIES];
  }
}

export function saveCategories(categories: Category[]): void {
  if (!isClient()) return;
  localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
}

export function addCategory(category: Category): void {
  const categories = getCategories();
  categories.push(category);
  saveCategories(categories);
}

export function deleteCategory(id: string): void {
  const categories = getCategories().filter((c) => c.id !== id || c.isDefault);
  saveCategories(categories);
}

// Cards
export function getCards(): Card[] {
  if (!isClient()) return DEFAULT_CARDS;
  try {
    const raw = localStorage.getItem(KEYS.CARDS);
    return raw ? JSON.parse(raw) : DEFAULT_CARDS;
  } catch {
    return DEFAULT_CARDS;
  }
}

export function saveCards(cards: Card[]): void {
  if (!isClient()) return;
  localStorage.setItem(KEYS.CARDS, JSON.stringify(cards));
}

export function addCard(card: Card): void {
  const cards = getCards();
  cards.push(card);
  saveCards(cards);
}

export function deleteCard(id: string): void {
  const cards = getCards().filter((c) => c.id !== id || c.isDefault);
  saveCards(cards);
}

// Utils
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getMonthlyTransactions(
  transactions: Transaction[],
  year: number,
  month: number
): Transaction[] {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return transactions.filter((t) => t.date.startsWith(prefix));
}
