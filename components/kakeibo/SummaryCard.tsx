"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Transaction } from "@/lib/types";
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, Target } from "lucide-react";

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

    const ringColor = isOver
      ? "stroke-destructive"
      : isWarning
      ? "stroke-warning"
      : "stroke-primary";

    // SVG ring calculations
    const size = 100;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - usageRate / 100);

    return (
      <Card
        className={`overflow-hidden transition-all duration-300 glass-card animate-fade-in-up ${
          isOver ? "border-destructive/40" : ""
        }`}
      >
        {/* Over-budget top banner */}
        {isOver && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-destructive/10 border-b border-destructive/20">
            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 animate-pulse" />
            <p className="type-caption1 font-semibold text-destructive">
              予算を ¥{fmt(expense - monthlyBudget)} オーバーしています
            </p>
          </div>
        )}

        <CardContent className="p-5">
          <div className="flex items-center gap-5">
            {/* Circular progress ring */}
            <div className="relative flex-shrink-0">
              <svg width={size} height={size} className="transform -rotate-90">
                {/* Background ring */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  strokeWidth={strokeWidth}
                  className="stroke-muted"
                />
                {/* Progress ring */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  className={`${ringColor} transition-all duration-700 ease-out`}
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: offset,
                  }}
                />
              </svg>
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`type-title3 font-bold ${isOver ? "text-destructive" : isWarning ? "text-warning" : "text-primary"}`}>
                  {Math.round(rawRate)}%
                </span>
                <span className="type-caption2 text-muted-foreground">使用</span>
              </div>
            </div>

            {/* Right side content */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Expense amount */}
              <div>
                <p className="type-caption1 text-muted-foreground mb-0.5">今月の支出</p>
                <div className="flex items-baseline gap-0.5 animate-count-up">
                  <span className={`text-lg font-bold ${isOver ? "text-destructive" : "text-foreground"}`}>¥</span>
                  <span className={`type-title2 ${isOver ? "text-destructive" : "text-foreground"}`}>
                    {fmt(expense)}
                  </span>
                </div>
              </div>

              {/* Budget & remaining */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="type-caption1 text-muted-foreground">
                    予算 ¥{fmt(monthlyBudget)}
                  </span>
                </div>
                <span className={`type-caption1 font-semibold ${
                  isOver ? "text-destructive" : isWarning ? "text-warning" : "text-income"
                }`}>
                  {isOver ? `超過` : `残り ¥${fmt(remaining)}`}
                </span>
              </div>

              {/* Linear progress for detail */}
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-[width] duration-700 ease-out ${barColorClass} ${
                    isOver ? "animate-budget-shake" : ""
                  }`}
                  style={{ width: `${usageRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Footer: 収入 · 収支 */}
          <div className="flex gap-4 border-t border-border/50 mt-4 pt-3">
            <span className="flex items-center gap-1.5 type-caption1 text-muted-foreground">
              <div className="w-6 h-6 rounded-lg bg-income/15 flex items-center justify-center">
                <TrendingUp className="h-3.5 w-3.5 text-income" />
              </div>
              収入
              <span className="font-semibold text-income">¥{fmt(income)}</span>
            </span>
            <span className="flex items-center gap-1.5 type-caption1 text-muted-foreground">
              <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center">
                <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              収支
              <span
                className={`font-semibold ${
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
    <Card className="glass-card animate-fade-in-up">
      <CardContent className="p-5 space-y-4">
        {/* Hero: 収支 */}
        <div className="text-center py-2">
          <p className="type-caption1 text-muted-foreground mb-1">今月の収支</p>
          <div className="flex items-baseline justify-center gap-1 animate-count-up">
            <span className={`text-2xl font-bold ${balance >= 0 ? "text-income" : "text-destructive"}`}>¥</span>
            <span className={`type-large-title ${balance >= 0 ? "text-income" : "text-destructive"}`}>
              {balance >= 0 ? "+" : ""}{fmt(balance)}
            </span>
          </div>
        </div>

        {/* 収入 · 支出 */}
        <div className="flex justify-center gap-6 border-t border-border/50 pt-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-income/15 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-income" />
            </div>
            <div>
              <p className="type-caption2 text-muted-foreground">収入</p>
              <p className="type-subheadline font-semibold text-income">¥{fmt(income)}</p>
            </div>
          </div>
          <div className="w-px bg-border/50" />
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-expense/15 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-expense" />
            </div>
            <div>
              <p className="type-caption2 text-muted-foreground">支出</p>
              <p className="type-subheadline font-semibold text-expense">¥{fmt(expense)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
