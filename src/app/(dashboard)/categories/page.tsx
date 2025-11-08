"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoryDialog } from "@/components/categories/category-dialog";
import { CategoryCard } from "@/components/categories/category-card";
import type { Category } from "@/types";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CategoriesPage() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

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

    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (data) {
      setCategories(data);
    }

    setIsLoading(false);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
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
    if (!deletingCategory) return;

    setIsDeleting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", deletingCategory.id);

      if (error) throw error;

      await loadData();
      setDeletingCategory(null);
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingCategory(null);
      loadData();
    }
  };

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Categorias</h1>
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
            Categorias
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Organize suas transações por categorias
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
          Nova Categoria
        </Button>
      </div>

      <Tabs defaultValue="expense" className="space-y-6">
        <TabsList>
          <TabsTrigger value="expense">
            Despesas ({expenseCategories.length})
          </TabsTrigger>
          <TabsTrigger value="income">
            Receitas ({incomeCategories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expense" className="space-y-4">
          {expenseCategories.length === 0 ? (
            <div className="rounded-lg border bg-white p-12 text-center dark:bg-gray-900">
              <p className="text-gray-500 dark:text-gray-400">
                Nenhuma categoria de despesa encontrada
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {expenseCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={handleEdit}
                  onDelete={setDeletingCategory}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          {incomeCategories.length === 0 ? (
            <div className="rounded-lg border bg-white p-12 text-center dark:bg-gray-900">
              <p className="text-gray-500 dark:text-gray-400">
                Nenhuma categoria de receita encontrada
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {incomeCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={handleEdit}
                  onDelete={setDeletingCategory}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        category={editingCategory}
        userId={userId}
      />

      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={() => setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "
              {deletingCategory?.name}"? As transações associadas não serão
              excluídas, mas ficarão sem categoria.
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
