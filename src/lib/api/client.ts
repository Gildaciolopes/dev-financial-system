const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  page?: number;
  limit?: number;
  total_count?: number;
  total_pages?: number;
}

export interface APIError {
  success: false;
  error: string;
  message?: string;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string,
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        cache: options.cache || "no-store",
        keepalive: true,
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          success: false,
          error: data.error || "Request failed",
          message: data.message,
        };
      }

      return data;
    } catch (error: any) {
      if (error.success === false) {
        throw error;
      }
      throw {
        success: false,
        error: "Network error",
        message: error.message || "Failed to connect to server",
      };
    }
  }

  async get<T>(endpoint: string, token?: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" }, token);
  }

  async post<T>(
    endpoint: string,
    body: any,
    token?: string,
  ): Promise<APIResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      token,
    );
  }

  async put<T>(
    endpoint: string,
    body: any,
    token?: string,
  ): Promise<APIResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: "PUT",
        body: JSON.stringify(body),
      },
      token,
    );
  }

  async delete<T>(endpoint: string, token?: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" }, token);
  }
}

export const apiClient = new APIClient();
