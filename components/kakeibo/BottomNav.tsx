"use client";

import { LayoutList, BarChart2, CreditCard, Plus, Settings2 } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAdd: () => void;
}

const tabs = [
  { value: "list",     label: "明細",   icon: LayoutList },
  { value: "chart",    label: "グラフ", icon: BarChart2 },
  { value: "cards",    label: "カード", icon: CreditCard },
  { value: "settings", label: "設定",   icon: Settings2 },
];

export function BottomNav({ activeTab, onTabChange, onAdd }: BottomNavProps) {
  return (
    <nav className="fixed bottom-4 left-4 right-4 z-20 sm:hidden">
      <div className="glass rounded-2xl shadow-xl shadow-foreground/5 border border-border/50 mx-auto max-w-md">
        <div className="flex items-center h-16 px-2">
          {tabs.map(({ value, label, icon: Icon }) => {
            const isActive = activeTab === value;
            return (
              <button
                key={value}
                onClick={() => onTabChange(value)}
                className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all duration-300"
              >
                {/* Active indicator pill */}
                <span
                  className={`absolute top-2 w-12 h-8 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? "bg-primary/15 scale-100" 
                      : "bg-transparent scale-75"
                  }`}
                />
                <Icon
                  className={`relative h-5 w-5 transition-all duration-300 ${
                    isActive
                      ? "text-primary scale-110"
                      : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`relative type-caption2 font-medium transition-all duration-300 ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}

          {/* FAB — Add button */}
          <button
            onClick={onAdd}
            className="flex-shrink-0 w-12 h-12 ml-1 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center transition-all duration-300 active:scale-95 hover:shadow-xl hover:shadow-primary/40"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}
