"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Transaction, Category } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface ChartsProps {
  transactions: Transaction[];
  allTransactions: Transaction[];
  categories: Category[];
  categoryBudgets?: Record<string, number>;
}

const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

export function Charts({ transactions, allTransactions, categories, categoryBudgets = {} }: ChartsProps) {
  // Category pie chart data
  const expenseByCategory: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] ?? 0) + t.amount;
    });

  const pieData = Object.entries(expenseByCategory)
    .map(([id, value]) => ({
      name: categories.find((c) => c.id === id)?.name ?? id,
      value,
      color: categories.find((c) => c.id === id)?.color ?? "#6b7280",
    }))
    .sort((a, b) => b.value - a.value);

  // Monthly bar chart data (last 6 months)
  const now = new Date();
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    const monthTx = allTransactions.filter((t) => t.date.startsWith(prefix));
    const income = monthTx
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTx
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    monthlyData.push({
      name: `${month}月`,
      収入: income,
      支出: expense,
    });
  }

  const fmt = (v: number) =>
    v >= 10000 ? `¥${(v / 10000).toFixed(1)}万` : `¥${v.toLocaleString()}`;

  // カテゴリ別予算データ（使用率順）
  const budgetedCategories = Object.keys(categoryBudgets)
    .map((id) => {
      const budget = categoryBudgets[id];
      const used = expenseByCategory[id] ?? 0;
      const rate = Math.min((used / budget) * 100, 100);
      const cat = categories.find((c) => c.id === id);
      return { id, name: cat?.name ?? id, color: cat?.color ?? "#6b7280", budget, used, rate };
    })
    .sort((a, b) => b.rate - a.rate);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            カテゴリ別支出
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">
              データがありません
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`¥${Number(value).toLocaleString()}`, ""]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            月別収支（直近6ヶ月）
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={fmt}
                width={52}
              />
              <Tooltip
                formatter={(value) => [`¥${Number(value).toLocaleString()}`, ""]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs">{value}</span>}
              />
              <Bar dataKey="収入" fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="支出" fill="#f43f5e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* カテゴリ別予算 */}
      {budgetedCategories.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              カテゴリ別予算
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgetedCategories.map(({ id, name, color, budget, used, rate }) => {
              const isOver = used > budget;
              const isWarning = !isOver && rate >= 80;
              const barColor = isOver ? "bg-rose-500" : isWarning ? "bg-amber-400" : "bg-primary";
              const textColor = isOver ? "text-rose-500" : isWarning ? "text-amber-500" : "text-muted-foreground";
              return (
                <div key={id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-sm font-medium">{name}</span>
                      {(isOver || isWarning) && <AlertTriangle className={`h-3.5 w-3.5 ${textColor}`} />}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ¥{used.toLocaleString("ja-JP")} / ¥{budget.toLocaleString("ja-JP")}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${rate}%` }} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-medium ${textColor}`}>
                      {isOver
                        ? `超過 ¥${(used - budget).toLocaleString("ja-JP")}オーバー`
                        : `残り ¥${(budget - used).toLocaleString("ja-JP")}`}
                    </span>
                    <span className="text-xs text-muted-foreground">{Math.round(rate)}%</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
