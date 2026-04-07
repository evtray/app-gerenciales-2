'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { trackBeginCheckout } from '@/lib/ga4';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, tax, shipping, total, itemCount } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    trackBeginCheckout(items, total);
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-6xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-6">Agrega productos para comenzar tu compra</p>
        <Link href="/" className="btn-primary inline-block">Explorar productos</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Carrito de Compras ({itemCount} productos)</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="md:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.product.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                {item.product.image_url ? (
                  <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">🛒</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{item.product.name}</h3>
                <p className="text-sm text-gray-500">{item.product.internal_ref}</p>
                <p className="font-bold mt-1" style={{ color: '#1B5E20' }}>Q{item.product.price.toFixed(2)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={() => removeItem(item.product.id)} className="text-red-500 text-xs hover:underline">
                  Eliminar
                </button>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-100 text-sm rounded-l-lg">−</button>
                  <span className="px-3 py-1 border-x border-gray-300 text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-100 text-sm rounded-r-lg">+</button>
                </div>
                <p className="text-sm font-semibold">Q{(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit sticky top-20">
          <h2 className="font-bold text-lg mb-4">Resumen del Pedido</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>Q{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">IVA (12%)</span>
              <span>Q{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Envío</span>
              <span>Q{shipping.toFixed(2)}</span>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span style={{ color: '#1B5E20' }}>Q{total.toFixed(2)}</span>
            </div>
          </div>
          <button onClick={handleCheckout} className="btn-primary w-full mt-6 text-center">
            Proceder al Checkout
          </button>
          <Link href="/" className="block text-center mt-3 text-sm hover:underline" style={{ color: '#1B5E20' }}>
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
