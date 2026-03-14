"use client";

import { useState } from "react";
import { Card as CardType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Pencil, Check, X } from "lucide-react";
import { generateId } from "@/lib/storage";

const PRESET_COLORS = [
  "#e00000", "#ff9900", "#1a56db", "#10b981",
  "#8b5cf6", "#ec4899", "#f59e0b", "#6366f1",
];

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => i + 1);

interface CardManagerProps {
  cards: CardType[];
  onAdd: (card: CardType) => void;
  onUpdate: (card: CardType) => void;
  onDelete: (id: string) => void;
}

export function CardManager({ cards, onAdd, onUpdate, onDelete }: CardManagerProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [closingDay, setClosingDay] = useState<string>("");
  const [paymentDay, setPaymentDay] = useState<string>("");
  const [budgetAmount, setBudgetAmount] = useState<string>("");
  const [error, setError] = useState("");

  // 編集中のカードID
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editClosingDay, setEditClosingDay] = useState<string>("");
  const [editPaymentDay, setEditPaymentDay] = useState<string>("");
  const [editBudgetAmount, setEditBudgetAmount] = useState<string>("");

  function handleAdd() {
    if (!name.trim()) return setError("カード名を入力してください");
    onAdd({
      id: generateId(),
      name: name.trim(),
      color,
      isDefault: false,
      closingDay: closingDay ? Number(closingDay) : undefined,
      paymentDay: paymentDay ? Number(paymentDay) : undefined,
      budgetAmount: budgetAmount ? Number(budgetAmount) : undefined,
    });
    setName("");
    setColor(PRESET_COLORS[0]);
    setClosingDay("");
    setPaymentDay("");
    setBudgetAmount("");
    setError("");
  }

  function startEdit(card: CardType) {
    setEditingId(card.id);
    setEditClosingDay(card.closingDay ? String(card.closingDay) : "");
    setEditPaymentDay(card.paymentDay ? String(card.paymentDay) : "");
    setEditBudgetAmount(card.budgetAmount ? String(card.budgetAmount) : "");
  }

  function saveEdit(card: CardType) {
    onUpdate({
      ...card,
      closingDay: editClosingDay ? Number(editClosingDay) : undefined,
      paymentDay: editPaymentDay ? Number(editPaymentDay) : undefined,
      budgetAmount: editBudgetAmount ? Number(editBudgetAmount) : undefined,
    });
    setEditingId(null);
  }

  return (
    <div className="space-y-4">
      {/* 新規追加フォーム */}
      <div className="space-y-3">
        <div className="space-y-2">
          <Label>カード名</Label>
          <Input
            placeholder="例: PayPayカード"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        </div>
        <div className="space-y-2">
          <Label>カラー</Label>
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`w-7 h-7 rounded-full border-2 transition-all ${
                  color === c ? "border-foreground scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">締め日</Label>
            <Select value={closingDay} onValueChange={(v) => setClosingDay(v ?? "")}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="設定しない" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">設定しない</SelectItem>
                {DAY_OPTIONS.map((d) => (
                  <SelectItem key={d} value={String(d)}>{d}日</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">支払日</Label>
            <Select value={paymentDay} onValueChange={(v) => setPaymentDay(v ?? "")}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="設定しない" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">設定しない</SelectItem>
                {DAY_OPTIONS.map((d) => (
                  <SelectItem key={d} value={String(d)}>{d}日</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">月予算額（円）</Label>
          <Input
            type="number"
            placeholder="例: 50000"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={handleAdd} size="sm" className="w-full">
          <Plus className="h-4 w-4 mr-1" />
          追加
        </Button>
      </div>

      {/* カードリスト */}
      <div className="space-y-2">
        {cards.map((card) => (
          <div
            key={card.id}
            className="rounded-lg border bg-card overflow-hidden"
          >
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: card.color }}
                />
                <span className="text-sm font-medium">{card.name}</span>
                {card.isDefault && (
                  <Badge variant="secondary" className="text-xs">デフォルト</Badge>
                )}
              </div>
              <div className="flex gap-1">
                {card.id !== "cash" && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() =>
                      editingId === card.id
                        ? setEditingId(null)
                        : startEdit(card)
                    }
                  >
                    {editingId === card.id ? (
                      <X className="h-3.5 w-3.5" />
                    ) : (
                      <Pencil className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
                {!card.isDefault && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => onDelete(card.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* 現在の設定表示 */}
            {editingId !== card.id && card.id !== "cash" && (
              <div className="px-3 pb-2 flex gap-3 text-xs text-muted-foreground">
                <span>締め日: {card.closingDay ? `${card.closingDay}日` : "未設定"}</span>
                <span>支払日: {card.paymentDay ? `${card.paymentDay}日` : "未設定"}</span>
                {card.budgetAmount && (
                  <span>予算: ¥{card.budgetAmount.toLocaleString()}</span>
                )}
              </div>
            )}

            {/* 編集フォーム */}
            {editingId === card.id && (
              <div className="px-3 pb-3 space-y-2 border-t pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">締め日</Label>
                    <Select value={editClosingDay} onValueChange={(v) => setEditClosingDay(v ?? "")}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="設定しない" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">設定しない</SelectItem>
                        {DAY_OPTIONS.map((d) => (
                          <SelectItem key={d} value={String(d)}>{d}日</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">支払日</Label>
                    <Select value={editPaymentDay} onValueChange={(v) => setEditPaymentDay(v ?? "")}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="設定しない" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">設定しない</SelectItem>
                        {DAY_OPTIONS.map((d) => (
                          <SelectItem key={d} value={String(d)}>{d}日</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">月予算額（円）</Label>
                  <Input
                    type="number"
                    placeholder="例: 50000"
                    value={editBudgetAmount}
                    onChange={(e) => setEditBudgetAmount(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full h-7 text-xs"
                  onClick={() => saveEdit(card)}
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  保存
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
