import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { isAdminAuthenticated, isSameOrigin } from '@/lib/auth';
import { logServerError } from '@/lib/server-error';
import {
  collectProductImageUrls,
  extractManagedStoragePath,
  getSupabaseAdmin,
  isSupabaseConfigured,
  PRODUCT_IMAGES_BUCKET,
} from '@/lib/supabase';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_CONTENT_LENGTH = 6 * 1024 * 1024; // 6 MB
const MAX_PIXELS = 25_000_000;
const MAX_DIMENSION = 1600;
const isProd = process.env.NODE_ENV === 'production';

const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
]);

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 12) return false;

  switch (mimeType) {
    case 'image/jpeg':
    case 'image/jpg':
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case 'image/png':
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
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

function extractLocalUploadName(url: string): string | null {
  const match = url.match(/^\/uploads\/([A-Za-z0-9._-]+)$/);
  if (!match || match[1].includes('..')) return null;
  return match[1];
}

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Origem inválida' }, { status: 403 });
  }
  if (!(await isAdminAuthenticated())) {
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
    if (!ALLOWED_MIMES.has(mimeType)) {
      return NextResponse.json(
        { error: 'Formato não permitido. Envie apenas JPG, PNG, WebP ou AVIF.' },
        { status: 400 }
      );
    }

    const rawBytes = await file.arrayBuffer();
    const rawBuffer = Buffer.from(rawBytes);

    if (!validateMagicBytes(rawBuffer, mimeType)) {
      return NextResponse.json(
        { error: 'Conteúdo do arquivo não corresponde ao formato declarado' },
        { status: 415 }
      );
    }

    // Reprocessa em WebP sem .withMetadata() para eliminar EXIF/GPS e validar integridade real da imagem
    let cleanBuffer: Buffer;
    try {
      cleanBuffer = await sharp(rawBuffer, { limitInputPixels: MAX_PIXELS })
        .rotate()
        .resize({
          width: MAX_DIMENSION,
          height: MAX_DIMENSION,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 88, effort: 4 })
        .toBuffer();
    } catch (err) {
      logServerError('POST /api/upload sharp', err);
      return NextResponse.json(
        { error: 'Imagem corrompida, resolução excessiva ou formato inválido.' },
        { status: 415 }
      );
    }

    const randomId = crypto.randomBytes(8).toString('hex');
    const fileName = `${Date.now()}-${randomId}.webp`;

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const storagePath = `products/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .upload(storagePath, cleanBuffer, {
            contentType: 'image/webp',
            cacheControl: '31536000',
            upsert: false,
          });

        if (uploadError) {
          logServerError('POST /api/upload Supabase', uploadError);
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
      logServerError('POST /api/upload', new Error('Supabase não configurado em produção'));
      return NextResponse.json({ error: 'Armazenamento não configurado' }, { status: 503 });
    }

    const uploadDir = path.resolve(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const destination = path.resolve(uploadDir, fileName);
    if (!destination.startsWith(uploadDir + path.sep)) {
      return NextResponse.json({ error: 'Caminho de arquivo inválido' }, { status: 400 });
    }

    fs.writeFileSync(destination, cleanBuffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${fileName}`,
      fileName,
    });
  } catch (error) {
    logServerError('POST /api/upload', error);
    return NextResponse.json({ error: 'Falha ao processar o upload da imagem' }, { status: 500 });
  }
}

/** Remove uploads descartados pelo painel antes de salvar, desde que não estejam em uso por nenhum produto. */
export async function DELETE(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Origem inválida' }, { status: 403 });
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    const urls: string[] = Array.isArray(body?.urls)
      ? body.urls.filter((u: unknown): u is string => typeof u === 'string').slice(0, 20)
      : [];

    if (urls.length === 0) {
      return NextResponse.json({ success: true, removed: 0 });
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        return NextResponse.json({ error: 'Banco indisponível' }, { status: 503 });
      }

      const candidatePaths = urls
        .map((u) => ({ url: u, storagePath: extractManagedStoragePath(u) }))
        .filter((item): item is { url: string; storagePath: string } => Boolean(item.storagePath));

      if (candidatePaths.length === 0) {
        return NextResponse.json({ success: true, removed: 0 });
      }

      const { data: rows, error: selectError } = await supabase
        .from('products')
        .select('images, variants');
      if (selectError) {
        logServerError('DELETE /api/upload SELECT', selectError);
        return NextResponse.json({ error: 'Falha ao verificar uso das imagens' }, { status: 500 });
      }

      const inUse = new Set<string>();
      for (const row of rows || []) {
        for (const u of collectProductImageUrls(
          row.images as string[] | null,
          row.variants as { images?: string[] | null }[] | null
        )) {
          inUse.add(u);
        }
      }

      const pathsToRemove = Array.from(
        new Set(
          candidatePaths
            .filter((item) => !inUse.has(item.url))
            .map((item) => item.storagePath)
        )
      );

      if (pathsToRemove.length > 0) {
        const { error: removeError } = await supabase.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .remove(pathsToRemove);
        if (removeError) logServerError('DELETE /api/upload Storage', removeError);
      }

      return NextResponse.json({ success: true, removed: pathsToRemove.length });
    }

    if (isProd) {
      return NextResponse.json({ error: 'Armazenamento não configurado' }, { status: 503 });
    }

    let removed = 0;
    const uploadDir = path.resolve(process.cwd(), 'public', 'uploads');
    for (const u of urls) {
      const name = extractLocalUploadName(u);
      if (!name) continue;
      const target = path.resolve(uploadDir, name);
      if (target.startsWith(uploadDir + path.sep) && fs.existsSync(target)) {
        fs.unlinkSync(target);
        removed += 1;
      }
    }

    return NextResponse.json({ success: true, removed });
  } catch (error) {
    logServerError('DELETE /api/upload', error);
    return NextResponse.json({ error: 'Falha ao limpar imagens' }, { status: 500 });
  }
}
