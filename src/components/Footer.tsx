import Image from 'next/image';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#1B5E20' }} className="text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Image
                src="/logoquetzalmart.jpeg"
                alt="QuetzalMart"
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
              <span className="text-lg font-bold">QuetzalMart</span>
            </div>
            <p className="text-green-200 text-sm">
              Tu supermercado en línea. Los mejores productos de Guatemala con entrega a domicilio.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Contacto</h3>
            <p className="text-green-200 text-sm">info@quetzalmart.gt</p>
            <p className="text-green-200 text-sm">+502 2345-6789</p>
            <p className="text-green-200 text-sm">Ciudad de Guatemala</p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Sucursales</h3>
            <p className="text-green-200 text-sm">Guatemala</p>
            <p className="text-green-200 text-sm">México</p>
            <p className="text-green-200 text-sm">El Salvador</p>
          </div>
        </div>
        <div className="border-t border-green-700 mt-6 pt-4 text-center text-green-300 text-sm">
          &copy; 2026 QuetzalMart S.A. — Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
