"use client";

import { Card, CardContent } from "@/components/ui/card";
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

    const barColorClass = isOver
      ? "bg-destructive"
      : isWarning
      ? "bg-warning"
      : "bg-primary";

    const amountColorClass = isOver
      ? "text-destructive"
      : "text-foreground";

    return (
      <Card
        className={`overflow-hidden transition-colors ${
          isOver ? "border-destructive/40 bg-destructive/5" : ""
        }`}
        style={{ boxShadow: "var(--md-elevation-1)" }}
      >
        {/* Over-budget top banner */}
        {isOver && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-destructive/10 border-b border-destructive/20">
            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
            <p className="type-caption1 font-semibold text-destructive">
              予算を ¥{fmt(expense - monthlyBudget)} オーバーしています
            </p>
          </div>
        )}

        <CardContent className="p-4 space-y-3">
          {/* Hero: 今月の支出 */}
          <div className="flex items-end justify-between">
            <div>
              <p className="type-caption1 text-muted-foreground mb-1">今月の支出</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-bold ${amountColorClass}`}>¥</span>
                <span className={`type-large-title ${amountColorClass}`}>
                  {fmt(expense)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="type-caption2 text-muted-foreground">予算</p>
              <p className="type-footnote font-semibold text-muted-foreground">
                ¥{fmt(monthlyBudget)}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-[width] duration-700 ease-out ${barColorClass} ${
                  isOver ? "animate-budget-shake" : ""
                }`}
                style={{ width: `${usageRate}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span
                className={`type-caption1 font-medium flex items-center gap-1 ${
                  isOver
                    ? "text-destructive"
                    : isWarning
                    ? "text-warning"
                    : "text-muted-foreground"
                }`}
              >
                {isWarning && <AlertTriangle className="h-3 w-3" />}
                {isOver
                  ? `予算超過`
                  : `残り ¥${fmt(remaining)}`}
              </span>
              <span className="type-caption1 text-muted-foreground font-medium">
                {Math.round(rawRate)}%
              </span>
            </div>
          </div>

          {/* Footer: 収入 · 収支 */}
          <div className="flex gap-4 border-t border-border pt-2.5">
            <span className="flex items-center gap-1.5 type-caption1 text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-income" />
              収入
              <span className="font-medium text-income">¥{fmt(income)}</span>
            </span>
            <span className="flex items-center gap-1.5 type-caption1 text-muted-foreground">
              <Wallet className="h-3.5 w-3.5" />
              収支
              <span
                className={`font-medium ${
                  balance >= 0 ? "text-income" : "text-destructive"
                }`}
              >
                {balance >= 0 ? "+" : ""}¥{fmt(balance)}
              </span>
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── 通常モード（予算未設定）——
  return (
    <Card style={{ boxShadow: "var(--md-elevation-1)" }}>
      <CardContent className="p-4 space-y-3">
        {/* Hero: 収支 */}
        <div>
          <p className="type-caption1 text-muted-foreground mb-1">今月の収支</p>
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-bold ${balance >= 0 ? "text-income" : "text-destructive"}`}>¥</span>
            <span className={`type-large-title ${balance >= 0 ? "text-income" : "text-destructive"}`}>
              {balance >= 0 ? "+" : ""}{fmt(balance)}
            </span>
          </div>
        </div>

        {/* 収入 · 支出 */}
        <div className="flex gap-6 border-t border-border pt-2.5">
          <span className="flex items-center gap-1.5 type-callout text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-income" />
            収入
            <span className="font-semibold text-income">¥{fmt(income)}</span>
          </span>
          <span className="flex items-center gap-1.5 type-callout text-muted-foreground">
            <TrendingDown className="h-4 w-4 text-destructive" />
            支出
            <span className="font-semibold text-destructive">¥{fmt(expense)}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
