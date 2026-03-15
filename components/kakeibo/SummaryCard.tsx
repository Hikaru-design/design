"use client";

import { Transaction } from "@/lib/types";
import { TrendingUp, TrendingDown, Wallet, AlertTriangle } from "lucide-react";

interface SummaryCardProps {
  transactions: Transaction[];
  monthlyBudget?: number | null;
}

export function SummaryCard({ transactions, monthlyBudget }: SummaryCardProps) {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;

  function fmt(n: number) {
    return n.toLocaleString("ja-JP");
  }

  // ── 予算モード ──
  if (monthlyBudget && monthlyBudget > 0) {
    const rawRate = (expense / monthlyBudget) * 100;
    const usageRate = Math.min(rawRate, 100);
    const remaining = monthlyBudget - expense;
    const isOver = expense > monthlyBudget;
    const isWarning = !isOver && usageRate >= 80;

    const barGradient = isOver
      ? "linear-gradient(90deg, oklch(0.58 0.22 25), oklch(0.65 0.20 15))"
      : isWarning
      ? "linear-gradient(90deg, oklch(0.68 0.18 55), oklch(0.72 0.16 45))"
      : "linear-gradient(90deg, oklch(0.44 0.18 168), oklch(0.50 0.16 192))";

    return (
      <div
        className={`rounded-3xl overflow-hidden transition-all duration-300 ${isOver ? "animate-budget-shake" : ""}`}
        style={{
          background: isOver
            ? "linear-gradient(135deg, oklch(0.58 0.22 25 / 0.08), oklch(0.98 0.005 168))"
            : "linear-gradient(135deg, oklch(0.44 0.18 168), oklch(0.50 0.16 192))",
          boxShadow: isOver
            ? "0 8px 32px oklch(0.58 0.22 25 / 0.20), 0 2px 8px oklch(0 0 0 / 0.08)"
            : "0 8px 32px oklch(0.44 0.18 168 / 0.35), 0 2px 8px oklch(0 0 0 / 0.10)",
        }}
      >
        {!isOver ? (
          /* Teal gradient header */
          <div className="px-5 pt-5 pb-4">
            {/* Over-budget banner */}
            <div className="flex items-center justify-between mb-1">
              <p className="type-caption1 font-semibold" style={{ color: "oklch(0.90 0.06 168)" }}>
                今月の支出
              </p>
              <span
                className="type-caption2 font-bold px-2.5 py-0.5 rounded-full"
                style={{
                  background: "oklch(1 0 0 / 0.18)",
                  color: "oklch(0.95 0.04 168)",
                }}
              >
                {Math.round(rawRate)}%
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-xl font-bold text-white">¥</span>
              <span className="type-large-title text-white">{fmt(expense)}</span>
              <span className="type-caption1 ml-2" style={{ color: "oklch(0.88 0.06 168)" }}>
                / ¥{fmt(monthlyBudget)}
              </span>
            </div>

            {/* Progress bar */}
            <div
              className="w-full h-2.5 rounded-full overflow-hidden"
              style={{ background: "oklch(1 0 0 / 0.20)" }}
            >
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out"
                style={{
                  width: `${usageRate}%`,
                  background: isWarning
                    ? "linear-gradient(90deg, oklch(0.90 0.18 55), oklch(0.95 0.16 45))"
                    : "oklch(1 0 0 / 0.90)",
                  boxShadow: "0 0 8px oklch(1 0 0 / 0.40)",
                }}
              />
            </div>

            {/* Bottom row */}
            <div className="flex items-center justify-between mt-3">
              <span className="type-caption1 font-medium flex items-center gap-1" style={{ color: isWarning ? "oklch(0.95 0.16 55)" : "oklch(0.92 0.05 168)" }}>
                {isWarning && <AlertTriangle className="h-3 w-3" />}
                残り ¥{fmt(remaining)}
              </span>
            </div>
          </div>
        ) : (
          /* Over budget: light card with red accent */
          <div className="px-5 pt-5 pb-4" style={{ background: "oklch(0.985 0.004 168)" }}>
            <div
              className="flex items-center gap-2 rounded-2xl px-3 py-2 mb-3"
              style={{ background: "oklch(0.93 0.05 25 / 0.30)", border: "1px solid oklch(0.58 0.22 25 / 0.25)" }}
            >
              <AlertTriangle className="h-4 w-4 flex-shrink-0" style={{ color: "oklch(0.58 0.22 25)" }} />
              <p className="type-caption1 font-semibold" style={{ color: "oklch(0.48 0.22 25)" }}>
                予算を ¥{fmt(expense - monthlyBudget)} オーバーしています
              </p>
            </div>
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="type-caption1 text-muted-foreground mb-1">今月の支出</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold" style={{ color: "oklch(0.58 0.22 25)" }}>¥</span>
                  <span className="type-large-title" style={{ color: "oklch(0.58 0.22 25)" }}>{fmt(expense)}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="type-caption2 text-muted-foreground">予算</p>
                <p className="type-footnote font-semibold text-muted-foreground">¥{fmt(monthlyBudget)}</p>
              </div>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden bg-muted">
              <div
                className="h-full rounded-full"
                style={{ width: "100%", background: barGradient }}
              />
            </div>
            <div className="flex justify-end mt-1.5">
              <span className="type-caption1 font-medium" style={{ color: "oklch(0.58 0.22 25)" }}>
                {Math.round(rawRate)}%
              </span>
            </div>
          </div>
        )}

        {/* Footer stats — glassmorphism strip */}
        <div
          className="flex gap-4 px-5 py-3"
          style={{
            background: isOver ? "oklch(0.92 0.009 168)" : "oklch(0 0 0 / 0.12)",
            borderTop: isOver ? "1px solid oklch(0.82 0.02 168)" : "1px solid oklch(1 0 0 / 0.15)",
          }}
        >
          <span className="flex items-center gap-1.5 type-caption1" style={{ color: isOver ? undefined : "oklch(0.92 0.05 168)" }}>
            <TrendingUp className="h-3.5 w-3.5" style={{ color: isOver ? "oklch(0.52 0.18 142)" : "oklch(0.80 0.14 142)" }} />
            <span className={isOver ? "text-muted-foreground" : ""}>収入</span>
            <span className="font-semibold" style={{ color: isOver ? "oklch(0.52 0.18 142)" : "oklch(0.88 0.10 142)" }}>
              ¥{fmt(income)}
            </span>
          </span>
          <span className="flex items-center gap-1.5 type-caption1" style={{ color: isOver ? undefined : "oklch(0.92 0.05 168)" }}>
            <Wallet className="h-3.5 w-3.5" style={{ color: isOver ? (balance >= 0 ? "oklch(0.52 0.18 142)" : "oklch(0.58 0.22 25)") : "oklch(0.92 0.05 168)" }} />
            <span className={isOver ? "text-muted-foreground" : ""}>収支</span>
            <span
              className="font-semibold"
              style={{
                color: isOver
                  ? (balance >= 0 ? "oklch(0.52 0.18 142)" : "oklch(0.58 0.22 25)")
                  : "oklch(1 0 0 / 0.95)",
              }}
            >
              {balance >= 0 ? "+" : ""}¥{fmt(balance)}
            </span>
          </span>
        </div>
      </div>
    );
  }

  // ── 通常モード（予算未設定）──
  const isPositive = balance >= 0;

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, oklch(0.44 0.18 168), oklch(0.50 0.16 192))",
        boxShadow: "0 8px 32px oklch(0.44 0.18 168 / 0.35), 0 2px 8px oklch(0 0 0 / 0.10)",
      }}
    >
      <div className="px-5 pt-5 pb-4">
        <p className="type-caption1 font-semibold mb-1" style={{ color: "oklch(0.90 0.06 168)" }}>
          今月の収支
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-white">{isPositive ? "+" : ""}¥</span>
          <span className="type-large-title text-white">{fmt(Math.abs(balance))}</span>
        </div>
      </div>

      {/* Stats strip */}
      <div
        className="flex gap-6 px-5 py-3"
        style={{
          background: "oklch(0 0 0 / 0.12)",
          borderTop: "1px solid oklch(1 0 0 / 0.15)",
        }}
      >
        <span className="flex items-center gap-1.5 type-callout" style={{ color: "oklch(0.92 0.05 168)" }}>
          <TrendingUp className="h-4 w-4" style={{ color: "oklch(0.80 0.14 142)" }} />
          収入
          <span className="font-semibold" style={{ color: "oklch(0.88 0.10 142)" }}>¥{fmt(income)}</span>
        </span>
        <span className="flex items-center gap-1.5 type-callout" style={{ color: "oklch(0.92 0.05 168)" }}>
          <TrendingDown className="h-4 w-4" style={{ color: "oklch(0.88 0.16 25)" }} />
          支出
          <span className="font-semibold" style={{ color: "oklch(0.92 0.14 25)" }}>¥{fmt(expense)}</span>
        </span>
      </div>
    </div>
  );
}
