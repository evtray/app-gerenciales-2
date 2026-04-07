import { CartItem, Product, Order } from './types';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

export function trackViewItem(product: Product) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'view_item', {
    currency: 'GTQ',
    value: product.price,
    items: [{
      item_id: product.internal_ref || product.id.toString(),
      item_name: product.name,
      price: product.price,
      currency: 'GTQ',
      item_category: product.category,
    }],
  });
}

export function trackAddToCart(product: Product, quantity: number) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'add_to_cart', {
    currency: 'GTQ',
    value: product.price * quantity,
    items: [{
      item_id: product.internal_ref || product.id.toString(),
      item_name: product.name,
      price: product.price,
      quantity: quantity,
      currency: 'GTQ',
    }],
  });
}

export function trackBeginCheckout(items: CartItem[], total: number) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'begin_checkout', {
    currency: 'GTQ',
    value: total,
    items: items.map(item => ({
      item_id: item.product.internal_ref || item.product.id.toString(),
      item_name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    })),
  });
}

export function trackPurchase(order: Order) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'purchase', {
    transaction_id: order.transaction_id,
    value: order.total,
    tax: order.tax,
    shipping: order.shipping,
    currency: 'GTQ',
    items: order.items.map(item => ({
      item_id: item.product.internal_ref || item.product.id.toString(),
      item_name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    })),
  });
}
