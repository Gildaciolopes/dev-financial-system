import { apiClient, APIResponse } from "./client";

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
  created_at: string;
}

export interface CreateCategoryRequest {
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  color?: string;
  icon?: string;
}

export const categoriesAPI = {
  async create(
    token: string,
    data: CreateCategoryRequest
  ): Promise<APIResponse<Category>> {
    return apiClient.post<Category>("/categories", data, token);
  },

  async getAll(
    token: string,
    type?: "income" | "expense"
  ): Promise<APIResponse<Category[]>> {
    const query = type ? `?type=${type}` : "";
    return apiClient.get<Category[]>(`/categories${query}`, token);
  },

  async getById(token: string, id: string): Promise<APIResponse<Category>> {
    return apiClient.get<Category>(`/categories/${id}`, token);
  },

  async update(
    token: string,
    id: string,
    data: UpdateCategoryRequest
  ): Promise<APIResponse> {
    return apiClient.put(`/categories/${id}`, data, token);
  },

  async delete(token: string, id: string): Promise<APIResponse> {
    return apiClient.delete(`/categories/${id}`, token);
  },
};
