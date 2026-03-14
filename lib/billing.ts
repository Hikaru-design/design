import { Transaction } from "./types";

// 締め日ベースの請求サイクル期間を返す
export function getBillingPeriod(
  closingDay: number,
  today: Date
): { start: Date; end: Date } {
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  if (day <= closingDay) {
    // 締め日前: 前月(closingDay+1)〜今月closingDay
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    return {
      start: new Date(prevYear, prevMonth, closingDay + 1),
      end: new Date(year, month, closingDay),
    };
  } else {
    // 締め日後: 今月(closingDay+1)〜来月closingDay
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    return {
      start: new Date(year, month, closingDay + 1),
      end: new Date(nextYear, nextMonth, closingDay),
    };
  }
}

// 次回支払日を返す（締め日の翌月のpaymentDay）
export function getNextPaymentDate(
  closingDay: number,
  paymentDay: number,
  today: Date
): Date {
  const { end } = getBillingPeriod(closingDay, today);
  const closingMonth = end.getMonth();
  const closingYear = end.getFullYear();
  const payMonth = closingMonth === 11 ? 0 : closingMonth + 1;
  const payYear = closingMonth === 11 ? closingYear + 1 : closingYear;
  return new Date(payYear, payMonth, paymentDay);
}

// 請求サイクル内のカード支出取引を絞り込む
export function getTransactionsInPeriod(
  transactions: Transaction[],
  cardId: string,
  start: Date,
  end: Date
): Transaction[] {
  return transactions.filter((t) => {
    const d = new Date(t.date);
    return (
      t.cardId === cardId &&
      t.type === "expense" &&
      d >= start &&
      d <= end
    );
  });
}

// 残り日数を計算
export function getDaysUntil(target: Date, today: Date): number {
  const diffMs = target.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// 日付を「M月D日」形式にフォーマット
export function formatDateJa(date: Date): string {
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}
