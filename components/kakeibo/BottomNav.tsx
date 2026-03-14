"use client";

import { LayoutList, BarChart2, Plus } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAdd: () => void;
}

export function BottomNav({ activeTab, onTabChange, onAdd }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 sm:hidden bg-background border-t pb-safe">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-6">
        {/* 明細タブ */}
        <button
          onClick={() => onTabChange("list")}
          className={`flex flex-col items-center gap-0.5 text-xs w-16 transition-colors ${
            activeTab === "list" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <LayoutList className="h-5 w-5" />
          <span>明細</span>
        </button>

        {/* 中央の追加ボタン */}
        <button
          onClick={onAdd}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg -mt-4"
        >
          <Plus className="h-6 w-6" />
        </button>

        {/* グラフタブ */}
        <button
          onClick={() => onTabChange("chart")}
          className={`flex flex-col items-center gap-0.5 text-xs w-16 transition-colors ${
            activeTab === "chart" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <BarChart2 className="h-5 w-5" />
          <span>グラフ</span>
        </button>
      </div>
    </nav>
  );
}
