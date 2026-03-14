"use client";

import { useEffect, useState } from "react";
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
import { Transaction, Category, Card } from "@/lib/types";
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
  addCategory,
  deleteCategory,
  getCards,
  addCard,
  updateCard,
  deleteCard,
} from "@/lib/storage";
import { Plus, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { BottomNav } from "@/components/kakeibo/BottomNav";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  useEffect(() => {
    setTransactions(getTransactions());
    setCategories(getCategories());
    setCards(getCards());
  }, []);

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

  function handleSave(tx: Transaction) {
    if (editTx) {
      updateTransaction(tx);
    } else {
      addTransaction(tx);
    }
    setTransactions(getTransactions());
    setEditTx(null);
  }

  function handleEdit(tx: Transaction) {
    setEditTx(tx);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    deleteTransaction(id);
    setTransactions(getTransactions());
  }

  function handleAddCard(card: Card) {
    addCard(card);
    setCards(getCards());
  }

  function handleUpdateCard(card: Card) {
    updateCard(card);
    setCards(getCards());
  }

  function handleDeleteCard(id: string) {
    deleteCard(id);
    setCards(getCards());
  }

  function handleAddCategory(category: Category) {
    addCategory(category);
    setCategories(getCategories());
  }

  function handleDeleteCategory(id: string) {
    deleteCategory(id);
    setCategories(getCategories());
  }

  const isCurrentMonth =
    selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight">家計簿</h1>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="hidden sm:flex gap-1"
              onClick={() => {
                setEditTx(null);
                setShowForm(true);
              }}
            >
              <Plus className="h-4 w-4" />
              追加
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 pb-20 sm:pb-4 space-y-4">
        {/* Month selector */}
        <div className="flex items-center justify-center gap-4">
          <Button size="icon" variant="ghost" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center min-w-32">
            <span className="text-xl font-bold">
              {selectedYear}年{selectedMonth}月
            </span>
            {isCurrentMonth && (
              <span className="ml-2 text-xs text-muted-foreground">今月</span>
            )}
          </div>
          <Button size="icon" variant="ghost" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Summary */}
        <SummaryCard transactions={monthlyTx} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="hidden sm:flex w-full">
            <TabsTrigger value="list" className="flex-1">
              明細
            </TabsTrigger>
            <TabsTrigger value="chart" className="flex-1">
              グラフ
            </TabsTrigger>
            <TabsTrigger value="cards" className="flex-1">
              カード
            </TabsTrigger>
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
            />
          </TabsContent>

          <TabsContent value="cards" className="mt-4">
            <CardDashboard
              cards={cards}
              transactions={transactions}
              onOpenSettings={() => setShowSettings(true)}
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
        }}
        onSave={handleSave}
        categories={categories}
        cards={cards}
        editTransaction={editTx}
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
          <Tabs defaultValue="cards">
            <TabsList className="w-full">
              <TabsTrigger value="cards" className="flex-1">
                カード管理
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex-1">
                カテゴリ管理
              </TabsTrigger>
            </TabsList>
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
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAdd={() => {
          setEditTx(null);
          setShowForm(true);
        }}
      />
    </div>
  );
}
