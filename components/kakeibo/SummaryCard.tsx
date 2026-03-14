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

  // 予算モード
  if (monthlyBudget && monthlyBudget > 0) {
    const usageRate = Math.min((expense / monthlyBudget) * 100, 100);
    const remaining = monthlyBudget - expense;
    const isOver = expense > monthlyBudget;
    const isWarning = !isOver && usageRate >= 80;

    const barColor = isOver
      ? "bg-rose-500"
      : isWarning
      ? "bg-amber-400"
      : "bg-primary";

    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          {/* 支出 vs 予算 */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">今月の支出</p>
              <p className={`text-2xl font-bold ${isOver ? "text-rose-500" : "text-foreground"}`}>
                ¥{fmt(expense)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mb-1">
              予算 ¥{fmt(monthlyBudget)}
            </p>
          </div>

          {/* プログレスバー */}
          <div className="space-y-1">
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${barColor}`}
                style={{ width: `${usageRate}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span
                className={`text-xs font-medium ${
                  isOver
                    ? "text-rose-500"
                    : isWarning
                    ? "text-amber-500"
                    : "text-muted-foreground"
                }`}
              >
                {isOver ? (
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    予算超過 ¥{fmt(expense - monthlyBudget)}オーバー
                  </span>
                ) : isWarning ? (
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    残り ¥{fmt(remaining)}
                  </span>
                ) : (
                  `残り ¥${fmt(remaining)}`
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.round(usageRate)}%
              </span>
            </div>
          </div>

          {/* 補足：収入・収支 */}
          <div className="flex gap-4 text-xs text-muted-foreground border-t pt-2">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              収入 ¥{fmt(income)}
            </span>
            <span className="flex items-center gap-1">
              <Wallet className="h-3 w-3" />
              収支{" "}
              <span className={balance >= 0 ? "text-emerald-600" : "text-rose-500"}>
                {balance >= 0 ? "+" : ""}¥{fmt(balance)}
              </span>
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 通常モード（予算未設定）
  return (
    <div className="grid grid-cols-3 gap-3">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">収入</span>
          </div>
          <p className="text-lg font-bold text-emerald-600">
            ¥{fmt(income)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-rose-500 mb-1">
            <TrendingDown className="h-4 w-4" />
            <span className="text-xs font-medium">支出</span>
          </div>
          <p className="text-lg font-bold text-rose-500">
            ¥{fmt(expense)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Wallet className="h-4 w-4" />
            <span className="text-xs font-medium">残高</span>
          </div>
          <p
            className={`text-lg font-bold ${
              balance >= 0 ? "text-emerald-600" : "text-rose-500"
            }`}
          >
            {balance >= 0 ? "+" : ""}¥{fmt(balance)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
