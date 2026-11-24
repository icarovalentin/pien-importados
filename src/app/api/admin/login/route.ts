import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    // A senha é lida exclusivamente no servidor a partir da variável secreta de ambiente
    const serverPassword = process.env.ADMIN_PASSWORD || 'pien123';

    if (password && password.trim() === serverPassword.trim()) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Senha incorreta' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return NextResponse.json(
      { success: false, error: 'Erro no servidor' },
      { status: 500 }
    );
  }
}
