import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getProductById } from '@/lib/odoo';

// In-memory fallback products (used when Odoo is unreachable)
const FALLBACK_PRODUCTS = [
  { id: 1, name: 'Leche Entera 1L', description: 'Leche fresca entera', price: 8.50, currency: 'GTQ', category: 'Lácteos', image_url: '', stock: 450, internal_ref: 'prod_01' },
  { id: 2, name: 'Queso Mozzarella 250g', description: 'Queso mozzarella fresco', price: 25.00, currency: 'GTQ', category: 'Lácteos', image_url: '', stock: 515, internal_ref: 'prod_03' },
  { id: 3, name: 'Mantequilla 200g', description: 'Mantequilla de leche', price: 18.00, currency: 'GTQ', category: 'Lácteos', image_url: '', stock: 899, internal_ref: 'prod_04' },
  { id: 4, name: 'Agua Mineral 500ml', description: 'Agua mineral natural', price: 5.00, currency: 'GTQ', category: 'Bebidas', image_url: '', stock: 1060, internal_ref: 'prod_08' },
  { id: 5, name: 'Jugo Naranja 1L', description: 'Jugo de naranja natural', price: 20.00, currency: 'GTQ', category: 'Bebidas', image_url: '', stock: 809, internal_ref: 'prod_07' },
  { id: 6, name: 'Cerveza Lager 6 Pack', description: 'Cerveza lager premium', price: 45.00, currency: 'GTQ', category: 'Bebidas', image_url: '', stock: 925, internal_ref: 'prod_09' },
  { id: 7, name: 'Energizante 250ml', description: 'Bebida energizante', price: 12.00, currency: 'GTQ', category: 'Bebidas', image_url: '', stock: 1273, internal_ref: 'prod_10' },
  { id: 8, name: 'Refresco Cola 2L', description: 'Refresco de cola', price: 15.00, currency: 'GTQ', category: 'Bebidas', image_url: '', stock: 874, internal_ref: 'prod_06' },
  { id: 9, name: 'Detergente Líquido 1L', description: 'Detergente multiusos', price: 35.00, currency: 'GTQ', category: 'Limpieza', image_url: '', stock: 483, internal_ref: 'prod_11' },
  { id: 10, name: 'Cloro 1L', description: 'Cloro desinfectante', price: 12.00, currency: 'GTQ', category: 'Limpieza', image_url: '', stock: 2606, internal_ref: 'prod_13' },
  { id: 11, name: 'Jabón de Trastes 500ml', description: 'Jabón líquido para trastes', price: 15.00, currency: 'GTQ', category: 'Limpieza', image_url: '', stock: 4613, internal_ref: 'prod_14' },
  { id: 12, name: 'Papel Higiénico 12 Rollos', description: 'Papel higiénico suave', price: 40.00, currency: 'GTQ', category: 'Higiene', image_url: '', stock: 4586, internal_ref: 'prod_15' },
  { id: 13, name: 'Pasta Dental 100g', description: 'Pasta dental con flúor', price: 18.00, currency: 'GTQ', category: 'Higiene', image_url: '', stock: 45732, internal_ref: 'prod_38' },
  { id: 14, name: 'Desodorante 50ml', description: 'Desodorante antitranspirante', price: 25.00, currency: 'GTQ', category: 'Higiene', image_url: '', stock: 925, internal_ref: 'prod_39' },
  { id: 15, name: 'Papas Fritas 150g', description: 'Papas fritas crujientes', price: 10.00, currency: 'GTQ', category: 'Snacks', image_url: '', stock: 9029, internal_ref: 'prod_16' },
  { id: 16, name: 'Galletas Chocolate 200g', description: 'Galletas de chocolate', price: 18.00, currency: 'GTQ', category: 'Snacks', image_url: '', stock: 89805, internal_ref: 'prod_17' },
  { id: 17, name: 'Nachos Queso 200g', description: 'Nachos sabor queso', price: 22.00, currency: 'GTQ', category: 'Snacks', image_url: '', stock: 7933, internal_ref: 'prod_41' },
  { id: 18, name: 'Chocolate Barra 50g', description: 'Chocolate con leche', price: 8.00, currency: 'GTQ', category: 'Snacks', image_url: '', stock: 4651, internal_ref: 'prod_19' },
  { id: 19, name: 'Arroz Enlatado 400g', description: 'Arroz blanco enlatado', price: 16.00, currency: 'GTQ', category: 'Enlatados', image_url: '', stock: 20028, internal_ref: 'prod_46' },
  { id: 20, name: 'Frijoles Enlatados 400g', description: 'Frijoles negros enlatados', price: 12.00, currency: 'GTQ', category: 'Enlatados', image_url: '', stock: 823, internal_ref: 'prod_21' },
  { id: 21, name: 'Atún en Agua 140g', description: 'Atún en agua', price: 18.00, currency: 'GTQ', category: 'Enlatados', image_url: '', stock: 456769, internal_ref: 'prod_22' },
  { id: 22, name: 'Salsa Tomate 400g', description: 'Salsa de tomate', price: 15.00, currency: 'GTQ', category: 'Enlatados', image_url: '', stock: 1265, internal_ref: 'prod_23' },
  { id: 23, name: 'Café Instantáneo 200g', description: 'Café instantáneo', price: 55.00, currency: 'GTQ', category: 'Bebidas', image_url: '', stock: 1014, internal_ref: 'prod_33' },
  { id: 24, name: 'Proteína Whey 1kg', description: 'Proteína de suero', price: 350.00, currency: 'GTQ', category: 'Suplementos', image_url: '', stock: 4508, internal_ref: 'prod_35' },
  { id: 25, name: 'Aceitunas 300g', description: 'Aceitunas verdes', price: 32.00, currency: 'GTQ', category: 'Enlatados', image_url: '', stock: 4636, internal_ref: 'prod_49' },
  { id: 26, name: 'Jamón de Pavo 500g', description: 'Jamón de pavo', price: 45.00, currency: 'GTQ', category: 'Embutidos', image_url: '', stock: 45691, internal_ref: 'prod_27' },
  { id: 27, name: 'Salchichas 8 Pack', description: 'Salchichas de cerdo', price: 22.00, currency: 'GTQ', category: 'Embutidos', image_url: '', stock: 50182, internal_ref: 'prod_29' },
  { id: 28, name: 'Huevo Docena', description: 'Huevos frescos', price: 25.00, currency: 'GTQ', category: 'Lácteos', image_url: '', stock: 1025, internal_ref: 'prod_26' },
  { id: 29, name: 'Crema Ácida 400g', description: 'Crema ácida', price: 15.00, currency: 'GTQ', category: 'Lácteos', image_url: '', stock: 822, internal_ref: 'prod_05' },
  { id: 30, name: 'Leche Chocolate 1L', description: 'Leche con chocolate', price: 14.00, currency: 'GTQ', category: 'Bebidas', image_url: '', stock: 4613, internal_ref: 'prod_30' },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const query = searchParams.get('q') || '';
  const category = searchParams.get('cat') || '';

  // Single product by ID
  if (id) {
    try {
      const product = await getProductById(Number(id));
      if (product) {
        return NextResponse.json({ product });
      }
    } catch {
      // Fallback
      const fallback = FALLBACK_PRODUCTS.find(p => p.id === Number(id));
      if (fallback) return NextResponse.json({ product: fallback });
    }
    return NextResponse.json({ product: null }, { status: 404 });
  }

  // Product listing
  try {
    const products = await getProducts(query || undefined, category || undefined);
    return NextResponse.json({ products });
  } catch {
    // Fallback to local data
    let filtered = FALLBACK_PRODUCTS;
    if (query) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    }
    if (category) {
      filtered = filtered.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
    }
    return NextResponse.json({ products: filtered });
  }
}
