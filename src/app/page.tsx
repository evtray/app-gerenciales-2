import { Suspense } from 'react';
import CatalogClient from '@/components/CatalogClient';

export default function Home() {
  return (
    <Suspense fallback={<CatalogLoading />}>
      <CatalogClient />
    </Suspense>
  );
}

function CatalogLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-64 mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-72"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
