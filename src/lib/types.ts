export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  image_url: string;
  stock: number;
  internal_ref: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
  nit: string;
}

export interface Order {
  transaction_id: string;
  customer: Customer;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  date: string;
  payment_method: string;
}
