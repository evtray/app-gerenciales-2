import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { findCustomerByEmail, createCustomer, createSaleOrder } from '@/lib/odoo';

// In-memory order store for invoice generation
const orders = new Map<string, Record<string, unknown>>();

export { orders };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer, items, subtotal, tax, shipping, total, payment_method } = body;

    if (!customer || !items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Datos incompletos' }, { status: 400 });
    }

    const transactionId = `QM-${uuidv4().split('-')[0].toUpperCase()}`;

    // Try to sync with Odoo
    let odooOrderId = null;
    try {
      // Find or create customer in Odoo CRM
      let partner = await findCustomerByEmail(customer.email);
      if (!partner) {
        const partnerId = await createCustomer({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
        });
        partner = { id: partnerId };
      }

      // Create sale order in Odoo
      odooOrderId = await createSaleOrder(
        partner.id,
        items.map((item: { productId: number; quantity: number; price: number }) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        }))
      );
    } catch (odooError) {
      console.error('Odoo sync error (non-blocking):', odooError);
      // Continue even if Odoo fails — order is still valid
    }

    // Store order for invoice generation
    const order = {
      transaction_id: transactionId,
      customer,
      items,
      subtotal,
      tax,
      shipping,
      total,
      payment_method,
      date: new Date().toISOString(),
      odoo_order_id: odooOrderId,
    };
    orders.set(transactionId, order);

    return NextResponse.json({
      success: true,
      transaction_id: transactionId,
      odoo_order_id: odooOrderId,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}
