/**
 * Limitador de tentativas compartilhado entre instâncias via Upstash Redis (REST),
 * sem dependências extras. Sem as variáveis UPSTASH_*, usa memória local (best-effort).
 */
const memory = new Map<string, { count: number; resetAt: number }>();
const MAX_MEMORY_KEYS = 5000;

function upstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/$/, '');
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  return url && token ? { url, token } : null;
}

export function isSharedRateLimitConfigured(): boolean {
  return upstashConfig() !== null;
}

async function upstashPipeline(commands: (string | number)[][]): Promise<unknown[] | null> {
  const cfg = upstashConfig();
  if (!cfg) return null;
  try {
    const res = await fetch(`${cfg.url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(commands),
      cache: 'no-store',
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: unknown; error?: string }[];
    if (!Array.isArray(data) || data.some((d) => d.error)) return null;
    return data.map((d) => d.result);
  } catch {
    return null;
  }
}

function memoryCount(key: string, windowMs: number, increment: boolean): number {
  const now = Date.now();
  if (memory.size >= MAX_MEMORY_KEYS) {
    memory.forEach((v, k) => {
      if (v.resetAt <= now) memory.delete(k);
    });
    if (memory.size >= MAX_MEMORY_KEYS) memory.clear();
  }
  let rec = memory.get(key);
  if (!rec || rec.resetAt <= now) {
    rec = { count: 0, resetAt: now + windowMs };
    memory.set(key, rec);
  }
  if (increment) rec.count += 1;
  return rec.count;
}

/** Quantas falhas já foram registradas para a chave na janela atual. */
export async function getFailureCount(key: string, windowMs: number): Promise<number> {
  const out = await upstashPipeline([['GET', `rl:${key}`]]);
  if (out) return Number(out[0] ?? 0) || 0;
  return memoryCount(key, windowMs, false);
}

/** Registra uma falha e devolve o total na janela. */
export async function addFailure(key: string, windowMs: number): Promise<number> {
  const seconds = Math.ceil(windowMs / 1000);
  const out = await upstashPipeline([
    ['INCR', `rl:${key}`],
    ['EXPIRE', `rl:${key}`, seconds, 'NX'],
  ]);
  if (out) return Number(out[0]) || 0;
  return memoryCount(key, windowMs, true);
}

export async function resetFailures(key: string): Promise<void> {
  memory.delete(key);
  await upstashPipeline([['DEL', `rl:${key}`]]);
}
