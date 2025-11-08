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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Budget, Category } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: Budget | null;
  categories: Category[];
  userId: string;
  currentMonth: string;
  onSave?: (saved: Budget) => void;
}

export function BudgetDialog({
  open,
  onOpenChange,
  budget,
  categories,
  userId,
  currentMonth,
  onSave,
}: BudgetDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category_id: budget?.category_id || "",
    amount: budget?.amount.toString() || "",
    month: budget?.month || currentMonth,
  });

  useEffect(() => {
    if (budget) {
      setFormData({
        category_id: budget.category_id,
        amount: budget.amount.toString(),
        month: budget.month,
      });
    } else {
      setFormData({
        category_id: "",
        amount: "",
        month: currentMonth,
      });
    }
  }, [budget, open, currentMonth]);

  // When opening, blur any active element and try to close poppers so Radix
  // can apply aria-hidden without being blocked by a focused descendant.
  useEffect(() => {
    if (open && typeof window !== "undefined") {
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
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      const amount = Number.parseFloat(formData.amount);

      if (isNaN(amount) || amount <= 0) {
        throw new Error("Valor inválido");
      }

      if (!formData.category_id) {
        throw new Error("Selecione uma categoria");
      }

      // The DB `month` column is of type DATE. The HTML month input returns "YYYY-MM".
      // Postgres expects a full date (YYYY-MM-DD), so normalize to the first day of the month.
      const normalizedMonth = /^\d{4}-\d{2}$/.test(formData.month)
        ? `${formData.month}-01`
        : formData.month;

      const budgetData = {
        user_id: userId,
        category_id: formData.category_id,
        amount,
        month: normalizedMonth,
      };

      let saved: Budget | null = null;
      if (budget) {
        const { data, error } = await supabase
          .from("budgets")
          .update(budgetData)
          .eq("id", budget.id)
          .select("*, category:categories(*)")
          .single();

        if (error) throw error;
        saved = data as Budget;
      } else {
        const { data, error } = await supabase
          .from("budgets")
          .insert([budgetData])
          .select("*, category:categories(*)")
          .single();

        if (error) throw error;
        saved = data as Budget;
      }

      if (onSave && saved) {
        onSave(saved);
      } else {
        router.refresh();
      }

      if (typeof window !== "undefined") {
        try {
          (document.activeElement as HTMLElement | null)?.blur();
        } catch (e) {
          // ignore
        }
      }

      onOpenChange(false);
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Erro ao salvar orçamento"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const expenseCategories = categories.filter((c) => c.type === "expense");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {budget ? "Editar Orçamento" : "Novo Orçamento"}
          </DialogTitle>
          <DialogDescription>
            {budget
              ? "Atualize o orçamento da categoria"
              : "Defina um orçamento mensal para uma categoria"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) =>
                setFormData({ ...formData, category_id: value })
              }
              disabled={!!budget}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {budget && (
              <p className="text-xs text-gray-500">
                A categoria não pode ser alterada após a criação
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor do Orçamento (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              required
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="month">Mês</Label>
            <Input
              id="month"
              type="month"
              required
              value={formData.month}
              onChange={(e) =>
                setFormData({ ...formData, month: e.target.value })
              }
              disabled={isLoading || !!budget}
            />
            {budget && (
              <p className="text-xs text-gray-500">
                O mês não pode ser alterado após a criação
              </p>
            )}
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
              {isLoading ? "Salvando..." : budget ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
