#!/usr/bin/env node
/**
 * Importa os produtos de src/data/catalog/*.json para o Supabase (upsert por id).
 * Uso (na pasta do projeto, com as variáveis do .env.local):
 *   node --env-file=.env.local scripts/import-catalog.mjs
 * Requer NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY. As fotos já vão junto no deploy (public/catalog).
 */
import fs from 'node:fs';
import path from 'node:path';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ex.: --env-file=.env.local).');
  process.exit(1);
}

// REST direto: chaves novas (sb_secret_...) vão só no cabeçalho apikey; chaves JWT antigas também em Authorization.
const headers = {
  apikey: key,
  'Content-Type': 'application/json',
  Prefer: 'resolution=merge-duplicates,return=minimal',
  ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}),
};
const endpoint = `${url.replace(/\/$/, '')}/rest/v1/products?on_conflict=id`;
const dir = path.join(process.cwd(), 'src', 'data', 'catalog');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));

for (const file of files) {
  const p = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'));
  const row = {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    category_label: p.categoryLabel,
    price: p.price,
    original_price: p.originalPrice ?? null,
    status: p.status,
    delivery_time: p.deliveryTime,
    images: p.images,
    description: p.description,
    specs: p.specs,
    is_featured: Boolean(p.isFeatured),
    batch_code_info: p.batchCodeInfo ?? null,
    variants: p.variants ?? [],
  };
  const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(row) });
  if (!res.ok) {
    console.error(`✗ ${p.id}: HTTP ${res.status} ${await res.text()}`);
    process.exitCode = 1;
  } else {
    console.log(`✓ ${p.name} (${(p.variants ?? []).length} variações)`);
  }
}
