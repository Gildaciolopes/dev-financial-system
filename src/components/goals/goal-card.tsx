"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FinancialGoal } from "@/types";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GoalCardProps {
  goal: FinancialGoal;
  onEdit: (goal: FinancialGoal) => void;
  onDelete: (goal: FinancialGoal) => void;
  onContribute: (goal: FinancialGoal) => void;
}

export function GoalCard({
  goal,
  onEdit,
  onDelete,
  onContribute,
}: GoalCardProps) {
  const progress = (goal.current_amount / goal.target_amount) * 100;
  const isCompleted = goal.status === "completed";
  const remaining = goal.target_amount - goal.current_amount;

  return (
    <Card className={isCompleted ? "border-green-500" : ""}>
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {goal.title}
              </h3>
              {isCompleted && (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              )}
            </div>
            {goal.deadline && (
              <div className="mt-1 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                {format(new Date(goal.deadline), "dd MMM yyyy", {
                  locale: ptBR,
                })}
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(goal)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(goal)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          <Progress value={Math.min(progress, 100)} className="h-3" />

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              R$ {goal.current_amount.toFixed(2).replace(".", ",")}
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {progress.toFixed(0)}%
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              R$ {goal.target_amount.toFixed(2).replace(".", ",")}
            </span>
          </div>

          {!isCompleted && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Faltam: R$ {remaining.toFixed(2).replace(".", ",")}
            </div>
          )}
        </div>
      </CardContent>

      {!isCompleted && (
        <CardFooter className="border-t p-4">
          <Button
            onClick={() => onContribute(goal)}
            className="w-full"
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Contribuição
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
