import { apiClient, APIResponse } from "./client";

export interface Transaction {
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

export interface CreateTransactionRequest {
  category_id?: string | null;
  type: "income" | "expense";
  amount: number;
  description: string;
  date: string;
}

export interface UpdateTransactionRequest {
  category_id?: string;
  type?: "income" | "expense";
  amount?: number;
  description?: string;
  date?: string;
}

export interface TransactionFilters {
  type?: "income" | "expense";
  category_id?: string;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
  page?: number;
  limit?: number;
}

export const transactionsAPI = {
  async create(
    token: string,
    data: CreateTransactionRequest
  ): Promise<APIResponse<Transaction>> {
    return apiClient.post<Transaction>("/transactions", data, token);
  },

  async getAll(
    token: string,
    filters?: TransactionFilters
  ): Promise<APIResponse<Transaction[]>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    return apiClient.get<Transaction[]>(`/transactions${query}`, token);
  },

  async getById(token: string, id: string): Promise<APIResponse<Transaction>> {
    return apiClient.get<Transaction>(`/transactions/${id}`, token);
  },

  async update(
    token: string,
    id: string,
    data: UpdateTransactionRequest
  ): Promise<APIResponse> {
    return apiClient.put(`/transactions/${id}`, data, token);
  },

  async delete(token: string, id: string): Promise<APIResponse> {
    return apiClient.delete(`/transactions/${id}`, token);
  },
};
