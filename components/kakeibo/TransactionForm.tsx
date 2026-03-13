"use client";

import { useState } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Transaction, Category, Card, TransactionType } from "@/lib/types";
import { generateId } from "@/lib/storage";

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  categories: Category[];
  cards: Card[];
  editTransaction?: Transaction | null;
}

export function TransactionForm({
  open,
  onClose,
  onSave,
  categories,
  cards,
  editTransaction,
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
  const [cardId, setCardId] = useState(editTransaction?.cardId ?? "");
  const [memo, setMemo] = useState(editTransaction?.memo ?? "");
  const [error, setError] = useState("");

  const expenseCategories = categories.filter(
    (c) =>
      !["salary", "bonus", "other-income"].includes(c.id)
  );
  const incomeCategories = categories.filter((c) =>
    ["salary", "bonus", "other-income"].includes(c.id)
  );
  const currentCategories =
    type === "expense" ? expenseCategories : incomeCategories;

  function handleTypeChange(val: string) {
    setType(val as TransactionType);
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
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>
            {editTransaction ? "取引を編集" : "取引を追加"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={type} onValueChange={handleTypeChange}>
            <TabsList className="w-full">
              <TabsTrigger value="expense" className="flex-1">
                支出
              </TabsTrigger>
              <TabsTrigger value="income" className="flex-1">
                収入
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="date">日付</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">金額 (円)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label>カテゴリ</Label>
            <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                {currentCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      {c.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === "expense" && (
            <div className="space-y-2">
              <Label>カード・支払方法</Label>
              <Select value={cardId} onValueChange={(v) => setCardId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {cards.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block w-3 h-3 rounded-full"
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

          <div className="space-y-2">
            <Label htmlFor="memo">メモ</Label>
            <Textarea
              id="memo"
              placeholder="メモを入力"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={2}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 justify-end">
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
