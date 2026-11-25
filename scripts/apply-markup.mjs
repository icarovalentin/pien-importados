// Aplica o acréscimo de preço (padrão +50%) nos arquivos de src/data/catalog/*.json.
// Segura contra repetição: cada arquivo recebe "markup": 1.5 e nunca é reprocessado.
// Preços terminam em ,90 (mesmo padrão dos scripts de importação). Itens fm-* (preço final definido pelo dono) são ignorados.
// Uso: node scripts/apply-markup.mjs [fator]
import fs from 'node:fs';
import path from 'node:path';

const FACTOR = Number(process.argv[2] || 1.5);
const dir = path.join(process.cwd(), 'src/data/catalog');
const up = (v) => {
  const x = v * FACTOR, f = Math.floor(x);
  return Math.round((x - f <= 0.9 ? f + 0.9 : f + 1.9) * 100) / 100;
};
let n = 0, skipped = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
  if (f.startsWith('fm-')) continue;
  const p = path.join(dir, f);
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (d.markup) { skipped++; continue; }
  if (typeof d.price === 'number') d.price = up(d.price);
  if (typeof d.originalPrice === 'number') d.originalPrice = up(d.originalPrice);
  for (const v of d.variants || []) if (typeof v.price === 'number') v.price = up(v.price);
  d.markup = FACTOR;
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
  n++;
}
console.log(`atualizados: ${n} · já aplicado: ${skipped}`);
