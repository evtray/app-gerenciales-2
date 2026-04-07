import { NextRequest, NextResponse } from 'next/server';
import { createSaleOrder, findCustomerByEmail, createCustomer } from '@/lib/odoo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_email, customer_name, customer_phone, customer_address, items } = body;

    if (!customer_email || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find or create customer
    let partner = await findCustomerByEmail(customer_email);
    if (!partner) {
      const partnerId = await createCustomer({
        name: customer_name,
        email: customer_email,
        phone: customer_phone,
        address: customer_address,
      });
      partner = { id: partnerId };
    }

    // Create sale order
    const orderId = await createSaleOrder(partner.id, items);

    return NextResponse.json({ success: true, odoo_order_id: orderId });
  } catch (error) {
    console.error('Odoo sync-order error:', error);
    return NextResponse.json({ error: 'Failed to sync order with Odoo' }, { status: 500 });
  }
}
