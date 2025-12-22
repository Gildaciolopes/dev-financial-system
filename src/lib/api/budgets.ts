import { apiClient, APIResponse } from "./client";

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: string;
  created_at: string;
  category?: {
    id: string;
    name: string;
    type: string;
    color: string;
    icon: string;
  };
}

export interface BudgetWithSpent extends Budget {
  spent: number;
  remaining: number;
  percentage: number;
}

export interface CreateBudgetRequest {
  category_id: string;
  amount: number;
  month: string;
}

export interface UpdateBudgetRequest {
  amount?: number;
  month?: string;
}

export const budgetsAPI = {
  async create(
    token: string,
    data: CreateBudgetRequest
  ): Promise<APIResponse<Budget>> {
    return apiClient.post<Budget>("/budgets", data, token);
  },

  async getAll(token: string, month?: string): Promise<APIResponse<Budget[]>> {
    const query = month ? `?month=${month}` : "";
    return apiClient.get<Budget[]>(`/budgets${query}`, token);
  },

  async getWithSpent(
    token: string,
    month?: string
  ): Promise<APIResponse<BudgetWithSpent[]>> {
    const query = month ? `?month=${month}` : "";
    return apiClient.get<BudgetWithSpent[]>(
      `/budgets/with-spent${query}`,
      token
    );
  },

  async getById(token: string, id: string): Promise<APIResponse<Budget>> {
    return apiClient.get<Budget>(`/budgets/${id}`, token);
  },

  async update(
    token: string,
    id: string,
    data: UpdateBudgetRequest
  ): Promise<APIResponse> {
    return apiClient.put(`/budgets/${id}`, data, token);
  },

  async delete(token: string, id: string): Promise<APIResponse> {
    return apiClient.delete(`/budgets/${id}`, token);
  },
};
