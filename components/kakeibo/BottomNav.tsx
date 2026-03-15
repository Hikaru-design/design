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
    <nav className="fixed bottom-0 left-0 right-0 z-20 sm:hidden pb-safe pointer-events-none">
      <div className="flex items-end justify-center gap-3 px-4 pb-4 pointer-events-auto">
        {/* Floating pill nav */}
        <div
          className="flex items-center h-16 rounded-3xl px-2 gap-1 flex-1 max-w-xs"
          style={{
            background: "oklch(1 0 0 / 0.88)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid oklch(1 0 0 / 0.50)",
            boxShadow: "0 8px 32px oklch(0 0 0 / 0.12), 0 2px 8px oklch(0 0 0 / 0.08)",
          }}
        >
          {tabs.map(({ value, label, icon: Icon }) => {
            const isActive = activeTab === value;
            return (
              <button
                key={value}
                onClick={() => onTabChange(value)}
                className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all duration-300"
                style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}
              >
                {/* Active pill */}
                <span
                  className="absolute top-1/2 -translate-y-1/2 w-12 h-8 rounded-2xl transition-all duration-300"
                  style={{
                    transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
                    background: isActive
                      ? "linear-gradient(135deg, oklch(0.44 0.18 168 / 0.18), oklch(0.50 0.16 192 / 0.14))"
                      : "transparent",
                  }}
                />
                <Icon
                  className="relative h-5 w-5 transition-all duration-300"
                  style={{
                    color: isActive ? "oklch(0.44 0.18 168)" : "oklch(0.55 0.04 168)",
                    transform: isActive ? "scale(1.1)" : "scale(1)",
                    filter: isActive ? "drop-shadow(0 1px 4px oklch(0.44 0.18 168 / 0.40))" : "none",
                  }}
                />
                <span
                  className="relative type-caption2 font-semibold transition-all duration-300"
                  style={{
                    color: isActive ? "oklch(0.44 0.18 168)" : "oklch(0.55 0.04 168)",
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Floating FAB */}
        <button
          onClick={onAdd}
          className="flex items-center justify-center w-16 h-16 rounded-3xl transition-all duration-200 active:scale-90 flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, oklch(0.44 0.18 168), oklch(0.50 0.16 192))",
            boxShadow: "0 8px 24px oklch(0.44 0.18 168 / 0.45), 0 2px 8px oklch(0 0 0 / 0.10)",
          }}
        >
          <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
        </button>
      </div>
    </nav>
  );
}
