import { NextRequest, NextResponse } from 'next/server';
import { findCustomerByEmail, createCustomer } from '@/lib/odoo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, address } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Check if customer already exists
    const existing = await findCustomerByEmail(email);
    if (existing) {
      return NextResponse.json({ success: true, partner_id: existing.id, existing: true });
    }

    // Create new customer
    const partnerId = await createCustomer({ name, email, phone, address });
    return NextResponse.json({ success: true, partner_id: partnerId, existing: false });
  } catch (error) {
    console.error('Odoo sync-customer error:', error);
    return NextResponse.json({ error: 'Failed to sync customer with Odoo' }, { status: 500 });
  }
}
