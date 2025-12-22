import { apiClient, APIResponse } from "./client";

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  status: "active" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface CreateGoalRequest {
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
}

export interface UpdateGoalRequest {
  title?: string;
  target_amount?: number;
  current_amount?: number;
  deadline?: string;
  status?: "active" | "completed" | "cancelled";
}

export interface ContributeRequest {
  amount: number;
}

export const goalsAPI = {
  async create(
    token: string,
    data: CreateGoalRequest
  ): Promise<APIResponse<Goal>> {
    return apiClient.post<Goal>("/goals", data, token);
  },

  async getAll(token: string, status?: string): Promise<APIResponse<Goal[]>> {
    const query = status ? `?status=${status}` : "";
    return apiClient.get<Goal[]>(`/goals${query}`, token);
  },

  async getById(token: string, id: string): Promise<APIResponse<Goal>> {
    return apiClient.get<Goal>(`/goals/${id}`, token);
  },

  async update(
    token: string,
    id: string,
    data: UpdateGoalRequest
  ): Promise<APIResponse> {
    return apiClient.put(`/goals/${id}`, data, token);
  },

  async delete(token: string, id: string): Promise<APIResponse> {
    return apiClient.delete(`/goals/${id}`, token);
  },

  async contribute(
    token: string,
    id: string,
    data: ContributeRequest
  ): Promise<APIResponse> {
    return apiClient.post(`/goals/${id}/contribute`, data, token);
  },
};
