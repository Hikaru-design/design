"use client";

import { useState, useEffect, useRef } from "react";
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
import { Transaction, Category, Card, TransactionType, ExtractedTransaction } from "@/lib/types";
import { generateId } from "@/lib/storage";
import { Camera, Copy, Loader2, Trash2 } from "lucide-react";

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
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setIsExtracting(false);
      setExtractError(null);
    }
  }, [open, editTransaction, defaultCardId]);

  const expenseCategories = categories.filter(
    (c) => !["salary", "bonus", "other-income"].includes(c.id)
  );
  const incomeCategories = categories.filter((c) =>
    ["salary", "bonus", "other-income"].includes(c.id)
  );
  const currentCategories = type === "expense" ? expenseCategories : incomeCategories;

  function applyExtractedData(data: ExtractedTransaction) {
    if (data.type) setType(data.type);
    if (data.date) setDate(data.date);
    if (data.amount !== null && data.amount !== undefined) setAmount(String(data.amount));
    const validCategory = categories.some((c) => c.id === data.category) ? data.category : "";
    setCategory(validCategory);
    if (data.memo) setMemo(data.memo);
  }

  async function handleImageExtract(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setIsExtracting(true);
    setExtractError(null);

    try {
      const body = new FormData();
      body.append("image", file);

      const res = await fetch("/api/extract-transaction", { method: "POST", body });
      const data = await res.json();

      if (!res.ok) {
        setExtractError(data.error ?? "画像の読み取りに失敗しました");
        return;
      }

      applyExtractedData(data as ExtractedTransaction);
    } catch {
      setExtractError("ネットワークエラーが発生しました");
    } finally {
      setIsExtracting(false);
    }
  }

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
    setIsExtracting(false);
    setExtractError(null);
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
          <div className="flex rounded-full bg-muted p-1 gap-1">
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
              className={`flex-1 py-2 rounded-full type-subheadline font-medium transition-all duration-200 ${
                type === "expense"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              支出
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("income")}
              className={`flex-1 py-2 rounded-full type-subheadline font-medium transition-all duration-200 ${
                type === "income"
                  ? "bg-income text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              収入
            </button>
          </div>

          {/* Image scan */}
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full h-10 gap-2 text-muted-foreground"
              onClick={() => fileInputRef.current?.click()}
              disabled={isExtracting}
            >
              {isExtracting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  読み取り中...
                </>
              ) : (
                <>
                  <Camera className="h-3.5 w-3.5" />
                  画像から読み取る
                </>
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleImageExtract}
            />
            {extractError && (
              <p className="type-caption1 text-destructive mt-1">{extractError}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="date" className="type-subheadline font-medium">日付</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11"
            />
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="type-subheadline font-medium">金額（円）</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 type-body font-semibold text-muted-foreground">¥</span>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                className="pl-7 h-11 type-body"
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

          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button type="submit">
              {editTransaction ? "更新" : "追加"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
