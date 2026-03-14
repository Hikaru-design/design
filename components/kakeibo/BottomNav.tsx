"use client";

import { LayoutList, BarChart2, CreditCard, Plus } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAdd: () => void;
}

const tabs = [
  { value: "list", label: "明細", icon: LayoutList },
  { value: "chart", label: "グラフ", icon: BarChart2 },
  { value: "cards", label: "カード", icon: CreditCard },
];

export function BottomNav({ activeTab, onTabChange, onAdd }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 sm:hidden bg-background border-t pb-safe">
      <div className="flex items-center h-16 max-w-2xl mx-auto">
        {tabs.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => onTabChange(value)}
            className={`flex flex-col items-center justify-center gap-0.5 text-xs flex-1 h-full transition-colors ${
              activeTab === value ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </button>
        ))}

        {/* 追加ボタン */}
        <button
          onClick={onAdd}
          className="flex flex-col items-center justify-center gap-0.5 text-xs flex-1 h-full transition-colors text-muted-foreground"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground">
            <Plus className="h-5 w-5" />
          </div>
        </button>
      </div>
    </nav>
  );
}
