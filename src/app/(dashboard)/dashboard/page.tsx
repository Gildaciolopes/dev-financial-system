"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { StatCard } from "@/components/dashboard/stat-card";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { DailyChart } from "@/components/dashboard/daily-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import {
  dashboardAPI,
  DashboardStats,
  ExpenseByCategory,
  MonthlyData,
  DailyData,
  RecentTransaction,
} from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [expensesByCategory, setExpensesByCategory] = useState<
    ExpenseByCategory[]
  >([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<
    RecentTransaction[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    async function loadDashboardData() {
      if (!token) return;

      try {
        setLoading(true);

        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const startDate = firstDay.toISOString().split("T")[0];
        const endDate = lastDay.toISOString().split("T")[0];

        const statsRes = await dashboardAPI.getStats(token, startDate, endDate);
        const expensesRes = await dashboardAPI.getExpensesByCategory(
          token,
          startDate,
          endDate
        );
        const monthlyRes = await dashboardAPI.getMonthlyData(token, 6);
        const dailyRes = await dashboardAPI.getDailyData(
          token,
          startDate,
          endDate
        );
        const transactionsRes = await dashboardAPI.getRecentTransactions(
          token,
          5
        );

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }

        if (expensesRes.success && expensesRes.data) {
          setExpensesByCategory(expensesRes.data);
        }

        if (monthlyRes.success && monthlyRes.data) {
          setMonthlyData(monthlyRes.data);
        }

        if (dailyRes.success && dailyRes.data) {
          setDailyData(dailyRes.data);
        }

        if (transactionsRes.success && transactionsRes.data) {
          setRecentTransactions(transactionsRes.data);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadDashboardData();
    }
  }, [token]);

  if (authLoading || loading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return null;
  }

  const totalIncome = stats?.totalIncome || 0;
  const totalExpenses = stats?.totalExpenses || 0;
  const balance = stats?.balance || 0;
  const savingsRate = stats?.savingsRate || 0;

  const expenseChartData = expensesByCategory.map((item) => ({
    name: item.category,
    value: item.amount,
    color: item.color,
  }));

  const dailyChartData = dailyData.map((item) => ({
    day: new Date(item.date).getDate().toString(),
    income: item.income,
    expenses: item.expenses,
  }));

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
          value={`${savingsRate.toFixed(1)}%`}
          icon={PiggyBank}
          iconColor="text-purple-600 dark:text-purple-400"
          iconBgColor="bg-purple-100 dark:bg-purple-900/20"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <ExpenseChart data={expenseChartData} />
        <DailyChart data={dailyChartData} />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions transactions={recentTransactions} />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>

      <Skeleton className="h-96" />
    </div>
  );
}
