"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Transaction } from "@/lib/types";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface SummaryCardProps {
  transactions: Transaction[];
}

export function SummaryCard({ transactions }: SummaryCardProps) {
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
