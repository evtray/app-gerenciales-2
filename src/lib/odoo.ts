const ODOO_URL = process.env.ODOO_URL || 'https://odoogrupo7.3utilities.com';
const ODOO_DB = process.env.ODOO_DB || 'QuetzalMart-db';
const ODOO_USER = process.env.ODOO_USER || 'tarogg7@gmail.com';
const ODOO_PASSWORD = process.env.ODOO_PASSWORD || 'admin1234';

let cachedUid: number | null = null;

async function jsonRpc(url: string, method: string, params: Record<string, unknown>) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      id: Date.now(),
      params: { service: params.service, method, args: params.args },
    }),
  });
  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.data?.message || data.error.message || 'Odoo RPC Error');
  }
  return data.result;
}

export async function authenticate(): Promise<number> {
  if (cachedUid) return cachedUid;
  const uid = await jsonRpc(`${ODOO_URL}/jsonrpc`, 'login', {
    service: 'common',
    args: [ODOO_DB, ODOO_USER, ODOO_PASSWORD],
  });
  if (!uid) throw new Error('Authentication failed');
  cachedUid = uid;
  return uid;
}

export async function execute(model: string, method: string, args: unknown[], kwargs?: Record<string, unknown>) {
  const uid = await authenticate();
  return jsonRpc(`${ODOO_URL}/jsonrpc`, 'execute_kw', {
    service: 'object',
    args: [ODOO_DB, uid, ODOO_PASSWORD, model, method, args, kwargs || {}],
  });
}

export async function getProducts(search?: string, category?: string) {
  const domain: unknown[][] = [['sale_ok', '=', true]];
  if (search) {
    domain.push(['name', 'ilike', search]);
  }
  if (category) {
    domain.push(['categ_id.name', 'ilike', category]);
  }

  const products = await execute('product.template', 'search_read', [domain], {
    fields: ['id', 'name', 'description_sale', 'list_price', 'categ_id', 'default_code', 'qty_available', 'image_1920'],
    limit: 50,
    order: 'name asc',
  });

  return products.map((p: Record<string, unknown>) => ({
    id: p.id,
    name: p.name || '',
    description: p.description_sale || '',
    price: p.list_price || 0,
    currency: 'GTQ',
    category: Array.isArray(p.categ_id) ? p.categ_id[1] : 'General',
    image_url: p.image_1920 ? `data:image/png;base64,${p.image_1920}` : '',
    stock: p.qty_available || 0,
    internal_ref: p.default_code || `prod_${p.id}`,
  }));
}

export async function getProductById(id: number) {
  const products = await execute('product.template', 'search_read', [[['id', '=', id]]], {
    fields: ['id', 'name', 'description_sale', 'list_price', 'categ_id', 'default_code', 'qty_available', 'image_1920'],
  });

  if (!products || products.length === 0) return null;
  const p = products[0];

  return {
    id: p.id,
    name: p.name || '',
    description: p.description_sale || `Producto QuetzalMart - ${p.name}`,
    price: p.list_price || 0,
    currency: 'GTQ',
    category: Array.isArray(p.categ_id) ? p.categ_id[1] : 'General',
    image_url: p.image_1920 ? `data:image/png;base64,${p.image_1920}` : '',
    stock: p.qty_available || 0,
    internal_ref: p.default_code || `prod_${p.id}`,
  };
}

export async function createCustomer(customer: { name: string; email: string; phone: string; address: string }) {
  const partnerId = await execute('res.partner', 'create', [{
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    street: customer.address,
    customer_rank: 1,
  }]);
  return partnerId;
}

export async function findCustomerByEmail(email: string) {
  const partners = await execute('res.partner', 'search_read', [[['email', '=', email]]], {
    fields: ['id', 'name', 'email'],
    limit: 1,
  });
  return partners.length > 0 ? partners[0] : null;
}

export async function createSaleOrder(partnerId: number, items: { productId: number; quantity: number; price: number; name?: string }[]) {
  const orderLines = items.map(item => [0, 0, {
    product_template_id: item.productId,
    name: item.name || `Producto ${item.productId}`,
    product_uom_qty: item.quantity,
    price_unit: item.price,
  }]);

  const orderId = await execute('sale.order', 'create', [{
    partner_id: partnerId,
    order_line: orderLines,
  }]);

  // Confirm the sale order to trigger inventory update
  try {
    await execute('sale.order', 'action_confirm', [[orderId]]);
  } catch {
    // Some Odoo configs may not allow auto-confirm
  }

  return orderId;
}
