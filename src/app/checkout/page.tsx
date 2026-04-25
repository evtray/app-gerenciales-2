'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { trackPurchase } from '@/lib/ga4';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, subtotal, tax, shipping, total, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', nit: 'CF',
  });

  // Prefill form with user data when logged in
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        nit: user.nit || 'CF',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form,
          items: items.map(i => ({
            productId: i.product.id,
            name: i.product.name,
            quantity: i.quantity,
            price: i.product.price,
            internal_ref: i.product.internal_ref,
          })),
          subtotal,
          tax,
          shipping,
          total,
          payment_method: paymentMethod,
        }),
      });

      const data = await res.json();

      if (data.success) {
        trackPurchase({
          transaction_id: data.transaction_id,
          customer: form,
          items,
          subtotal,
          tax,
          shipping,
          total,
          date: new Date().toISOString(),
          payment_method: paymentMethod,
        });
        clearCart();
        router.push(`/confirmation?tid=${data.transaction_id}`);
      } else {
        alert('Error al procesar la compra: ' + (data.error || 'Intenta de nuevo'));
      }
    } catch {
      alert('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🔒</p>
        <h2 className="text-2xl font-bold mb-2">Inicia sesión para continuar</h2>
        <p className="text-gray-500 mb-6">Necesitas una cuenta para completar tu compra</p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="btn-primary inline-block">Iniciar Sesión</Link>
          <Link href="/register" className="inline-block px-6 py-2 border-2 rounded-lg font-semibold transition-colors" style={{ borderColor: '#1B5E20', color: '#1B5E20' }}>Crear Cuenta</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold mb-2">No hay productos en el carrito</h2>
        <Link href="/" className="btn-primary inline-block mt-4">Ir al catálogo</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
        {/* Customer Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Datos del Cliente</h2>
              {user && (
                <span className="text-xs px-2 py-1 rounded-full text-white" style={{ backgroundColor: '#1B5E20' }}>
                  Datos de tu cuenta
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre completo *</label>
                <input name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2" style={{ ['--tw-ring-color' as string]: '#1B5E20' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Correo electrónico *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required readOnly={!!user} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${user ? 'bg-gray-100 cursor-not-allowed' : ''}`} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono *</label>
                <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+502" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">NIT</label>
                <input name="nit" value={form.nit} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Dirección de envío *</label>
                <input name="address" value={form.address} onChange={handleChange} required placeholder="Zona, calle, número, ciudad" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-lg mb-4">Método de Pago</h2>
            <div className="space-y-3">
              {[
                { value: 'card', label: 'Tarjeta de Crédito/Débito', icon: '💳' },
                { value: 'transfer', label: 'Transferencia Bancaria', icon: '🏦' },
                { value: 'cash', label: 'Efectivo contra entrega', icon: '💵' },
              ].map(method => (
                <label key={method.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${paymentMethod === method.value ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="payment" value={method.value} checked={paymentMethod === method.value} onChange={() => setPaymentMethod(method.value)} className="accent-green-700" />
                  <span className="text-xl">{method.icon}</span>
                  <span className="font-medium">{method.label}</span>
                </label>
              ))}
            </div>

            {paymentMethod === 'card' && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500 mb-3">💳 Pasarela de pago simulada</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <input placeholder="Número de tarjeta" defaultValue="4242 4242 4242 4242" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" readOnly />
                  </div>
                  <input placeholder="MM/AA" defaultValue="12/28" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" readOnly />
                  <input placeholder="CVV" defaultValue="123" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" readOnly />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit sticky top-20">
          <h2 className="font-bold text-lg mb-4">Resumen</h2>
          <div className="space-y-2 mb-4">
            {items.map(item => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span className="text-gray-600 truncate mr-2">{item.product.name} x{item.quantity}</span>
                <span className="font-medium flex-shrink-0">Q{(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <hr className="my-3" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>Q{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">IVA (12%)</span><span>Q{tax.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Envío</span><span>Q{shipping.toFixed(2)}</span></div>
            <hr className="my-3" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span style={{ color: '#1B5E20' }}>Q{total.toFixed(2)}</span>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-6 text-center disabled:opacity-50">
            {loading ? 'Procesando...' : `Pagar Q${total.toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  );
}
