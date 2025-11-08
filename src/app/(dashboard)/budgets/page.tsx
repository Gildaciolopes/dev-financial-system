"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { BudgetDialog } from "@/components/budgets/budget-dialog";
import { BudgetCard } from "@/components/budgets/budget-card";
import { toast } from "sonner";
import type { Budget, Category, Transaction } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BudgetsPage() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [spentByCategory, setSpentByCategory] = useState<{
    [key: string]: number;
  }>({});
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadData();
  }, [currentMonth]);

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

    const monthStr = format(currentMonth, "yyyy-MM");
    const firstDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const lastDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );
    const firstDayStr = firstDay.toISOString().split("T")[0];

    const [budgetsResult, categoriesResult, transactionsResult] =
      await Promise.all([
        supabase
          .from("budgets")
          .select("*, category:categories(*)")
          .eq("user_id", user.id)
          .eq("month", firstDayStr),
        supabase
          .from("categories")
          .select("*")
          .eq("user_id", user.id)
          .eq("type", "expense")
          .order("name"),
        supabase
          .from("transactions")
          .select("category_id, amount")
          .eq("user_id", user.id)
          .eq("type", "expense")
          .gte("date", firstDay.toISOString().split("T")[0])
          .lte("date", lastDay.toISOString().split("T")[0]),
      ]);

    if (budgetsResult.data) {
      setBudgets(budgetsResult.data);
    }

    if (categoriesResult.data) {
      setCategories(categoriesResult.data);
    }

    if (transactionsResult.data) {
      const spent: { [key: string]: number } = {};
      transactionsResult.data.forEach((t: Partial<Transaction>) => {
        if (t.category_id) {
          spent[t.category_id as string] =
            (spent[t.category_id as string] || 0) + Number(t.amount as any);
        }
      });
      setSpentByCategory(spent);
    }

    setIsLoading(false);
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
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

  const handleDelete = async () => {
    if (!deletingBudget) return;

    setIsDeleting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", deletingBudget.id);

      if (error) throw error;

      await loadData();
      setDeletingBudget(null);
    } catch (error) {
      console.error("Error deleting budget:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingBudget(null);
      loadData();
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const currentMonthStr = format(currentMonth, "yyyy-MM");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Orçamentos</h1>
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
            Orçamentos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Controle seus gastos por categoria
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
          Novo Orçamento
        </Button>
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-white p-4 dark:bg-gray-900">
        <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
        </h2>

        <Button variant="outline" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {budgets.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum orçamento definido para este mês
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              spent={spentByCategory[budget.category_id] || 0}
              onEdit={handleEdit}
              onDelete={setDeletingBudget}
            />
          ))}
        </div>
      )}

      <BudgetDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        budget={editingBudget}
        categories={categories}
        userId={userId}
        currentMonth={currentMonthStr}
        onSave={(saved: Budget) => {
          toast.success("Orçamento salvo com sucesso");
          loadData();
        }}
      />

      <AlertDialog
        open={!!deletingBudget}
        onOpenChange={() => setDeletingBudget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o orçamento da categoria "
              {deletingBudget?.category?.name}"? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
