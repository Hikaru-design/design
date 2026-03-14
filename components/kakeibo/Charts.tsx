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
  Label,
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

// Custom tooltip component for M3 look
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-xl px-4 py-3 shadow-xl text-sm">
      {label && <p className="type-caption1 text-muted-foreground mb-1.5">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2.5 type-footnote py-0.5">
          {p.color && (
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
          )}
          <span className="text-muted-foreground">{p.name}</span>
          <span className="font-bold text-foreground ml-auto pl-4">
            ¥{Number(p.value).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

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

  const totalExpense = pieData.reduce((s, d) => s + d.value, 0);

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
    monthlyData.push({ name: `${month}月`, 収入: income, 支出: expense });
  }

  const fmt = (v: number) =>
    v >= 10000 ? `¥${(v / 10000).toFixed(1)}万` : `¥${v.toLocaleString()}`;

  // カテゴリ別予算データ（使用率順）
  const budgetedCategories = Object.keys(categoryBudgets)
    .map((id) => {
      const budget = categoryBudgets[id];
      const used = expenseByCategory[id] ?? 0;
      const rawRate = (used / budget) * 100;
      const rate = Math.min(rawRate, 100);
      const cat = categories.find((c) => c.id === id);
      return { id, name: cat?.name ?? id, color: cat?.color ?? "#6b7280", budget, used, rate, rawRate };
    })
    .sort((a, b) => b.rawRate - a.rawRate);

  return (
    <div className="space-y-4">
      {/* Pie chart */}
      <Card className="glass-card rounded-2xl animate-fade-in-up">
        <CardHeader className="pb-2">
          <CardTitle className="type-footnote font-semibold text-muted-foreground uppercase tracking-wider">
            カテゴリ別支出
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length === 0 ? (
            <p className="text-center text-muted-foreground type-callout py-8">
              データがありません
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="44%"
                  innerRadius={62}
                  outerRadius={96}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      const vb = viewBox as { cx?: number; cy?: number };
                      const cx = vb.cx ?? 0;
                      const cy = vb.cy ?? 0;
                      return (
                        <g>
                          <text x={cx} y={cy - 8} textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">
                            支出合計
                          </text>
                          <text x={cx} y={cy + 11} textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--foreground)">
                            {totalExpense >= 10000
                              ? `¥${(totalExpense / 10000).toFixed(1)}万`
                              : `¥${totalExpense.toLocaleString()}`}
                          </text>
                        </g>
                      );
                    }}
                  />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="type-caption1">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Bar chart */}
      <Card className="glass-card rounded-2xl animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <CardHeader className="pb-2">
          <CardTitle className="type-footnote font-semibold text-muted-foreground uppercase tracking-wider">
            月別収支（直近6ヶ月）
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={fmt}
                width={52}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="type-caption1">{value}</span>}
              />
              <Bar dataKey="収入" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="支出" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category budgets */}
      {budgetedCategories.length > 0 && (
        <Card className="glass-card rounded-2xl animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="type-footnote font-semibold text-muted-foreground uppercase tracking-wider">
              カテゴリ別予算
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgetedCategories.map(({ id, name, color, budget, used, rate, rawRate }) => {
              const isOver = used > budget;
              const isWarning = !isOver && rawRate >= 80;
              const barColorClass = isOver ? "bg-destructive" : isWarning ? "bg-warning" : "bg-primary";
              const textColorClass = isOver ? "text-destructive" : isWarning ? "text-warning" : "text-muted-foreground";
              return (
                <div key={id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="type-subheadline font-medium">{name}</span>
                      {(isOver || isWarning) && (
                        <AlertTriangle className={`h-3.5 w-3.5 ${textColorClass}`} />
                      )}
                    </div>
                    <span className="type-caption1 text-muted-foreground">
                      ¥{used.toLocaleString("ja-JP")} / ¥{budget.toLocaleString("ja-JP")}
                    </span>
                  </div>
                  {/* Progress bar with percentage pill */}
                  <div className="relative">
                    <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-[width] duration-700 ease-out ${barColorClass}`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`type-caption1 font-medium ${textColorClass}`}>
                      {isOver
                        ? `超過 ¥${(used - budget).toLocaleString("ja-JP")} オーバー`
                        : `残り ¥${(budget - used).toLocaleString("ja-JP")}`}
                    </span>
                    <span
                      className={`type-caption2 font-semibold px-1.5 py-0.5 rounded-full ${
                        isOver
                          ? "bg-destructive/10 text-destructive"
                          : isWarning
                          ? "bg-warning/10 text-warning"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {Math.round(rawRate)}%
                    </span>
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
