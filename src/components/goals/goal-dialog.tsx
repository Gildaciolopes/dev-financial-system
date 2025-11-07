"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FinancialGoal } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: FinancialGoal | null;
  userId: string;
}

export function GoalDialog({
  open,
  onOpenChange,
  goal,
  userId,
}: GoalDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: goal?.title || "",
    target_amount: goal?.target_amount.toString() || "",
    current_amount: goal?.current_amount.toString() || "0",
    deadline: goal?.deadline || "",
  });

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        target_amount: goal.target_amount.toString(),
        current_amount: goal.current_amount.toString(),
        deadline: goal.deadline || "",
      });
    } else {
      setFormData({
        title: "",
        target_amount: "",
        current_amount: "0",
        deadline: "",
      });
    }
  }, [goal, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      const targetAmount = Number.parseFloat(formData.target_amount);
      const currentAmount = Number.parseFloat(formData.current_amount);

      if (isNaN(targetAmount) || targetAmount <= 0) {
        throw new Error("Valor da meta inválido");
      }

      if (isNaN(currentAmount) || currentAmount < 0) {
        throw new Error("Valor atual inválido");
      }

      const goalData = {
        user_id: userId,
        title: formData.title.trim(),
        target_amount: targetAmount,
        current_amount: currentAmount,
        deadline: formData.deadline || null,
        status: currentAmount >= targetAmount ? "completed" : "active",
      };

      if (goal) {
        const { error } = await supabase
          .from("financial_goals")
          .update(goalData)
          .eq("id", goal.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("financial_goals")
          .insert([goalData]);

        if (error) throw error;
      }

      router.refresh();
      onOpenChange(false);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao salvar meta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {goal ? "Editar Meta" : "Nova Meta Financeira"}
          </DialogTitle>
          <DialogDescription>
            {goal
              ? "Atualize os dados da sua meta"
              : "Defina uma nova meta financeira para alcançar"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Meta</Label>
            <Input
              id="title"
              placeholder="Ex: Viagem, Carro novo, Reserva de emergência..."
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="target_amount">Valor da Meta (R$)</Label>
              <Input
                id="target_amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                required
                value={formData.target_amount}
                onChange={(e) =>
                  setFormData({ ...formData, target_amount: e.target.value })
                }
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_amount">Valor Atual (R$)</Label>
              <Input
                id="current_amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                required
                value={formData.current_amount}
                onChange={(e) =>
                  setFormData({ ...formData, current_amount: e.target.value })
                }
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Prazo (opcional)</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : goal ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
