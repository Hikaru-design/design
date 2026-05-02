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
import {
  getTransactions as localGetTransactions,
  addTransaction as localAddTransaction,
  updateTransaction as localUpdateTransaction,
  deleteTransaction as localDeleteTransaction,
  getCategories as localGetCategories,
  addCategory as localAddCategory,
  deleteCategory as localDeleteCategory,
  getCards as localGetCards,
  addCard as localAddCard,
  updateCard as localUpdateCard,
  deleteCard as localDeleteCard,
} from "@/lib/storage";
import { Plus, ChevronLeft, ChevronRight, LogOut, UserPlus } from "lucide-react";
import { BottomNav } from "@/components/kakeibo/BottomNav";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const GUEST_MONTHLY_BUDGET_KEY = "kakeibo_guest_monthly_budget";
const GUEST_CATEGORY_BUDGETS_KEY = "kakeibo_guest_category_budgets";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [preselectedCardId, setPreselectedCardId] = useState<string | undefined>(undefined);
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
    const timer = setTimeout(() => setAuthLoading(false), 5000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timer);
      setUser(session?.user ?? null);
      setAuthLoading(false);
    }).catch(() => {
      clearTimeout(timer);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  // Load data when user changes or guest mode activates
  useEffect(() => {
    if (isGuest) {
      setTransactions(localGetTransactions());
      setCategories(localGetCategories());
      setCards(localGetCards());
      const savedBudget = typeof window !== "undefined"
        ? localStorage.getItem(GUEST_MONTHLY_BUDGET_KEY)
        : null;
      const budgetNum = savedBudget ? Number(savedBudget) : null;
      setMonthlyBudget(budgetNum);
      setBudgetInput(budgetNum ? String(budgetNum) : "");
      const savedCatBudgets = typeof window !== "undefined"
        ? localStorage.getItem(GUEST_CATEGORY_BUDGETS_KEY)
        : null;
      const catBudgets: Record<string, number> = savedCatBudgets ? JSON.parse(savedCatBudgets) : {};
      setCategoryBudgets(catBudgets);
      setCategoryBudgetInputs(Object.fromEntries(
        Object.entries(catBudgets).map(([k, v]) => [k, String(v)])
      ));
      return;
    }

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
  }, [user, isGuest]);

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
    if (isGuest) {
      if (editTx) localUpdateTransaction(tx);
      else localAddTransaction(tx);
      setTransactions(localGetTransactions());
      setEditTx(null);
      setPreselectedCardId(undefined);
      return;
    }
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

  async function handleDuplicate(tx: Transaction) {
    if (isGuest) {
      localAddTransaction(tx);
      setTransactions(localGetTransactions());
      setEditTx(null);
      setPreselectedCardId(undefined);
      return;
    }
    if (!user) return;
    await dbAddTransaction(tx, user.id);
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
    if (isGuest) {
      localDeleteTransaction(id);
      setTransactions(localGetTransactions());
      return;
    }
    if (!user) return;
    await dbDeleteTransaction(id, user.id);
    setTransactions(await dbGetTransactions(user.id));
  }

  async function handleAddCard(card: Card) {
    if (isGuest) {
      localAddCard(card);
      setCards(localGetCards());
      return;
    }
    if (!user) return;
    await dbAddCard(card, user.id);
    setCards(await dbGetCards(user.id));
  }

  async function handleUpdateCard(card: Card) {
    if (isGuest) {
      localUpdateCard(card);
      setCards(localGetCards());
      return;
    }
    if (!user) return;
    await dbUpdateCard(card, user.id);
    setCards(await dbGetCards(user.id));
  }

  async function handleDeleteCard(id: string) {
    if (isGuest) {
      localDeleteCard(id);
      setCards(localGetCards());
      return;
    }
    if (!user) return;
    await dbDeleteCard(id, user.id);
    setCards(await dbGetCards(user.id));
  }

  async function handleAddCategory(category: Category) {
    if (isGuest) {
      localAddCategory(category);
      setCategories(localGetCategories());
      return;
    }
    if (!user) return;
    await dbAddCategory(category, user.id);
    setCategories(await dbGetCategories(user.id));
  }

  async function handleDeleteCategory(id: string) {
    if (isGuest) {
      localDeleteCategory(id);
      setCategories(localGetCategories());
      return;
    }
    if (!user) return;
    await dbDeleteCategory(id, user.id);
    setCategories(await dbGetCategories(user.id));
  }

  async function handleSaveCategoryBudgets() {
    const updated: Record<string, number> = {};
    Object.entries(categoryBudgetInputs).forEach(([id, val]) => {
      if (val && Number(val) > 0) updated[id] = Number(val);
    });

    if (isGuest) {
      localStorage.setItem(GUEST_CATEGORY_BUDGETS_KEY, JSON.stringify(updated));
      setCategoryBudgets(updated);
      setCategoryBudgetSaved(true);
      setBudgetFeedbackMessage("カテゴリ別予算を追加しました");
      setBudgetFeedbackOpen(true);
      setTimeout(() => setCategoryBudgetSaved(false), 2000);
      return;
    }

    if (!user) return;
    await supabase.auth.updateUser({ data: { category_budgets: updated } });
    setCategoryBudgets(updated);
    setCategoryBudgetSaved(true);
    setBudgetFeedbackMessage("カテゴリ別予算を追加しました");
    setBudgetFeedbackOpen(true);
    setTimeout(() => setCategoryBudgetSaved(false), 2000);
  }

  async function handleSaveMonthlyBudget() {
    const amount = budgetInput ? Number(budgetInput) : null;

    if (isGuest) {
      if (amount) {
        localStorage.setItem(GUEST_MONTHLY_BUDGET_KEY, String(amount));
      } else {
        localStorage.removeItem(GUEST_MONTHLY_BUDGET_KEY);
      }
      setMonthlyBudget(amount);
      setMonthlyBudgetSaved(true);
      setBudgetFeedbackMessage("月の総予算を追加しました");
      setBudgetFeedbackOpen(true);
      setTimeout(() => setMonthlyBudgetSaved(false), 2000);
      return;
    }

    if (!user) return;
    await supabase.auth.updateUser({ data: { monthly_budget: amount } });
    setMonthlyBudget(amount);
    setMonthlyBudgetSaved(true);
    setBudgetFeedbackMessage("月の総予算を追加しました");
    setBudgetFeedbackOpen(true);
    setTimeout(() => setMonthlyBudgetSaved(false), 2000);
  }

  async function handleLogout() {
    if (isGuest) {
      setIsGuest(false);
      return;
    }
    await supabase.auth.signOut();
  }

  function handleTabChange(tab: string) {
    setActiveTab(tab);
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

  if (!user && !isGuest) {
    return <LoginForm onGuestMode={() => setIsGuest(true)} />;
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
            <TabsTrigger value="settings" className="flex-1">設定</TabsTrigger>
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
              onOpenSettings={() => setActiveTab("settings")}
              onQuickAdd={(cardId) => {
                setEditTx(null);
                setPreselectedCardId(cardId);
                setShowForm(true);
              }}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
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

            {/* ログアウト / ゲストモード */}
            <div className="mt-8 pt-4 border-t border-border space-y-2">
              {isGuest ? (
                <>
                  <div className="rounded-xl px-3 py-3 bg-muted/50">
                    <p className="type-caption1 text-muted-foreground">
                      ゲストモード中 — データはこのデバイスにのみ保存されます
                    </p>
                  </div>
                  <button
                    onClick={() => setIsGuest(false)}
                    className="flex items-center gap-2 type-callout text-md-primary state-layer w-full rounded-xl px-3 py-3"
                  >
                    <UserPlus className="h-4 w-4" />
                    アカウントを作成してデータを保存する
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 type-callout text-muted-foreground state-layer w-full rounded-xl px-3 py-3"
                  >
                    <LogOut className="h-4 w-4" />
                    ゲストモードを終了
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 type-callout text-destructive state-layer w-full rounded-xl px-3 py-3"
                >
                  <LogOut className="h-4 w-4" />
                  ログアウト
                </button>
              )}
            </div>
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
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
      />


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
