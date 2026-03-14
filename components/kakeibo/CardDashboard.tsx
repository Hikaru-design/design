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
      <div className="text-center text-muted-foreground py-12 type-callout">
        カードが登録されていません
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
    <div className="space-y-3">
      {sortedCards.map(({ card, risk }, sortedIndex) => {
        const hasSettings = card.closingDay != null && card.paymentDay != null;

        if (!hasSettings) {
          return (
            <CardUI key={card.id} style={{ boxShadow: "var(--md-elevation-1)" }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: card.color }}
                  />
                  <span className="type-subheadline font-semibold">{card.name}</span>
                </div>
                <button
                  onClick={onOpenSettings}
                  className="flex items-center gap-1.5 type-caption1 text-muted-foreground hover:text-foreground transition-colors state-layer px-2 py-1.5 rounded-lg"
                >
                  <Settings2 className="h-3.5 w-3.5" />
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
            ? "border-2 border-destructive/60 bg-destructive/5"
            : risk === "warning"
            ? "border border-warning/50"
            : "";

        // Show ring on highest-risk (sortedIndex === 0) and it has budget
        const showRing = sortedIndex === 0 && hasBudget;

        return (
          <CardUI
            key={card.id}
            className={`overflow-hidden ${cardClassName}`}
            style={{ boxShadow: "var(--md-elevation-1)" }}
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

            <CardContent className="p-4 space-y-3">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: card.color }}
                  />
                  <span className="type-subheadline font-semibold">{card.name}</span>
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
                    className="flex items-center gap-1 type-caption1 font-medium text-primary state-layer px-2.5 py-1.5 rounded-lg border border-primary/30 bg-primary/5 transition-colors hover:bg-primary/10"
                  >
                    <Plus className="h-3.5 w-3.5" />
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
