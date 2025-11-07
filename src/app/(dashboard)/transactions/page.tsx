"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import {
  TransactionFilters,
  type FilterState,
} from "@/components/transactions/transaction-filters";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import type { Transaction, Category } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function TransactionsPage() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setUserId(user.id);

    const [transactionsResult, categoriesResult] = await Promise.all([
      supabase
        .from("transactions")
        .select("*, category:categories(*)")
        .eq("user_id", user.id)
        .order("date", { ascending: false }),
      supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("name"),
    ]);

    if (transactionsResult.data) {
      setTransactions(transactionsResult.data);
      setFilteredTransactions(transactionsResult.data);
    }

    if (categoriesResult.data) {
      setCategories(categoriesResult.data);
    }

    setIsLoading(false);
  };

  const handleFilterChange = (filters: FilterState) => {
    let filtered = [...transactions];

    if (filters.search) {
      filtered = filtered.filter((t) =>
        t.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.type !== "all") {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    if (filters.categoryId !== "all") {
      filtered = filtered.filter((t) => t.category_id === filters.categoryId);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter((t) => t.date >= filters.dateFrom);
    }

    if (filters.dateTo) {
      filtered = filtered.filter((t) => t.date <= filters.dateTo);
    }

    setFilteredTransactions(filtered);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingTransaction(null);
      loadData();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Transações</h1>
            <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Transações
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie suas receitas e despesas
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      <TransactionFilters
        categories={categories}
        onFilterChange={handleFilterChange}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredTransactions.length} transação(ões) encontrada(s)
          </p>
        </div>

        <TransactionsTable
          transactions={filteredTransactions}
          onEdit={handleEdit}
          onDelete={(id: string) => {
            // Remove deleted transaction from both lists so UI updates immediately
            setTransactions((prev) => prev.filter((t) => t.id !== id));
            setFilteredTransactions((prev) => prev.filter((t) => t.id !== id));
          }}
        />
      </div>

      <TransactionDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        transaction={editingTransaction}
        categories={categories}
        userId={userId}
      />
    </div>
  );
}
