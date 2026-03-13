"use client";

import { useState } from "react";
import { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { generateId } from "@/lib/storage";

const PRESET_COLORS = [
  "#f97316", "#3b82f6", "#8b5cf6", "#ec4899",
  "#10b981", "#ef4444", "#06b6d4", "#f59e0b",
  "#6366f1", "#6b7280",
];

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryManager({
  categories,
  onAdd,
  onDelete,
}: CategoryManagerProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState("");

  const userCategories = categories.filter((c) => !c.isDefault);
  const defaultCategories = categories.filter((c) => c.isDefault);

  function handleAdd() {
    if (!name.trim()) return setError("カテゴリ名を入力してください");
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
          <Label>カテゴリ名</Label>
          <Input
            placeholder="例: ペット費"
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

      {userCategories.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-2">カスタム</p>
          <div className="space-y-2">
            {userCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm font-medium">{cat.name}</span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => onDelete(cat.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs text-muted-foreground font-medium mb-2">デフォルト</p>
        <div className="flex flex-wrap gap-2">
          {defaultCategories.map((cat) => (
            <Badge
              key={cat.id}
              variant="secondary"
              className="text-xs"
              style={{
                backgroundColor: `${cat.color}22`,
                color: cat.color,
              }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: cat.color }}
              />
              {cat.name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
