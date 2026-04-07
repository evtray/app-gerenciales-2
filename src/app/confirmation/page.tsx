'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('tid') || 'N/A';

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#E8F5E9' }}>
        <span className="text-4xl">✓</span>
      </div>
      <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B5E20' }}>¡Compra Exitosa!</h1>
      <p className="text-gray-600 mb-6">Gracias por tu compra en QuetzalMart</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 text-left">
        <h2 className="font-bold mb-3">Detalles de tu pedido</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">ID de Transacción:</span>
            <span className="font-mono font-medium">{transactionId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Fecha:</span>
            <span>{new Date().toLocaleDateString('es-GT')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Estado:</span>
            <span className="text-green-600 font-medium">Confirmado</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href={`/api/invoice/${transactionId}`} target="_blank" className="btn-secondary inline-block">
          📄 Descargar Factura PDF
        </a>
        <Link href="/" className="btn-primary inline-block">
          Seguir comprando
        </Link>
      </div>

      <p className="text-sm text-gray-400 mt-8">
        Recibirás un correo de confirmación con tu factura adjunta.
      </p>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="text-center py-16">Cargando...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
