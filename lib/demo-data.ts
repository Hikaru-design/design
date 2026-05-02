import { Transaction } from "./types";

function d(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function id(seed: string): string {
  return `demo-${seed}`;
}

export function generateDemoTransactions(): Transaction[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const prev = m === 1 ? 12 : m - 1;
  const prevY = m === 1 ? y - 1 : y;
  const at = new Date().toISOString();

  return [
    // 今月 — 収入
    { id: id("inc1"), date: d(y, m, 1), type: "income", amount: 280000, category: "salary", cardId: null, memo: "6月給与", createdAt: at },

    // 今月 — 支出
    { id: id("exp1"), date: d(y, m, 1), type: "expense", amount: 85000, category: "rent", cardId: "cash", memo: "家賃", createdAt: at },
    { id: id("exp2"), date: d(y, m, 2), type: "expense", amount: 1200, category: "food", cardId: "rakuten", memo: "コンビニ", createdAt: at },
    { id: id("exp3"), date: d(y, m, 3), type: "expense", amount: 3800, category: "food", cardId: "rakuten", memo: "スーパー", createdAt: at },
    { id: id("exp4"), date: d(y, m, 4), type: "expense", amount: 990, category: "subscription", cardId: "amazon", memo: "Netflix", createdAt: at },
    { id: id("exp5"), date: d(y, m, 5), type: "expense", amount: 1500, category: "transport", cardId: "view", memo: "定期外 Suica", createdAt: at },
    { id: id("exp6"), date: d(y, m, 7), type: "expense", amount: 4200, category: "food", cardId: "rakuten", memo: "外食（友人と）", createdAt: at },
    { id: id("exp7"), date: d(y, m, 8), type: "expense", amount: 2800, category: "daily", cardId: "amazon", memo: "日用品まとめ買い", createdAt: at },
    { id: id("exp8"), date: d(y, m, 10), type: "expense", amount: 12000, category: "utilities", cardId: "cash", memo: "電気・ガス代", createdAt: at },
    { id: id("exp9"), date: d(y, m, 12), type: "expense", amount: 6500, category: "entertainment", cardId: "rakuten", memo: "映画・ゲーム", createdAt: at },
    { id: id("exp10"), date: d(y, m, 15), type: "expense", amount: 500, category: "subscription", cardId: "rakuten", memo: "Spotify", createdAt: at },

    // 先月 — 収入
    { id: id("pinc1"), date: d(prevY, prev, 1), type: "income", amount: 280000, category: "salary", cardId: null, memo: "5月給与", createdAt: at },
    { id: id("pinc2"), date: d(prevY, prev, 20), type: "income", amount: 50000, category: "bonus", cardId: null, memo: "賞与", createdAt: at },

    // 先月 — 支出
    { id: id("pexp1"), date: d(prevY, prev, 1), type: "expense", amount: 85000, category: "rent", cardId: "cash", memo: "家賃", createdAt: at },
    { id: id("pexp2"), date: d(prevY, prev, 3), type: "expense", amount: 5200, category: "food", cardId: "rakuten", memo: "スーパー", createdAt: at },
    { id: id("pexp3"), date: d(prevY, prev, 5), type: "expense", amount: 990, category: "subscription", cardId: "amazon", memo: "Netflix", createdAt: at },
    { id: id("pexp4"), date: d(prevY, prev, 8), type: "expense", amount: 3200, category: "transport", cardId: "view", memo: "新幹線", createdAt: at },
    { id: id("pexp5"), date: d(prevY, prev, 10), type: "expense", amount: 11500, category: "utilities", cardId: "cash", memo: "電気・ガス代", createdAt: at },
    { id: id("pexp6"), date: d(prevY, prev, 14), type: "expense", amount: 8000, category: "self-investment", cardId: "rakuten", memo: "技術書", createdAt: at },
    { id: id("pexp7"), date: d(prevY, prev, 18), type: "expense", amount: 3500, category: "food", cardId: "rakuten", memo: "外食", createdAt: at },
    { id: id("pexp8"), date: d(prevY, prev, 22), type: "expense", amount: 2500, category: "daily", cardId: "amazon", memo: "日用品", createdAt: at },
    { id: id("pexp9"), date: d(prevY, prev, 25), type: "expense", amount: 4800, category: "entertainment", cardId: "rakuten", memo: "カラオケ・飲み会", createdAt: at },
    { id: id("pexp10"), date: d(prevY, prev, 28), type: "expense", amount: 1500, category: "medical", cardId: "cash", memo: "薬局", createdAt: at },
  ];
}
