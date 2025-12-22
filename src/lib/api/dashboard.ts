import { apiClient, APIResponse } from "./client";

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
}

export interface ExpenseByCategory {
  category: string;
  amount: number;
  color: string;
  percentage: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

export interface DailyData {
  date: string;
  income: number;
  expenses: number;
}

export interface RecentTransaction {
  id: string;
  user_id: string;
  category_id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    type: string;
    color: string;
    icon: string;
  };
}

export const dashboardAPI = {
  async getStats(
    token: string,
    startDate?: string,
    endDate?: string
  ): Promise<APIResponse<DashboardStats>> {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const query = params.toString() ? `?${params.toString()}` : "";
    return apiClient.get<DashboardStats>(`/dashboard/stats${query}`, token);
  },

  async getExpensesByCategory(
    token: string,
    startDate?: string,
    endDate?: string
  ): Promise<APIResponse<ExpenseByCategory[]>> {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const query = params.toString() ? `?${params.toString()}` : "";
    return apiClient.get<ExpenseByCategory[]>(
      `/dashboard/expenses-by-category${query}`,
      token
    );
  },

  async getMonthlyData(
    token: string,
    months: number = 6
  ): Promise<APIResponse<MonthlyData[]>> {
    return apiClient.get<MonthlyData[]>(
      `/dashboard/monthly-data?months=${months}`,
      token
    );
  },

  async getDailyData(
    token: string,
    startDate?: string,
    endDate?: string
  ): Promise<APIResponse<DailyData[]>> {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const query = params.toString() ? `?${params.toString()}` : "";
    return apiClient.get<DailyData[]>(`/dashboard/daily-data${query}`, token);
  },

  async getRecentTransactions(
    token: string,
    limit: number = 10
  ): Promise<APIResponse<RecentTransaction[]>> {
    return apiClient.get<RecentTransaction[]>(
      `/dashboard/recent-transactions?limit=${limit}`,
      token
    );
  },
};
