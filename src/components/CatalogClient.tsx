'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';

export default function CatalogClient() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const query = searchParams.get('q') || '';
  const category = searchParams.get('cat') || '';

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (category) params.set('cat', category);
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [query, category]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Banner */}
      <div className="rounded-2xl p-8 mb-8 text-white" style={{ background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)' }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Bienvenido a QuetzalMart</h1>
        <p className="text-green-100 mb-6 text-lg">Los mejores productos de Guatemala, directo a tu puerta.</p>
        <SearchBar />
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <CategoryFilter />
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-600">
          {loading ? 'Cargando...' : `${products.length} productos encontrados`}
          {query && ` para "${query}"`}
          {category && ` en ${category}`}
        </p>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-72 animate-pulse"></div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-xl text-gray-600">No se encontraron productos</p>
          <p className="text-gray-400 mt-2">Intenta con otra búsqueda o categoría</p>
        </div>
      )}
    </div>
  );
}
