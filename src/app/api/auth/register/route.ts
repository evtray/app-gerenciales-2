import { NextRequest, NextResponse } from 'next/server';
import { registerPortalUser, loginUser } from '@/lib/odoo';
import { createSession, sessionCookieOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, address, nit } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nombre, correo y contraseña son obligatorios' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    const { partnerId } = await registerPortalUser({ name, email, password, phone, address, nit });

    // Auto-login after registration
    const user = await loginUser(email, password);
    if (!user) {
      return NextResponse.json({ error: 'Cuenta creada pero no se pudo iniciar sesión automáticamente' }, { status: 500 });
    }

    const token = await createSession({
      uid: user.uid,
      partnerId,
      name: user.name,
      email: user.email,
    });

    const res = NextResponse.json({ success: true, user: { name: user.name, email: user.email } });
    res.cookies.set(sessionCookieOptions(token));
    return res;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al registrar usuario';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
