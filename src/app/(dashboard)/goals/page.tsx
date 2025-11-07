"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GoalDialog } from "@/components/goals/goal-dialog";
import { ContributeDialog } from "@/components/goals/contribute-dialog";
import { GoalCard } from "@/components/goals/goal-card";
import type { FinancialGoal } from "@/types";
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

export default function GoalsPage() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [contributingGoal, setContributingGoal] =
    useState<FinancialGoal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<FinancialGoal | null>(null);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
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
      .from("financial_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setGoals(data);
    }

    setIsLoading(false);
  };

  const handleEdit = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setIsDialogOpen(true);
  };

  const handleContribute = (goal: FinancialGoal) => {
    setContributingGoal(goal);
    setIsContributeOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingGoal) return;

    setIsDeleting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("financial_goals")
        .delete()
        .eq("id", deletingGoal.id);

      if (error) throw error;

      await loadData();
      setDeletingGoal(null);
    } catch (error) {
      console.error("Error deleting goal:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingGoal(null);
      loadData();
    }
  };

  const handleContributeClose = (open: boolean) => {
    setIsContributeOpen(open);
    if (!open) {
      setContributingGoal(null);
      loadData();
    }
  };

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Metas Financeiras</h1>
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
            Metas Financeiras
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Defina e acompanhe suas metas de economia
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Meta
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">
            Ativas ({activeGoals.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Concluídas ({completedGoals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeGoals.length === 0 ? (
            <div className="rounded-lg border bg-white p-12 text-center dark:bg-gray-900">
              <p className="text-gray-500 dark:text-gray-400">
                Nenhuma meta ativa encontrada
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={handleEdit}
                  onDelete={setDeletingGoal}
                  onContribute={handleContribute}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedGoals.length === 0 ? (
            <div className="rounded-lg border bg-white p-12 text-center dark:bg-gray-900">
              <p className="text-gray-500 dark:text-gray-400">
                Nenhuma meta concluída ainda
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={handleEdit}
                  onDelete={setDeletingGoal}
                  onContribute={handleContribute}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <GoalDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        goal={editingGoal}
        userId={userId}
      />

      {contributingGoal && (
        <ContributeDialog
          open={isContributeOpen}
          onOpenChange={handleContributeClose}
          goal={contributingGoal}
        />
      )}

      <AlertDialog
        open={!!deletingGoal}
        onOpenChange={() => setDeletingGoal(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a meta "{deletingGoal?.title}"?
              Esta ação não pode ser desfeita.
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
