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
const MAX_CONTENT_LENGTH = 6 * 1024 * 1024; // 6 MB
const isProd = process.env.NODE_ENV === 'production';
const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
};

function logError(context: string, error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : error && typeof error === 'object' && typeof (error as { message?: unknown }).message === 'string'
        ? (error as { message: string }).message
        : String(error);
  const code =
    error && typeof error === 'object' && 'code' in error
      ? (error as { code?: unknown }).code
      : undefined;
  console.error(`[${context}] ${message}${code !== undefined ? ` (code: ${String(code)})` : ''}`);
}

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 12) return false;

  switch (mimeType) {
    case 'image/jpeg':
    case 'image/jpg':
      return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    case 'image/png':
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4E &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0D &&
        buffer[5] === 0x0A &&
        buffer[6] === 0x1A &&
        buffer[7] === 0x0A
      );
    case 'image/webp':
      return (
        buffer[0] === 0x52 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x46 &&
        buffer[8] === 0x57 &&
        buffer[9] === 0x45 &&
        buffer[10] === 0x42 &&
        buffer[11] === 0x50
      );
    case 'image/avif': {
      if (buffer[4] !== 0x66 || buffer[5] !== 0x74 || buffer[6] !== 0x79 || buffer[7] !== 0x70) {
        return false;
      }
      const brand = buffer.subarray(8, 12).toString('ascii');
      return brand === 'avif' || brand === 'avis';
    }
    default:
      return false;
  }
}

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Origem inválida' }, { status: 403 });
  }

  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const contentLengthHeader = req.headers.get('content-length');
  if (contentLengthHeader !== null) {
    const contentLength = Number(contentLengthHeader);
    if (!Number.isFinite(contentLength) || contentLength < 0) {
      return NextResponse.json({ error: 'Content-Length inválido' }, { status: 400 });
    }
    if (contentLength > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: 'Corpo da requisição muito grande (máx. 6 MB)' },
        { status: 413 }
      );
    }
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

    if (!validateMagicBytes(buffer, mimeType)) {
      return NextResponse.json(
        { error: 'Conteúdo do arquivo não corresponde ao formato declarado' },
        { status: 415 }
      );
    }

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
          logError('POST /api/upload Supabase', uploadError);
          return NextResponse.json(
            { error: 'Falha ao enviar imagem para o armazenamento.' },
            { status: isProd ? 503 : 500 }
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

    if (isProd) {
      logError('POST /api/upload', new Error('Supabase não configurado em produção'));
      return NextResponse.json({ error: 'Armazenamento não configurado' }, { status: 503 });
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
    logError('POST /api/upload', error);
    return NextResponse.json({ error: 'Falha ao processar o upload da imagem' }, { status: 500 });
  }
}
