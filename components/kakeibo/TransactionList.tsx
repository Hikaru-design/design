"use client";

import { Transaction, Category, Card } from "@/lib/types";
import { Trash2 } from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  cards: Card[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

export function TransactionList({
  transactions,
  categories,
  cards,
  onEdit,
  onDelete,
}: TransactionListProps) {
  function getCategoryName(id: string) {
    return categories.find((c) => c.id === id)?.name ?? id;
  }
  function getCategoryColor(id: string) {
    return categories.find((c) => c.id === id)?.color ?? "#6b7280";
  }
  function getCardName(id: string | null) {
    if (!id) return null;
    return cards.find((c) => c.id === id)?.name ?? id;
  }
  function getCardColor(id: string | null) {
    if (!id) return "#6b7280";
    return cards.find((c) => c.id === id)?.color ?? "#6b7280";
  }

  function formatAmount(amount: number) {
    return amount.toLocaleString("ja-JP");
  }

  function formatDateHeader(dateStr: string) {
    // Parse as local date to avoid timezone shifts
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const dow = DAY_NAMES[date.getDay()];
    return `${m}月${d}日（${dow}）`;
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12 type-callout">
        取引がありません
      </div>
    );
  }

  // Group by date
  const grouped: Record<string, Transaction[]> = {};
  transactions.forEach((t) => {
    if (!grouped[t.date]) grouped[t.date] = [];
    grouped[t.date].push(t);
  });

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-5">
      {sortedDates.map((date) => {
        const dayExpense = grouped[date]
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);
        const dayIncome = grouped[date]
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);

        return (
          <div key={date}>
            {/* Date section header */}
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="type-subheadline text-muted-foreground font-medium">
                {formatDateHeader(date)}
              </span>
              <div className="flex items-center gap-3">
                {dayIncome > 0 && (
                  <span className="type-caption1 font-semibold text-income">
                    +¥{dayIncome.toLocaleString("ja-JP")}
                  </span>
                )}
                {dayExpense > 0 && (
                  <span className="type-caption1 font-medium text-muted-foreground">
                    -¥{dayExpense.toLocaleString("ja-JP")}
                  </span>
                )}
              </div>
            </div>

            {/* Transaction rows (list style) */}
            <div className="divide-y divide-border rounded-xl bg-card/40">
              {grouped[date].map((t) => {
                const categoryColor =
                  t.type === "income" ? "var(--color-income)" : getCategoryColor(t.category);
                const cardName = getCardName(t.cardId);
                const cardColor = getCardColor(t.cardId);

                return (
                  <div key={t.id} className="overflow-hidden">
                    {/* Main row */}
                    <div className="flex items-center bg-background">
                    <div
                      className="flex items-center gap-3 px-3 py-3 cursor-pointer state-layer active:scale-[0.99] transition-transform select-none flex-1"
                      onClick={() => onEdit(t)}
                    >
                      {/* Category color circle */}
                      <div
                        className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: `${categoryColor}22` }}
                      >
                        <div
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: categoryColor }}
                        />
                      </div>

                      {/* Middle: category + memo + card badge */}
                      <div className="flex-1 min-w-0">
                        <p className="type-subheadline font-medium text-foreground truncate">
                          {getCategoryName(t.category)}
                        </p>
                        {t.memo && (
                          <p className="type-caption1 text-muted-foreground truncate">
                            {t.memo}
                          </p>
                        )}
                        {cardName && (
                          <span
                            className="inline-flex items-center mt-0.5 px-1.5 py-0.5 rounded type-caption2 font-medium"
                            style={{
                              backgroundColor: `${cardColor}22`,
                              color: cardColor,
                            }}
                          >
                            {cardName}
                          </span>
                        )}
                      </div>

                      {/* Right: amount */}
                      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                        <p
                          className={`type-headline font-semibold ${
                            t.type === "income" ? "text-income" : "text-foreground"
                          }`}
                        >
                          {t.type === "income" ? "+" : "−"}¥{formatAmount(t.amount)}
                        </p>
                        <span className="type-caption2 text-muted-foreground">
                          {t.type === "income" ? "収入" : "支出"}
                        </span>
                      </div>
                    </div>
                    {/* Delete button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}
                      className="px-3 self-stretch flex items-center text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                      aria-label="削除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
