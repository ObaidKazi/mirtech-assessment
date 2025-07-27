const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getProducts(params: Record<string, any> = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.request(`/products?${searchParams.toString()}`);
  }

  async getProduct(id: number) {
    return this.request(`/products/${id}`);
  }

  async getUsers(params: Record<string, any> = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.request(`/users?${searchParams.toString()}`);
  }

  async getUser(id: number) {
    return this.request(`/users/${id}`);
  }

  async getOrders(params: Record<string, any> = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.request(`/orders?${searchParams.toString()}`);
  }

  async getOrder(id: number) {
    return this.request(`/orders/${id}`);
  }

  async getStats() {
    return this.request('/stats');
  }

  async seedData() {
    return this.request('/seed-data', { method: 'POST' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);