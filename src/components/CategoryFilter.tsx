'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const CATEGORIES = [
  { label: 'Todos', value: '' },
  { label: 'Bebidas', value: 'Bebidas' },
  { label: 'Lácteos', value: 'Lácteos' },
  { label: 'Snacks', value: 'Snacks' },
  { label: 'Enlatados', value: 'Enlatados' },
  { label: 'Limpieza', value: 'Limpieza' },
  { label: 'Higiene', value: 'Higiene' },
];

export default function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCat = searchParams.get('cat') || '';

  const handleCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) {
      params.set('cat', cat);
    } else {
      params.delete('cat');
    }
    params.delete('q');
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map(cat => (
        <button
          key={cat.value}
          onClick={() => handleCategory(cat.value)}
          className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors border"
          style={
            activeCat === cat.value
              ? { backgroundColor: '#1B5E20', color: 'white', borderColor: '#1B5E20' }
              : { backgroundColor: 'white', color: '#212121', borderColor: '#E0E0E0' }
          }
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
