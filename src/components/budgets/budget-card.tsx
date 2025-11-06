"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Budget } from "@/types";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface BudgetCardProps {
  budget: Budget;
  spent: number;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

export function BudgetCard({
  budget,
  spent,
  onEdit,
  onDelete,
}: BudgetCardProps) {
  const percentage = (spent / budget.amount) * 100;
  const remaining = budget.amount - spent;

  let statusColor = "text-green-600 dark:text-green-400";
  let progressColor = "bg-green-500";
  let statusIcon = <CheckCircle2 className="h-5 w-5" />;

  if (percentage >= 100) {
    statusColor = "text-red-600 dark:text-red-400";
    progressColor = "bg-red-500";
    statusIcon = <AlertTriangle className="h-5 w-5" />;
  } else if (percentage >= 80) {
    statusColor = "text-yellow-600 dark:text-yellow-400";
    progressColor = "bg-yellow-500";
    statusIcon = <AlertTriangle className="h-5 w-5" />;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-lg"
              style={{ backgroundColor: budget.category?.color || "#6b7280" }}
            />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {budget.category?.name || "Categoria"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Orçamento mensal
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(budget)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(budget)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Progress value={Math.min(percentage, 100)} className="h-3" />
            {percentage > 100 && (
              <div
                className="absolute left-0 top-0 h-3 rounded-full bg-red-500"
                style={{ width: "100%" }}
              />
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className={statusColor}>{statusIcon}</span>
              <span className="text-gray-600 dark:text-gray-400">
                R$ {spent.toFixed(2).replace(".", ",")}
              </span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {percentage.toFixed(0)}%
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              R$ {budget.amount.toFixed(2).replace(".", ",")}
            </span>
          </div>

          <div className={`text-sm font-medium ${statusColor}`}>
            {remaining >= 0
              ? `Restam R$ ${remaining.toFixed(2).replace(".", ",")}`
              : `Excedido em R$ ${Math.abs(remaining)
                  .toFixed(2)
                  .replace(".", ",")}`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
