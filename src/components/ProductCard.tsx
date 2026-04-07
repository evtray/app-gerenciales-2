'use client';

import Link from 'next/link';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { trackAddToCart } from '@/lib/ga4';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
    trackAddToCart(product, 1);
  };

  return (
    <Link href={`/products/${product.id}`} className="card flex flex-col">
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-6xl">
            {getCategoryEmoji(product.name)}
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full self-start mb-2" style={{ backgroundColor: '#E8F5E9', color: '#1B5E20' }}>
          {product.category}
        </span>
        <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
        <p className="text-xs text-gray-500 mb-3">{product.internal_ref}</p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-bold" style={{ color: '#1B5E20' }}>
            Q{product.price.toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            className="btn-primary text-sm !px-3 !py-1.5"
          >
            + Carrito
          </button>
        </div>
      </div>
    </Link>
  );
}

function getCategoryEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('cerveza') || n.includes('refresco') || n.includes('jugo') || n.includes('agua') || n.includes('energizante') || n.includes('leche')) return '🥤';
  if (n.includes('chocolate') || n.includes('galleta') || n.includes('gomita') || n.includes('barra')) return '🍫';
  if (n.includes('jamón') || n.includes('salchicha') || n.includes('queso') || n.includes('huevo') || n.includes('crema') || n.includes('mantequilla')) return '🧀';
  if (n.includes('arroz') || n.includes('frijol') || n.includes('lenteja') || n.includes('atún') || n.includes('elote') || n.includes('durazno')) return '🥫';
  if (n.includes('papa') || n.includes('nacho') || n.includes('palomita') || n.includes('maní') || n.includes('crujiente') || n.includes('mix')) return '🍿';
  if (n.includes('champinon') || n.includes('pimiento') || n.includes('champiñon')) return '🍄';
  if (n.includes('jabón') || n.includes('detergente') || n.includes('cloro') || n.includes('desodorante') || n.includes('pasta dental') || n.includes('papel') || n.includes('acondicionador') || n.includes('limpieza')) return '🧹';
  if (n.includes('café') || n.includes('proteina') || n.includes('proteína')) return '☕';
  return '🛒';
}
