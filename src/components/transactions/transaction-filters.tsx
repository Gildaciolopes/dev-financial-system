"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import type { Category } from "@/types";
import { Search, X } from "lucide-react";

interface TransactionFiltersProps {
  categories: Category[];
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  type: string;
  categoryId: string;
  dateFrom: string;
  dateTo: string;
}

export function TransactionFilters({
  categories,
  onFilterChange,
}: TransactionFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "all",
    categoryId: "all",
    dateFrom: "",
    dateTo: "",
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterState = {
      search: "",
      type: "all",
      categoryId: "all",
      dateFrom: "",
      dateTo: "",
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters =
    filters.search ||
    filters.type !== "all" ||
    filters.categoryId !== "all" ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Descrição..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={filters.type}
                onValueChange={(value) => handleFilterChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={filters.categoryId}
                onValueChange={(value) =>
                  handleFilterChange("categoryId", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFrom">Data inicial</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">Data final</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                <X className="mr-2 h-4 w-4" />
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
