"use client";

import { useState } from "react";
import { Card as CardType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { generateId } from "@/lib/storage";

const PRESET_COLORS = [
  "#e00000", "#ff9900", "#1a56db", "#10b981",
  "#8b5cf6", "#ec4899", "#f59e0b", "#6366f1",
];

interface CardManagerProps {
  cards: CardType[];
  onAdd: (card: CardType) => void;
  onDelete: (id: string) => void;
}

export function CardManager({ cards, onAdd, onDelete }: CardManagerProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState("");

  function handleAdd() {
    if (!name.trim()) return setError("カード名を入力してください");
    onAdd({
      id: generateId(),
      name: name.trim(),
      color,
      isDefault: false,
    });
    setName("");
    setColor(PRESET_COLORS[0]);
    setError("");
  }

  return (
    <div className="space-y-4">
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
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={handleAdd} size="sm" className="w-full">
          <Plus className="h-4 w-4 mr-1" />
          追加
        </Button>
      </div>

      <div className="space-y-2">
        {cards.map((card) => (
          <div
            key={card.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
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
        ))}
      </div>
    </div>
  );
}
