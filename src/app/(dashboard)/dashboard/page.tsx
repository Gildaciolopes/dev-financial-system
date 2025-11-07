import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/stat-card";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { MonthlyChart } from "@/components/dashboard/monthly-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import type { Transaction, Category, MonthlyData } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  // Get current month transactions
  const currentDate = new Date();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .eq("user_id", user.id)
    .gte("date", firstDayOfMonth.toISOString().split("T")[0])
    .lte("date", lastDayOfMonth.toISOString().split("T")[0])
    .order("date", { ascending: false });

  // Calculate stats
  const totalIncome =
    (transactions as Transaction[] | undefined)
      ?.filter((t: Transaction) => t.type === "income")
      .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0) || 0;

  const totalExpenses =
    (transactions as Transaction[] | undefined)
      ?.filter((t: Transaction) => t.type === "expense")
      .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0) || 0;

  const balance = totalIncome - totalExpenses;
  const savingsRate =
    totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : "0";

  // Get recent transactions
  const recentTransactions = transactions?.slice(0, 5) || [];

  // Prepare expense chart data
  const expensesByCategory: {
    [key: string]: { amount: number; color: string };
  } = {};
  (transactions as (Transaction & { category?: Category })[] | undefined)
    ?.filter((t) => t.type === "expense" && t.category)
    .forEach((t) => {
      const categoryName = t.category?.name || "Outros";
      const categoryColor = t.category?.color || "#6b7280";
      if (!expensesByCategory[categoryName]) {
        expensesByCategory[categoryName] = { amount: 0, color: categoryColor };
      }
      expensesByCategory[categoryName].amount += Number(t.amount);
    });

  const expenseChartData = Object.entries(expensesByCategory).map(
    ([name, data]) => ({
      name,
      value: data.amount,
      color: data.color,
    })
  );

  // Prepare monthly chart data (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      1
    );
    const monthName = date.toLocaleDateString("pt-BR", { month: "short" });

    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const { data: monthTransactions } = await supabase
      .from("transactions")
      .select("type, amount")
      .eq("user_id", user.id)
      .gte("date", firstDay.toISOString().split("T")[0])
      .lte("date", lastDay.toISOString().split("T")[0]);

    const income =
      (monthTransactions as Transaction[] | undefined)
        ?.filter((t: Transaction) => t.type === "income")
        .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0) ||
      0;

    const expenses =
      (monthTransactions as Transaction[] | undefined)
        ?.filter((t: Transaction) => t.type === "expense")
        .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0) ||
      0;

    monthlyData.push({
      month: monthName,
      income,
      expenses,
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visão geral das suas finanças
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Receitas"
          value={`R$ ${totalIncome.toFixed(2).replace(".", ",")}`}
          icon={TrendingUp}
          iconColor="text-green-600 dark:text-green-400"
          iconBgColor="bg-green-100 dark:bg-green-900/20"
        />
        <StatCard
          title="Despesas"
          value={`R$ ${totalExpenses.toFixed(2).replace(".", ",")}`}
          icon={TrendingDown}
          iconColor="text-red-600 dark:text-red-400"
          iconBgColor="bg-red-100 dark:bg-red-900/20"
        />
        <StatCard
          title="Saldo"
          value={`R$ ${balance.toFixed(2).replace(".", ",")}`}
          icon={Wallet}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBgColor="bg-blue-100 dark:bg-blue-900/20"
        />
        <StatCard
          title="Taxa de Economia"
          value={`${savingsRate}%`}
          icon={PiggyBank}
          iconColor="text-purple-600 dark:text-purple-400"
          iconBgColor="bg-purple-100 dark:bg-purple-900/20"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ExpenseChart data={expenseChartData} />
        <MonthlyChart data={monthlyData} />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions transactions={recentTransactions} />
    </div>
  );
}
