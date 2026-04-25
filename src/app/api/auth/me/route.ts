import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPartnerInfo } from '@/lib/odoo';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const partner = await getPartnerInfo(session.partnerId);
    return NextResponse.json({
      user: {
        uid: session.uid,
        partnerId: session.partnerId,
        name: session.name,
        email: session.email,
        phone: partner?.phone || '',
        address: partner?.address || '',
        nit: partner?.nit || 'CF',
      },
    });
  } catch {
    return NextResponse.json({
      user: {
        uid: session.uid,
        partnerId: session.partnerId,
        name: session.name,
        email: session.email,
      },
    });
  }
}
