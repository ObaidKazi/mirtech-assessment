export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  stock_quantity: number;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: string;
  order_date: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  product?: {
    id: number;
    name: string;
    price: number;
    category: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface FilterParams {
  page?: number;
  size?: number;
  search?: string;
  category?: string;
  brand?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface Stats {
  total_products: number;
  total_users: number;
  total_orders: number;
  active_products: number;
  active_users: number;
}