"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Transaction, Category, Card, TransactionType } from "@/lib/types";
import { generateId } from "@/lib/storage";
import { Copy, Trash2 } from "lucide-react";

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  categories: Category[];
  cards: Card[];
  editTransaction?: Transaction | null;
  defaultCardId?: string;
  onDelete?: (id: string) => void;
  onDuplicate?: (transaction: Transaction) => void;
}

export function TransactionForm({
  open,
  onClose,
  onSave,
  categories,
  cards,
  editTransaction,
  defaultCardId,
  onDelete,
  onDuplicate,
}: TransactionFormProps) {
  const today = new Date().toISOString().split("T")[0];

  const [type, setType] = useState<TransactionType>(
    editTransaction?.type ?? "expense"
  );
  const [date, setDate] = useState(editTransaction?.date ?? today);
  const [amount, setAmount] = useState(
    editTransaction ? String(editTransaction.amount) : ""
  );
  const [category, setCategory] = useState(editTransaction?.category ?? "");
  const [cardId, setCardId] = useState(editTransaction?.cardId ?? defaultCardId ?? "");
  const [memo, setMemo] = useState(editTransaction?.memo ?? "");
  const [error, setError] = useState("");

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setType(editTransaction?.type ?? "expense");
      setDate(editTransaction?.date ?? today);
      setAmount(editTransaction ? String(editTransaction.amount) : "");
      setCategory(editTransaction?.category ?? "");
      setCardId(editTransaction?.cardId ?? defaultCardId ?? "");
      setMemo(editTransaction?.memo ?? "");
      setError("");
    }
  }, [open, editTransaction, defaultCardId]);

  const expenseCategories = categories.filter(
    (c) => !["salary", "bonus", "other-income"].includes(c.id)
  );
  const incomeCategories = categories.filter((c) =>
    ["salary", "bonus", "other-income"].includes(c.id)
  );
  const currentCategories = type === "expense" ? expenseCategories : incomeCategories;

  function handleTypeChange(val: TransactionType) {
    setType(val);
    setCategory("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return setError("日付を入力してください");
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      return setError("有効な金額を入力してください");
    if (!category) return setError("カテゴリを選択してください");

    const transaction: Transaction = {
      id: editTransaction?.id ?? generateId(),
      date,
      type,
      amount: Number(amount),
      category,
      cardId: cardId || null,
      memo,
      createdAt: editTransaction?.createdAt ?? new Date().toISOString(),
    };
    onSave(transaction);
    handleClose();
  }

  function handleDuplicate() {
    if (!editTransaction) return;
    if (!date) return setError("日付を入力してください");
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      return setError("有効な金額を入力してください");
    if (!category) return setError("カテゴリを選択してください");

    const duplicated: Transaction = {
      id: generateId(),
      date,
      type,
      amount: Number(amount),
      category,
      cardId: cardId || null,
      memo,
      createdAt: editTransaction.createdAt ?? new Date().toISOString(),
    };

    if (onDuplicate) {
      onDuplicate(duplicated);
    } else {
      onSave(duplicated);
    }
    handleClose();
  }

  function handleDeleteClick() {
    if (!editTransaction || !onDelete) return;
    onDelete(editTransaction.id);
    handleClose();
  }

  function handleClose() {
    setType("expense");
    setDate(today);
    setAmount("");
    setCategory("");
    setCardId("");
    setMemo("");
    setError("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        {/* Drag handle — mobile bottom sheet */}
        <div className="flex justify-center -mt-1 mb-2 sm:hidden" aria-hidden="true">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            {editTransaction ? (
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleDuplicate}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={handleDeleteClick}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <span />
            )}
            <DialogTitle className="type-title3 flex-1 text-right">
              {editTransaction ? "取引を編集" : "取引を追加"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* M3 Segmented control for income/expense */}
          <div className="flex rounded-2xl bg-muted/70 p-1.5 gap-1">
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
              className={`flex-1 py-2.5 rounded-xl type-subheadline font-semibold transition-all duration-300 ${
                type === "expense"
                  ? "bg-card text-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              支出
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("income")}
              className={`flex-1 py-2.5 rounded-xl type-subheadline font-semibold transition-all duration-300 ${
                type === "income"
                  ? "bg-income text-white shadow-md shadow-income/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              収入
            </button>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="date" className="type-subheadline font-medium">日付</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 rounded-xl bg-muted/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="type-subheadline font-medium">金額（円）</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 type-headline font-bold text-muted-foreground">¥</span>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                className="pl-10 h-14 rounded-xl bg-muted/50 border-border/50 text-xl font-semibold focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="type-subheadline font-medium">カテゴリ</Label>
            <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                {currentCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      {c.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Card */}
          {type === "expense" && (
            <div className="space-y-1.5">
              <Label className="type-subheadline font-medium">カード・支払方法</Label>
              <Select value={cardId} onValueChange={(v) => setCardId(v ?? "")}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {cards.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: c.color }}
                        />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Memo */}
          <div className="space-y-1.5">
            <Label htmlFor="memo" className="type-subheadline font-medium">メモ</Label>
            <Textarea
              id="memo"
              placeholder="メモを入力（任意）"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {error && (
            <p className="type-caption1 text-destructive flex items-center gap-1">{error}</p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="rounded-xl px-5">
              キャンセル
            </Button>
            <Button type="submit" className="rounded-xl px-6 shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all">
              {editTransaction ? "更新" : "追加"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
