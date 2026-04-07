'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { trackViewItem, trackAddToCart } from '@/lib/ga4';
import Link from 'next/link';

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products?id=${params.id}`);
        const data = await res.json();
        if (data.product) {
          setProduct(data.product);
          trackViewItem(data.product);
        }
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    trackAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="h-80 bg-gray-200 rounded-xl"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-2xl font-bold mb-2">Producto no encontrado</h2>
        <Link href="/" className="btn-primary inline-block mt-4">Volver al catálogo</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/" className="text-sm hover:underline mb-6 inline-block" style={{ color: '#1B5E20' }}>
        ← Volver al catálogo
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 h-80 flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-8xl">🛒</span>
          )}
        </div>

        <div>
          <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: '#E8F5E9', color: '#1B5E20' }}>
            {product.category}
          </span>
          <h1 className="text-2xl font-bold mt-3 mb-1">{product.name}</h1>
          <p className="text-sm text-gray-500 mb-4">SKU: {product.internal_ref}</p>
          <p className="text-3xl font-bold mb-4" style={{ color: '#1B5E20' }}>
            Q{product.price.toFixed(2)}
          </p>
          <p className="text-gray-600 mb-6">
            {product.description || `Producto de alta calidad disponible en QuetzalMart. Disfruta de los mejores precios con entrega a domicilio en Guatemala.`}
          </p>

          <p className="text-sm mb-4">
            <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
              {product.stock > 0 ? `✓ ${Math.floor(product.stock)} unidades disponibles` : '✗ Agotado'}
            </span>
          </p>

          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium">Cantidad:</label>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1.5 hover:bg-gray-100 rounded-l-lg"
              >
                −
              </button>
              <span className="px-4 py-1.5 border-x border-gray-300 font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-1.5 hover:bg-gray-100 rounded-r-lg"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleAddToCart} className="btn-primary flex-1" disabled={product.stock <= 0}>
              {added ? '✓ Agregado!' : 'Agregar al carrito'}
            </button>
            <button
              onClick={() => { handleAddToCart(); router.push('/cart'); }}
              className="btn-secondary flex-1"
              disabled={product.stock <= 0}
            >
              Comprar ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
