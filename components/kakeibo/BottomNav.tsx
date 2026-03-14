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
  const activeIndex = tabs.findIndex((t) => t.value === activeTab);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 sm:hidden bg-card border-t border-border pb-safe">
      <div className="flex items-center h-16 max-w-2xl mx-auto px-1">
        {tabs.map(({ value, label, icon: Icon }, index) => {
          const isActive = activeTab === value;
          return (
            <button
              key={value}
              onClick={() => onTabChange(value)}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors"
            >
              {/* Active indicator pill */}
              <span
                className={`absolute top-1/2 -translate-y-1/2 w-14 h-7 rounded-full transition-all duration-300 ${
                  isActive ? "bg-md-primary-container" : "bg-transparent"
                }`}
                style={{
                  transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
                }}
              />
              <Icon
                className={`relative h-5 w-5 transition-colors ${
                  isActive
                    ? "text-md-on-primary-container"
                    : "text-muted-foreground"
                }`}
              />
              <span
                className={`relative type-caption2 font-medium transition-colors ${
                  isActive
                    ? "text-md-on-primary-container"
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
          className="flex flex-col items-center justify-center flex-shrink-0 w-14 h-full state-layer"
        >
          <div className="flex items-center justify-center w-14 h-9 rounded-2xl bg-md-primary-container text-md-on-primary-container transition-transform active:scale-95">
            <Plus className="h-5 w-5" />
          </div>
        </button>
      </div>
    </nav>
  );
}
