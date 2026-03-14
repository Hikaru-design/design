"use client";

import { Transaction, Category, Card } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  cards: Card[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

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

  function formatDate(date: string) {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }

  function formatAmount(amount: number) {
    return amount.toLocaleString("ja-JP");
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12 text-sm">
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

  const sortedDates = Object.keys(grouped).sort((a, b) =>
    b.localeCompare(a)
  );

  return (
    <div className="space-y-4">
      {sortedDates.map((date) => {
        const dayExpense = grouped[date]
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);
        const dayIncome = grouped[date]
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);

        return (
        <div key={date}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">
              {new Date(date).toLocaleDateString("ja-JP", {
                month: "long",
                day: "numeric",
                weekday: "short",
              })}
            </p>
            <div className="flex gap-2 text-xs">
              {dayIncome > 0 && (
                <span className="text-emerald-600 font-medium">
                  +¥{dayIncome.toLocaleString("ja-JP")}
                </span>
              )}
              {dayExpense > 0 && (
                <span className="text-muted-foreground font-medium">
                  -¥{dayExpense.toLocaleString("ja-JP")}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {grouped[date].map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
              >
                <div
                  className="w-2 h-10 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor:
                      t.type === "income"
                        ? "#10b981"
                        : getCategoryColor(t.category),
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{
                        backgroundColor:
                          t.type === "income"
                            ? "#d1fae5"
                            : `${getCategoryColor(t.category)}22`,
                        color:
                          t.type === "income"
                            ? "#065f46"
                            : getCategoryColor(t.category),
                        borderColor: "transparent",
                      }}
                    >
                      {getCategoryName(t.category)}
                    </Badge>
                    {t.cardId && (
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: getCardColor(t.cardId),
                          color: getCardColor(t.cardId),
                        }}
                      >
                        {getCardName(t.cardId)}
                      </Badge>
                    )}
                  </div>
                  {t.memo && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {t.memo}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p
                    className={`font-semibold text-sm ${
                      t.type === "income"
                        ? "text-emerald-600"
                        : "text-foreground"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}¥
                    {formatAmount(t.amount)}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => onEdit(t)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(t.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        );
      })}
    </div>
  );
}
