"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionForm } from "@/components/kakeibo/TransactionForm";
import { TransactionList } from "@/components/kakeibo/TransactionList";
import { SummaryCard } from "@/components/kakeibo/SummaryCard";
import { Charts } from "@/components/kakeibo/Charts";
import { CardManager } from "@/components/kakeibo/CardManager";
import { CardDashboard } from "@/components/kakeibo/CardDashboard";
import { CategoryManager } from "@/components/kakeibo/CategoryManager";
import { LoginForm } from "@/components/kakeibo/LoginForm";
import { Transaction, Category, Card } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import {
  dbGetTransactions,
  dbAddTransaction,
  dbUpdateTransaction,
  dbDeleteTransaction,
  dbGetCategories,
  dbAddCategory,
  dbDeleteCategory,
  dbGetCards,
  dbAddCard,
  dbUpdateCard,
  dbDeleteCard,
} from "@/lib/supabase-db";
import { Plus, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { BottomNav } from "@/components/kakeibo/BottomNav";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [preselectedCardId, setPreselectedCardId] = useState<string | undefined>(undefined);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [budgetFeedbackOpen, setBudgetFeedbackOpen] = useState(false);
  const [budgetFeedbackMessage, setBudgetFeedbackMessage] = useState<string | null>(null);
  const [monthlyBudget, setMonthlyBudget] = useState<number | null>(null);
  const [budgetInput, setBudgetInput] = useState<string>("");
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>({});
  const [categoryBudgetInputs, setCategoryBudgetInputs] = useState<Record<string, string>>({});
  const [categoryBudgetSaved, setCategoryBudgetSaved] = useState(false);
  const [monthlyBudgetSaved, setMonthlyBudgetSaved] = useState(false);

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  // Auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load data when user changes
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setCategories([]);
      setCards([]);
      setMonthlyBudget(null);
      setBudgetInput("");
      setCategoryBudgets({});
      setCategoryBudgetInputs({});
      return;
    }
    const budget = user.user_metadata?.monthly_budget ?? null;
    const budgetNum = budget ? Number(budget) : null;
    setMonthlyBudget(budgetNum);
    setBudgetInput(budgetNum ? String(budgetNum) : "");
    const catBudgets: Record<string, number> = user.user_metadata?.category_budgets ?? {};
    setCategoryBudgets(catBudgets);
    setCategoryBudgetInputs(Object.fromEntries(
      Object.entries(catBudgets).map(([k, v]) => [k, String(v)])
    ));
    (async () => {
      const [txs, cats, cds] = await Promise.all([
        dbGetTransactions(user.id),
        dbGetCategories(user.id),
        dbGetCards(user.id),
      ]);
      setTransactions(txs);
      setCategories(cats);
      setCards(cds);
    })();
  }, [user]);

  const monthlyTx = transactions.filter((t) => {
    const prefix = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
    return t.date.startsWith(prefix);
  });

  function prevMonth() {
    if (selectedMonth === 1) {
      setSelectedYear((y) => y - 1);
      setSelectedMonth(12);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (selectedMonth === 12) {
      setSelectedYear((y) => y + 1);
      setSelectedMonth(1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  }

  async function handleSave(tx: Transaction) {
    if (!user) return;
    if (editTx) {
      await dbUpdateTransaction(tx, user.id);
    } else {
      await dbAddTransaction(tx, user.id);
    }
    setTransactions(await dbGetTransactions(user.id));
    setEditTx(null);
    setPreselectedCardId(undefined);
  }

  function handleEdit(tx: Transaction) {
    setEditTx(tx);
    setPreselectedCardId(undefined);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!user) return;
    await dbDeleteTransaction(id, user.id);
    setTransactions(await dbGetTransactions(user.id));
  }

  async function handleAddCard(card: Card) {
    if (!user) return;
    await dbAddCard(card, user.id);
    setCards(await dbGetCards(user.id));
  }

  async function handleUpdateCard(card: Card) {
    if (!user) return;
    await dbUpdateCard(card, user.id);
    setCards(await dbGetCards(user.id));
  }

  async function handleDeleteCard(id: string) {
    if (!user) return;
    await dbDeleteCard(id, user.id);
    setCards(await dbGetCards(user.id));
  }

  async function handleAddCategory(category: Category) {
    if (!user) return;
    await dbAddCategory(category, user.id);
    setCategories(await dbGetCategories(user.id));
  }

  async function handleDeleteCategory(id: string) {
    if (!user) return;
    await dbDeleteCategory(id, user.id);
    setCategories(await dbGetCategories(user.id));
  }

  async function handleSaveCategoryBudgets() {
    if (!user) return;
    const updated: Record<string, number> = {};
    Object.entries(categoryBudgetInputs).forEach(([id, val]) => {
      if (val && Number(val) > 0) updated[id] = Number(val);
    });
    await supabase.auth.updateUser({ data: { category_budgets: updated } });
    setCategoryBudgets(updated);
    setCategoryBudgetSaved(true);
    setBudgetFeedbackMessage("カテゴリ別予算を追加しました");
    setBudgetFeedbackOpen(true);
    setTimeout(() => setCategoryBudgetSaved(false), 2000);
  }

  async function handleSaveMonthlyBudget() {
    if (!user) return;
    const amount = budgetInput ? Number(budgetInput) : null;
    await supabase.auth.updateUser({ data: { monthly_budget: amount } });
    setMonthlyBudget(amount);
    setMonthlyBudgetSaved(true);
    setBudgetFeedbackMessage("月の総予算を追加しました");
    setBudgetFeedbackOpen(true);
    setTimeout(() => setMonthlyBudgetSaved(false), 2000);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  function handleTabChange(tab: string) {
    if (tab === "settings") {
      setShowSettings(true);
    } else {
      setActiveTab(tab);
    }
  }

  const isCurrentMonth =
    selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1;

  const showMonthSelector = activeTab === "list" || activeTab === "chart";

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="type-footnote text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border" style={{ boxShadow: "var(--md-elevation-1)" }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <h1 className="type-title2 flex-1">家計簿</h1>

          {/* Month selector — shown in header on desktop */}
          {showMonthSelector && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="h-8 w-8 flex items-center justify-center rounded-full state-layer text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="type-subheadline font-semibold min-w-[7rem] text-center">
                {selectedYear}年{selectedMonth}月
                {isCurrentMonth && (
                  <span className="ml-1.5 type-caption1 text-md-primary font-medium">今月</span>
                )}
              </span>
              <button
                onClick={nextMonth}
                className="h-8 w-8 flex items-center justify-center rounded-full state-layer text-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9"
              onClick={handleLogout}
              title="ログアウト"
            >
              <LogOut className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="hidden sm:flex gap-1"
              onClick={() => {
                setEditTx(null);
                setPreselectedCardId(undefined);
                setShowForm(true);
              }}
            >
              <Plus className="h-4 w-4" />
              追加
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 pb-24 sm:pb-4 space-y-4">
        {/* Month selector — mobile only, below header */}
        {showMonthSelector && (
          <div className="flex sm:hidden items-center justify-center gap-3">
            <button
              onClick={prevMonth}
              className="h-9 w-9 flex items-center justify-center rounded-full state-layer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-center min-w-[8rem]">
              <span className="type-title3">
                {selectedYear}年{selectedMonth}月
              </span>
              {isCurrentMonth && (
                <span className="ml-2 type-caption1 text-md-primary font-medium">今月</span>
              )}
            </div>
            <button
              onClick={nextMonth}
              className="h-9 w-9 flex items-center justify-center rounded-full state-layer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Summary — only on list/chart tabs */}
        {(activeTab === "list" || activeTab === "chart") && (
          <SummaryCard transactions={monthlyTx} monthlyBudget={monthlyBudget} />
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="hidden sm:flex w-full">
            <TabsTrigger value="list" className="flex-1">明細</TabsTrigger>
            <TabsTrigger value="chart" className="flex-1">グラフ</TabsTrigger>
            <TabsTrigger value="cards" className="flex-1">カード</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4">
            <TransactionList
              transactions={monthlyTx}
              categories={categories}
              cards={cards}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </TabsContent>

          <TabsContent value="chart" className="mt-4">
            <Charts
              transactions={monthlyTx}
              allTransactions={transactions}
              categories={categories}
              categoryBudgets={categoryBudgets}
            />
          </TabsContent>

          <TabsContent value="cards" className="mt-4">
            <CardDashboard
              cards={cards}
              transactions={transactions}
              onOpenSettings={() => setShowSettings(true)}
              onQuickAdd={(cardId) => {
                setEditTx(null);
                setPreselectedCardId(cardId);
                setShowForm(true);
              }}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Transaction Form */}
      <TransactionForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditTx(null);
          setPreselectedCardId(undefined);
        }}
        onSave={handleSave}
        categories={categories}
        cards={cards}
        editTransaction={editTx}
        defaultCardId={preselectedCardId}
      />

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <div className="flex justify-center -mt-1 mb-1 sm:hidden" aria-hidden="true">
            <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
          </div>
          <DialogHeader>
            <DialogTitle>設定</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="budget">
            <TabsList className="w-full">
              <TabsTrigger value="budget" className="flex-1">予算</TabsTrigger>
              <TabsTrigger value="cards" className="flex-1">カード</TabsTrigger>
              <TabsTrigger value="categories" className="flex-1">カテゴリ</TabsTrigger>
            </TabsList>
            <TabsContent value="budget" className="mt-4 space-y-5">
              {/* 月の総予算 */}
              <div className="space-y-2">
                <Label className="type-subheadline font-medium">月の総予算額（円）</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="例: 150000"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveMonthlyBudget}
                    className="shrink-0"
                    style={{ touchAction: "manipulation" }}
                  >
                    {monthlyBudgetSaved ? "保存済み ✓" : "保存"}
                  </Button>
                </div>
                <p className="type-caption1 text-muted-foreground">
                  設定するとサマリーに「残り予算」が表示されます。
                </p>
              </div>

              {/* カテゴリ別予算 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="type-subheadline font-medium">カテゴリ別予算（円）</Label>
                </div>
                <div className="space-y-2">
                  {categories
                    .filter((c) => !["salary", "bonus", "other-income"].includes(c.id))
                    .map((cat) => (
                      <div key={cat.id} className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="type-footnote w-20 shrink-0">{cat.name}</span>
                        <Input
                          type="number"
                          placeholder="未設定"
                          value={categoryBudgetInputs[cat.id] ?? ""}
                          onChange={(e) =>
                            setCategoryBudgetInputs((prev) => ({
                              ...prev,
                              [cat.id]: e.target.value,
                            }))
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                    ))}
                </div>
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleSaveCategoryBudgets}
                  style={{ touchAction: "manipulation" }}
                >
                  {categoryBudgetSaved ? "保存しました ✓" : "カテゴリ予算を保存"}
                </Button>
                <p className="type-caption1 text-muted-foreground">
                  設定するとグラフタブに使用状況が表示されます。
                </p>
              </div>

              {/* Logout in settings */}
              <div className="pt-2 border-t border-border">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 type-callout text-destructive state-layer w-full rounded-lg px-3 py-2.5"
                >
                  <LogOut className="h-4 w-4" />
                  ログアウト
                </button>
              </div>
            </TabsContent>
            <TabsContent value="cards" className="mt-4">
              <CardManager
                cards={cards}
                onAdd={handleAddCard}
                onUpdate={handleUpdateCard}
                onDelete={handleDeleteCard}
              />
            </TabsContent>
            <TabsContent value="categories" className="mt-4">
              <CategoryManager
                categories={categories}
                onAdd={handleAddCategory}
                onDelete={handleDeleteCategory}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Budget feedback dialog */}
      <Dialog open={budgetFeedbackOpen} onOpenChange={setBudgetFeedbackOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>追加しました</DialogTitle>
          </DialogHeader>
          <p className="type-callout text-muted-foreground">
            {budgetFeedbackMessage ?? "予算を追加しました。"}
          </p>
          <div className="mt-4 flex justify-end">
            <Button size="sm" onClick={() => setBudgetFeedbackOpen(false)}>
              閉じる
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onAdd={() => {
          setEditTx(null);
          setPreselectedCardId(undefined);
          setShowForm(true);
        }}
      />
    </div>
  );
}
