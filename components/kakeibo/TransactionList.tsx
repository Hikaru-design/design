"use client";

import { Transaction, Category, Card } from "@/lib/types";

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
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const dow = DAY_NAMES[date.getDay()];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    return { formatted: `${m}月${d}日`, dow, isWeekend };
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="type-callout text-muted-foreground text-center">
          取引がありません
        </p>
        <p className="type-caption1 text-muted-foreground/70 text-center mt-1">
          右下の + ボタンから追加してください
        </p>
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
      {sortedDates.map((date, dateIndex) => {
        const dayExpense = grouped[date]
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);
        const dayIncome = grouped[date]
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);

        const { formatted, dow, isWeekend } = formatDateHeader(date);

        return (
          <div 
            key={date} 
            className="animate-fade-in-up"
            style={{ animationDelay: `${dateIndex * 50}ms` }}
          >
            {/* Date section header */}
            <div className="flex items-center justify-between px-1 mb-2">
              <div className="flex items-center gap-2">
                <span className="type-subheadline text-foreground font-semibold">
                  {formatted}
                </span>
                <span className={`type-caption1 px-1.5 py-0.5 rounded-md font-medium ${
                  isWeekend 
                    ? "bg-destructive/10 text-destructive" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {dow}
                </span>
              </div>
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
            <div className="space-y-2">
              {grouped[date].map((t, txIndex) => {
                const categoryColor =
                  t.type === "income" ? "var(--color-income)" : getCategoryColor(t.category);
                const cardName = getCardName(t.cardId);
                const cardColor = getCardColor(t.cardId);

                return (
                  <div 
                    key={t.id} 
                    className="glass-card rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md active:scale-[0.99]"
                    style={{ animationDelay: `${(dateIndex * 50) + (txIndex * 30)}ms` }}
                  >
                    <div
                      className="flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none"
                      onClick={() => onEdit(t)}
                    >
                      {/* Category color circle */}
                      <div
                        className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center transition-transform hover:scale-105"
                        style={{ backgroundColor: `${categoryColor}18` }}
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: categoryColor }}
                        />
                      </div>

                      {/* Middle: category + memo + card badge */}
                      <div className="flex-1 min-w-0">
                        <p className="type-subheadline font-semibold text-foreground truncate">
                          {getCategoryName(t.category)}
                        </p>
                        {t.memo && (
                          <p className="type-caption1 text-muted-foreground truncate mt-0.5">
                            {t.memo}
                          </p>
                        )}
                        {cardName && (
                          <span
                            className="inline-flex items-center mt-1 px-2 py-0.5 rounded-lg type-caption2 font-medium"
                            style={{
                              backgroundColor: `${cardColor}15`,
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
                          className={`type-headline font-bold ${
                            t.type === "income" ? "text-income" : "text-foreground"
                          }`}
                        >
                          {t.type === "income" ? "+" : "-"}¥{formatAmount(t.amount)}
                        </p>
                        <span className={`type-caption2 px-1.5 py-0.5 rounded-md ${
                          t.type === "income" 
                            ? "bg-income/10 text-income" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {t.type === "income" ? "収入" : "支出"}
                        </span>
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
