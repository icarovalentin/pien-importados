import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { isAdminAuthenticated, isSameOrigin } from '@/lib/auth';
import {
  getSupabaseAdmin,
  isSupabaseConfigured,
  PRODUCT_IMAGES_BUCKET,
} from '@/lib/supabase';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
};

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Origem inválida' }, { status: 403 });
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'A imagem deve ter no máximo 5 MB.' },
        { status: 400 }
      );
    }

    const mimeType = file.type.toLowerCase();
    const ext = ALLOWED_MIME_TO_EXT[mimeType];
    if (!ext) {
      return NextResponse.json(
        { error: 'Formato não permitido. Envie apenas JPG, PNG, WebP ou AVIF.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const randomId = crypto.randomBytes(8).toString('hex');
    const fileName = `${Date.now()}-${randomId}${ext}`;

    // Envia para o Supabase Storage quando configurado
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const storagePath = `products/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .upload(storagePath, buffer, {
            contentType: mimeType,
            cacheControl: '31536000',
            upsert: false,
          });

        if (uploadError) {
          console.error('Erro no upload Supabase Storage:', uploadError);
          return NextResponse.json(
            { error: 'Falha ao enviar imagem para o armazenamento.' },
            { status: 500 }
          );
        }

        const { data: publicUrlData } = supabase.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .getPublicUrl(storagePath);

        return NextResponse.json({
          success: true,
          url: publicUrlData.publicUrl,
          fileName,
        });
      }
    }

    // Fallback local (ambiente de desenvolvimento sem Supabase)
    const uploadDir = path.resolve(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const destination = path.resolve(uploadDir, fileName);
    if (!destination.startsWith(uploadDir + path.sep)) {
      return NextResponse.json({ error: 'Caminho de arquivo inválido' }, { status: 400 });
    }

    fs.writeFileSync(destination, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${fileName}`,
      fileName,
    });
  } catch (error) {
    console.error('Erro no upload de imagem:', error);
    return NextResponse.json({ error: 'Falha ao processar o upload da imagem' }, { status: 500 });
  }
}
