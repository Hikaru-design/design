"use client";

import { useState } from "react";
import { Transaction, Category, Card } from "@/lib/types";
import { Pencil, Trash2 } from "lucide-react";

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
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

            {/* Transaction rows */}
            <div className="space-y-1.5">
              {grouped[date].map((t) => {
                const isExpanded = expandedId === t.id;
                const categoryColor =
                  t.type === "income" ? "var(--color-income)" : getCategoryColor(t.category);
                const cardName = getCardName(t.cardId);
                const cardColor = getCardColor(t.cardId);

                return (
                  <div
                    key={t.id}
                    className="bg-card rounded-xl overflow-hidden"
                    style={{ boxShadow: "var(--md-elevation-1)" }}
                  >
                    {/* Main row */}
                    <div
                      className="flex items-center gap-3 px-3 py-3 cursor-pointer state-layer active:scale-[0.99] transition-transform select-none"
                      onClick={() => setExpandedId(isExpanded ? null : t.id)}
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
                      <p
                        className={`type-headline font-semibold flex-shrink-0 ${
                          t.type === "income" ? "text-income" : "text-foreground"
                        }`}
                      >
                        {t.type === "income" ? "+" : "−"}¥{formatAmount(t.amount)}
                      </p>
                    </div>

                    {/* Expandable edit/delete row — grid animation */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateRows: isExpanded ? "1fr" : "0fr",
                        transition: "grid-template-rows 200ms ease",
                      }}
                    >
                      <div style={{ overflow: "hidden" }}>
                        <div className="flex justify-end gap-2 px-3 py-2 bg-muted/40 border-t border-border">
                          <button
                            onClick={() => { setExpandedId(null); onEdit(t); }}
                            className="flex items-center gap-1.5 type-caption1 font-medium text-foreground state-layer px-3 py-1.5 rounded-lg bg-card border border-border"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            編集
                          </button>
                          <button
                            onClick={() => { setExpandedId(null); onDelete(t.id); }}
                            className="flex items-center gap-1.5 type-caption1 font-medium text-destructive state-layer px-3 py-1.5 rounded-lg bg-destructive/5 border border-destructive/30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            削除
                          </button>
                        </div>
                      </div>
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
