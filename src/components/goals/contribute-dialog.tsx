"use client";

import type React from "react";

import { useState } from "react";
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

interface ContributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: FinancialGoal;
}

export function ContributeDialog({
  open,
  onOpenChange,
  goal,
}: ContributeDialogProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      const contributionAmount = Number.parseFloat(amount);

      if (isNaN(contributionAmount) || contributionAmount <= 0) {
        throw new Error("Valor inválido");
      }

      const newCurrentAmount = goal.current_amount + contributionAmount;
      const newStatus =
        newCurrentAmount >= goal.target_amount ? "completed" : "active";

      const { error } = await supabase
        .from("financial_goals")
        .update({
          current_amount: newCurrentAmount,
          status: newStatus,
        })
        .eq("id", goal.id);

      if (error) throw error;

      router.refresh();
      onOpenChange(false);
      setAmount("");
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Erro ao adicionar contribuição"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const remaining = goal.target_amount - goal.current_amount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Adicionar Contribuição</DialogTitle>
          <DialogDescription>
            Adicione um valor à meta "{goal.title}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Valor atual:
                </span>
                <span className="font-semibold">
                  R$ {goal.current_amount.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Faltam:
                </span>
                <span className="font-semibold text-primary">
                  R$ {remaining.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor da Contribuição (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
              autoFocus
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
              {isLoading ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
