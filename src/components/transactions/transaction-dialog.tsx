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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category, Transaction } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
  categories: Category[];
  userId: string;
  onSave?: (saved: Transaction) => void;
}

export function TransactionDialog({
  open,
  onOpenChange,
  transaction,
  categories,
  userId,
  onSave,
}: TransactionDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: transaction?.type || "expense",
    amount: transaction?.amount.toString() || "",
    description: transaction?.description || "",
    date: transaction?.date || new Date().toISOString().split("T")[0],
    category_id: transaction?.category_id || "",
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount.toString(),
        description: transaction.description || "",
        date: transaction.date,
        category_id: transaction.category_id || "",
      });
    } else {
      setFormData({
        type: "expense",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        category_id: "",
      });
    }
  }, [transaction, open]);

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

  const filteredCategories = categories.filter(
    (cat) => cat.type === formData.type
  );

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

      const transactionData = {
        user_id: userId,
        type: formData.type,
        amount,
        description: formData.description || null,
        date: formData.date,
        category_id: formData.category_id || null,
      };

      let saved: any = null;
      if (transaction) {
        const { data, error } = await supabase
          .from("transactions")
          .update(transactionData)
          .eq("id", transaction.id)
          .select("*, category:categories(*)")
          .single();

        if (error) throw error;
        saved = data;
      } else {
        const { data, error } = await supabase
          .from("transactions")
          .insert([transactionData])
          .select("*, category:categories(*)")
          .single();

        if (error) throw error;
        saved = data;
      }

      if (onSave && saved) onSave(saved as Transaction);

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
        error instanceof Error ? error.message : "Erro ao salvar transação"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {transaction ? "Editar Transação" : "Nova Transação"}
          </DialogTitle>
          <DialogDescription>
            {transaction
              ? "Atualize os dados da transação"
              : "Adicione uma nova transação ao seu histórico"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  type: value as "income" | "expense",
                  category_id: "",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
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
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) =>
                setFormData({ ...formData, category_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              required
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Adicione uma descrição (opcional)"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={isLoading}
              rows={3}
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
              {isLoading ? "Salvando..." : transaction ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
