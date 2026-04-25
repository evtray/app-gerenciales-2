import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/odoo';
import { createSession, sessionCookieOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Correo y contraseña son obligatorios' }, { status: 400 });
    }

    const user = await loginUser(email, password);
    if (!user) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    const token = await createSession({
      uid: user.uid,
      partnerId: user.partnerId,
      name: user.name,
      email: user.email,
    });

    const res = NextResponse.json({ success: true, user: { name: user.name, email: user.email } });
    res.cookies.set(sessionCookieOptions(token));
    return res;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
