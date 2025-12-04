/**
 * 데이터베이스 타입 정의
 * Supabase에서 생성된 타입을 사용하거나 수동으로 정의
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number; // 원 단위
  category_id: string | null;
  image_url: string | null;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductWithCategory extends Product {
  category: Category | null;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  total_amount: number; // 원 단위
  status: 'pending' | 'paid' | 'cancelled' | 'completed';
  payment_method: string | null;
  payment_id: string | null;
  shipping_address: string | null;
  shipping_name: string | null;
  shipping_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

