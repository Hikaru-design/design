"use client";

import { Card as CardUI, CardContent } from "@/components/ui/card";
import { Card, Transaction } from "@/lib/types";
import {
  getBillingPeriod,
  getNextPaymentDate,
  getTransactionsInPeriod,
  getDaysUntil,
  formatDateJa,
} from "@/lib/billing";
import { AlertTriangle, CalendarClock, Settings2 } from "lucide-react";

interface CardDashboardProps {
  cards: Card[];
  transactions: Transaction[];
  onOpenSettings: () => void;
}

function fmt(n: number) {
  return n.toLocaleString("ja-JP");
}

export function CardDashboard({
  cards,
  transactions,
  onOpenSettings,
}: CardDashboardProps) {
  const today = new Date();

  // 現金カードは除外
  const creditCards = cards.filter((c) => c.id !== "cash");

  if (creditCards.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12 text-sm">
        カードが登録されていません
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {creditCards.map((card) => {
        const hasSettings = card.closingDay != null && card.paymentDay != null;

        if (!hasSettings) {
          return (
            <CardUI key={card.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: card.color }}
                  />
                  <span className="font-semibold text-sm">{card.name}</span>
                </div>
                <button
                  onClick={onOpenSettings}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  締め日・支払日を設定してください
                </button>
              </CardContent>
            </CardUI>
          );
        }

        const { start, end } = getBillingPeriod(card.closingDay!, today);
        const cycleTransactions = getTransactionsInPeriod(
          transactions,
          card.id,
          start,
          end
        );
        const totalAmount = cycleTransactions.reduce(
          (sum, t) => sum + t.amount,
          0
        );

        const paymentDate = getNextPaymentDate(
          card.closingDay!,
          card.paymentDay!,
          today
        );
        const daysUntilPayment = getDaysUntil(paymentDate, today);

        const hasBudget = card.budgetAmount != null && card.budgetAmount > 0;
        const usageRate = hasBudget
          ? Math.min((totalAmount / card.budgetAmount!) * 100, 100)
          : 0;
        const isOver = hasBudget && totalAmount > card.budgetAmount!;
        const isWarning = hasBudget && usageRate >= 80 && !isOver;

        const barColor = isOver
          ? "bg-rose-500"
          : isWarning
          ? "bg-amber-400"
          : "bg-primary";

        return (
          <CardUI key={card.id} className={isOver ? "border-rose-300" : ""}>
            <CardContent className="p-4 space-y-3">
              {/* ヘッダー */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: card.color }}
                  />
                  <span className="font-semibold text-sm">{card.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDateJa(start)}〜{formatDateJa(end)}
                </span>
              </div>

              {/* 利用額 */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">今サイクルの利用額</p>
                  <p
                    className={`text-2xl font-bold ${
                      isOver ? "text-rose-500" : "text-foreground"
                    }`}
                  >
                    ¥{fmt(totalAmount)}
                  </p>
                </div>
                {hasBudget && (
                  <p className="text-xs text-muted-foreground mb-1">
                    予算 ¥{fmt(card.budgetAmount!)}
                  </p>
                )}
              </div>

              {/* 予算プログレスバー */}
              {hasBudget && (
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
                          予算超過 ¥{fmt(totalAmount - card.budgetAmount!)}オーバー
                        </span>
                      ) : isWarning ? (
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          残り ¥{fmt(card.budgetAmount! - totalAmount)}
                        </span>
                      ) : (
                        `残り ¥${fmt(card.budgetAmount! - totalAmount)}`
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(usageRate)}%
                    </span>
                  </div>
                </div>
              )}

              {/* 支払日 */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-t pt-2">
                <CalendarClock className="h-3.5 w-3.5" />
                <span>
                  次回支払日:{" "}
                  <span className="font-medium text-foreground">
                    {formatDateJa(paymentDate)}
                  </span>
                  {daysUntilPayment > 0 ? (
                    <span className="ml-1">（あと{daysUntilPayment}日）</span>
                  ) : daysUntilPayment === 0 ? (
                    <span className="ml-1 text-rose-500 font-medium">（今日！）</span>
                  ) : (
                    <span className="ml-1 text-rose-500">（{Math.abs(daysUntilPayment)}日超過）</span>
                  )}
                </span>
              </div>
            </CardContent>
          </CardUI>
        );
      })}
    </div>
  );
}
