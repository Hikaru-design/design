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
import { AlertTriangle, CalendarClock, Settings2, TrendingUp, Plus, Zap } from "lucide-react";

interface CardDashboardProps {
  cards: Card[];
  transactions: Transaction[];
  onOpenSettings: () => void;
  onQuickAdd?: (cardId: string) => void;
}

type CardRisk = "danger" | "warning" | "safe" | "unconfigured";
const riskOrder: Record<CardRisk, number> = { danger: 0, warning: 1, safe: 2, unconfigured: 3 };

function fmt(n: number) {
  return n.toLocaleString("ja-JP");
}

// SVG Circular Progress Ring
function CircularRing({
  rate,
  isOver,
  isWarning,
  size = 80,
}: {
  rate: number;
  isOver: boolean;
  isWarning: boolean;
  size?: number;
}) {
  const r = size / 2 - 6;
  const circumference = 2 * Math.PI * r;
  const clampedRate = Math.min(rate, 100);
  const strokeDashoffset = circumference * (1 - clampedRate / 100);
  const color = isOver
    ? "var(--destructive)"
    : isWarning
    ? "var(--color-warning)"
    : "var(--primary)";
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      {/* Track */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="var(--muted)"
        strokeWidth="7"
      />
      {/* Fill */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dashoffset 0.7s ease-out" }}
      />
      {/* Center label */}
      <text
        x={cx} y={cy - 6}
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill={isOver || isWarning ? color : "currentColor"}
      >
        {Math.round(rate)}%
      </text>
      <text
        x={cx} y={cy + 8}
        textAnchor="middle"
        fontSize="9"
        fill="var(--muted-foreground)"
      >
        使用
      </text>
    </svg>
  );
}

export function CardDashboard({
  cards,
  transactions,
  onOpenSettings,
  onQuickAdd,
}: CardDashboardProps) {
  const today = new Date();

  const creditCards = cards.filter((c) => c.id !== "cash");

  if (creditCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <p className="type-callout text-muted-foreground text-center">
          カードが登録されていません
        </p>
        <p className="type-caption1 text-muted-foreground/70 text-center mt-1">
          設定からカードを追加してください
        </p>
      </div>
    );
  }

  // Compute risk for each card, then sort
  const cardsWithRisk = creditCards.map((card) => {
    const hasSettings = card.closingDay != null && card.paymentDay != null;
    if (!hasSettings) return { card, risk: "unconfigured" as CardRisk, usageRate: 0 };

    const { start, end } = getBillingPeriod(card.closingDay!, today);
    const cycleTransactions = getTransactionsInPeriod(transactions, card.id, start, end);
    const totalAmount = cycleTransactions.reduce((sum, t) => sum + t.amount, 0);

    const hasBudget = card.budgetAmount != null && card.budgetAmount > 0;
    const rawRate = hasBudget ? (totalAmount / card.budgetAmount!) * 100 : 0;
    const isOver = hasBudget && totalAmount > card.budgetAmount!;
    const isWarning = hasBudget && rawRate >= 80 && !isOver;

    let risk: CardRisk = "safe";
    if (!hasBudget) risk = "safe";
    else if (isOver) risk = "danger";
    else if (isWarning) risk = "warning";

    return { card, risk, usageRate: rawRate };
  });

  const sortedCards = [...cardsWithRisk].sort(
    (a, b) => riskOrder[a.risk] - riskOrder[b.risk]
  );

  return (
    <div className="space-y-4">
      {sortedCards.map(({ card, risk }, sortedIndex) => {
        const hasSettings = card.closingDay != null && card.paymentDay != null;

        if (!hasSettings) {
          return (
            <CardUI 
              key={card.id} 
              className="glass-card rounded-2xl animate-fade-in-up"
              style={{ animationDelay: `${sortedIndex * 80}ms` }}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${card.color}20` }}
                  >
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: card.color }}
                    />
                  </div>
                  <span className="type-headline font-semibold">{card.name}</span>
                </div>
                <button
                  onClick={onOpenSettings}
                  className="flex items-center gap-2 type-footnote text-muted-foreground hover:text-foreground transition-all px-4 py-3 rounded-xl bg-muted/50 hover:bg-muted w-full"
                >
                  <Settings2 className="h-4 w-4" />
                  締め日・支払日を設定してください
                </button>
              </CardContent>
            </CardUI>
          );
        }

        const { start, end } = getBillingPeriod(card.closingDay!, today);
        const cycleTransactions = getTransactionsInPeriod(transactions, card.id, start, end);
        const totalAmount = cycleTransactions.reduce((sum, t) => sum + t.amount, 0);

        const paymentDate = getNextPaymentDate(card.closingDay!, card.paymentDay!, today);
        const daysUntilPayment = getDaysUntil(paymentDate, today);

        const hasBudget = card.budgetAmount != null && card.budgetAmount > 0;
        const rawRate = hasBudget ? (totalAmount / card.budgetAmount!) * 100 : 0;
        const usageRate = Math.min(rawRate, 100);
        const isOver = hasBudget && totalAmount > card.budgetAmount!;
        const isWarning = hasBudget && rawRate >= 80 && !isOver;

        // Closing day projection warning
        const cycleTotalDays = getDaysUntil(end, start);
        const cycleElapsedDays = getDaysUntil(today, start);
        const cycleProgress = cycleTotalDays > 0 ? cycleElapsedDays / cycleTotalDays : 0;
        const projectedRate = hasBudget && cycleProgress > 0.05 ? rawRate / cycleProgress : 0;
        const showProjectionWarning =
          hasBudget && projectedRate > 100 && rawRate < 100 && rawRate < 80;

        // Days until closing
        const daysUntilClosing = getDaysUntil(end, today);
        const isClosingSoon = daysUntilClosing >= 0 && daysUntilClosing <= 5;

        // Payment urgency
        const paymentUrgencyClass =
          daysUntilPayment <= 0
            ? "text-destructive font-bold animate-pulse"
            : daysUntilPayment <= 6
            ? "text-destructive font-semibold"
            : daysUntilPayment <= 14
            ? "text-warning font-medium"
            : "text-muted-foreground";

        // Card border / bg based on risk
        const cardClassName =
          risk === "danger"
            ? "border-destructive/50"
            : risk === "warning"
            ? "border-warning/40"
            : "";

        // Show ring on highest-risk (sortedIndex === 0) and it has budget
        const showRing = sortedIndex === 0 && hasBudget;

        return (
          <CardUI
            key={card.id}
            className={`overflow-hidden glass-card rounded-2xl animate-fade-in-up ${cardClassName}`}
            style={{ animationDelay: `${sortedIndex * 80}ms` }}
          >
            {/* Risk badge strip */}
            {risk === "danger" && (
              <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 border-b border-destructive/20">
                <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                <span className="type-caption1 font-semibold text-destructive">
                  危険：予算超過 ¥{fmt(totalAmount - card.budgetAmount!)} オーバー
                </span>
              </div>
            )}
            {risk === "warning" && (
              <div className="flex items-center gap-2 px-4 py-2 bg-warning/10 border-b border-warning/20">
                <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
                <span className="type-caption1 font-medium text-warning">
                  注意：予算の {Math.round(rawRate)}% を使用中
                </span>
              </div>
            )}
            {showProjectionWarning && (
              <div className="flex items-center gap-2 px-4 py-2 bg-warning/10 border-b border-warning/20">
                <TrendingUp className="h-4 w-4 text-warning flex-shrink-0" />
                <span className="type-caption1 font-medium text-warning">
                  このペースでは予算超過の見込み（{Math.round(projectedRate)}% 推定）
                </span>
              </div>
            )}

            <CardContent className="p-5 space-y-4">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${card.color}20` }}
                  >
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: card.color }}
                    />
                  </div>
                  <span className="type-headline font-semibold">{card.name}</span>
                  {isClosingSoon && (
                    <span className="flex items-center gap-0.5 type-caption2 font-medium text-warning bg-warning/10 px-1.5 py-0.5 rounded-full">
                      <Zap className="h-2.5 w-2.5" />
                      締め {daysUntilClosing === 0 ? "今日" : `あと${daysUntilClosing}日`}
                    </span>
                  )}
                </div>
                <span className="type-caption2 text-muted-foreground">
                  {formatDateJa(start)}〜{formatDateJa(end)}
                </span>
              </div>

              {/* Amount + Ring */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="type-caption1 text-muted-foreground mb-0.5">今サイクルの利用額</p>
                  <div className="flex items-baseline gap-0.5">
                    <span className={`text-base font-bold ${isOver ? "text-destructive" : "text-foreground"}`}>¥</span>
                    <span className={`type-title2 ${isOver ? "text-destructive" : "text-foreground"}`}>
                      {fmt(totalAmount)}
                    </span>
                  </div>
                  {hasBudget && (
                    <p className="type-caption2 text-muted-foreground mt-0.5">
                      予算 ¥{fmt(card.budgetAmount!)}
                    </p>
                  )}
                </div>
                {showRing && (
                  <CircularRing rate={rawRate} isOver={isOver} isWarning={isWarning} size={76} />
                )}
              </div>

              {/* Linear progress bar (non-ring cards or when ring not shown) */}
              {hasBudget && !showRing && (
                <div className="space-y-1">
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-[width] duration-700 ease-out ${
                        isOver
                          ? "bg-destructive"
                          : isWarning
                          ? "bg-warning"
                          : "bg-primary"
                      }`}
                      style={{ width: `${usageRate}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={`type-caption1 font-medium ${
                        isOver ? "text-destructive" : isWarning ? "text-warning" : "text-muted-foreground"
                      }`}
                    >
                      {isOver
                        ? `超過`
                        : `残り ¥${fmt(card.budgetAmount! - totalAmount)}`}
                    </span>
                    <span className="type-caption1 text-muted-foreground">
                      {Math.round(rawRate)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Linear bar for the ring card too (below ring) */}
              {hasBudget && showRing && (
                <div className="space-y-1">
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-[width] duration-700 ease-out ${
                        isOver ? "bg-destructive" : isWarning ? "bg-warning" : "bg-primary"
                      }`}
                      style={{ width: `${usageRate}%` }}
                    />
                  </div>
                  <span className="type-caption1 text-muted-foreground">
                    {isOver
                      ? `予算超過`
                      : `残り ¥${fmt(card.budgetAmount! - totalAmount)}`}
                  </span>
                </div>
              )}

              {/* Payment date */}
              <div className="flex items-center justify-between border-t border-border pt-2.5">
                <div className="flex items-center gap-1.5 type-caption1 text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5" />
                  <span>
                    次回支払日:{" "}
                    <span className="font-medium text-foreground">{formatDateJa(paymentDate)}</span>
                    {" "}
                    <span className={paymentUrgencyClass}>
                      {daysUntilPayment > 0
                        ? `（あと${daysUntilPayment}日）`
                        : daysUntilPayment === 0
                        ? "（今日！）"
                        : `（${Math.abs(daysUntilPayment)}日超過）`}
                    </span>
                  </span>
                </div>

                {/* Quick add button */}
                {onQuickAdd && (
                  <button
                    onClick={() => onQuickAdd(card.id)}
                    className="flex items-center gap-1.5 type-footnote font-semibold text-primary px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/15 transition-all active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                    記録
                  </button>
                )}
              </div>
            </CardContent>
          </CardUI>
        );
      })}
    </div>
  );
}
