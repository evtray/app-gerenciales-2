'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { itemCount } = useCart();
  const { user, loading, logout } = useAuth();

  return (
    <nav style={{ backgroundColor: '#1B5E20' }} className="text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logoquetzalmart.jpeg"
            alt="QuetzalMart"
            width={44}
            height={44}
            className="rounded-full object-cover"
            priority
          />
          <span className="text-xl font-bold tracking-tight">QuetzalMart</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="hover:text-yellow-300 transition-colors font-medium">
            Inicio
          </Link>
          <Link href="/?cat=Bebidas" className="hover:text-yellow-300 transition-colors">
            Bebidas
          </Link>
          <Link href="/?cat=Alimentos" className="hover:text-yellow-300 transition-colors">
            Alimentos
          </Link>
          <Link href="/?cat=Limpieza" className="hover:text-yellow-300 transition-colors">
            Limpieza
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Cart */}
          <Link href="/cart" className="relative flex items-center gap-2 hover:text-yellow-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <span className="font-semibold hidden sm:inline">Carrito</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-3 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center" style={{ backgroundColor: '#FFD600', color: '#1B5E20' }}>
                {itemCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {!loading && (
            user ? (
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium hidden md:inline">{user.name.split(' ')[0]}</span>
                <button
                  onClick={logout}
                  className="text-sm hover:text-yellow-300 transition-colors underline underline-offset-2"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm hover:text-yellow-300 transition-colors font-medium"
                >
                  Ingresar
                </Link>
                <span className="text-green-300">|</span>
                <Link
                  href="/register"
                  className="text-sm hover:text-yellow-300 transition-colors font-medium"
                >
                  Registro
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
