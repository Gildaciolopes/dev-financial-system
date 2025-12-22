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
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  transactionsAPI,
  categoriesAPI,
  Transaction,
  Category,
} from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const loadData = async () => {
    if (!token) return;

    try {
      setIsLoading(true);

      const [transactionsResult, categoriesResult] = await Promise.all([
        transactionsAPI.getAll(token, { limit: 100 }),
        categoriesAPI.getAll(token),
      ]);

      if (transactionsResult.success && transactionsResult.data) {
        setTransactions(transactionsResult.data);
        setFilteredTransactions(transactionsResult.data);
      }

      if (categoriesResult.success && categoriesResult.data) {
        setCategories(categoriesResult.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
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
    if (typeof window !== "undefined") {
      try {
        (document.activeElement as HTMLElement | null)?.blur();
        document.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
        );
        document.body.dispatchEvent(
          new MouseEvent("mousedown", { bubbles: true })
        );
        document.body.dispatchEvent(
          new MouseEvent("mouseup", { bubbles: true })
        );
        document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      } catch (e) {
        // ignore
      }
    }
    setIsDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingTransaction(null);
      if (typeof window !== "undefined") {
        try {
          (document.activeElement as HTMLElement | null)?.blur();
        } catch (e) {
          // ignore
        }
      }

      setTimeout(() => setIsDialogOpen(false), 0);
    } else {
      setIsDialogOpen(true);
    }
  };

  if (authLoading || isLoading) {
    return <TransactionsSkeleton />;
  }

  if (!user) {
    return null;
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
        <Button
          onClick={() => {
            if (typeof window !== "undefined") {
              try {
                (document.activeElement as HTMLElement | null)?.blur();
                document.dispatchEvent(
                  new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
                );
                document.body.dispatchEvent(
                  new MouseEvent("mousedown", { bubbles: true })
                );
                document.body.dispatchEvent(
                  new MouseEvent("mouseup", { bubbles: true })
                );
                document.body.dispatchEvent(
                  new MouseEvent("click", { bubbles: true })
                );
              } catch (e) {
                // ignore
              }
            }
            setIsDialogOpen(true);
          }}
        >
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
        onSave={(saved: Transaction) => {
          setTransactions((prev) => {
            const exists = prev.find((t) => t.id === saved.id);
            if (exists) return prev.map((t) => (t.id === saved.id ? saved : t));
            return [saved, ...prev];
          });
          setFilteredTransactions((prev) => {
            const exists = prev.find((t) => t.id === saved.id);
            if (exists) return prev.map((t) => (t.id === saved.id ? saved : t));
            return [saved, ...prev];
          });

          toast.success("Transação salva com sucesso");
        }}
      />
    </div>
  );
}

function TransactionsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <Skeleton className="h-20" />
      <Skeleton className="h-96" />
    </div>
  );
}
