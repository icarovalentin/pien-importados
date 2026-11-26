import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Limitador de tentativas e revogação de sessões compartilhado entre instâncias:
 * 1) Upstash Redis (REST), se configurado;
 * 2) Tabela segura no Supabase (via service_role + RPC atômica), se a migração existir;
 * 3) Fallback em memória local (best-effort) enquanto nenhuma tabela/Redis estiver ativa.
 */
const memory = new Map<string, { count: number; resetAt: number }>();
const revokedMemory = new Map<string, number>();
const MAX_MEMORY_KEYS = 5000;
let warnedMissingSupabaseRateTable = false;

function upstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/$/, '');
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  return url && token ? { url, token } : null;
}

export function isSharedRateLimitConfigured(): boolean {
  return upstashConfig() !== null || isSupabaseConfigured();
}

function isMissingRelationOrRpcError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === '42P01' ||
    error.code === '42883' ||
    error.code === 'PGRST205' ||
    error.code === 'PGRST202' ||
    Boolean(error.message?.includes('Could not find'))
  );
}

function warnMissingTableOnce() {
  if (warnedMissingSupabaseRateTable) return;
  warnedMissingSupabaseRateTable = true;
  console.warn(
    '[Security] Execute supabase/security-hardening.sql no Supabase para ativar rate-limit e revogação persistentes.'
  );
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

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('admin_login_attempts')
          .select('attempts, reset_at')
          .eq('key', key)
          .maybeSingle();

        if (!error) {
          if (!data) return 0;
          const resetAtMs = new Date(data.reset_at as string).getTime();
          if (!Number.isFinite(resetAtMs) || resetAtMs <= Date.now()) return 0;
          return Number(data.attempts) || 0;
        }
        if (isMissingRelationOrRpcError(error)) {
          warnMissingTableOnce();
        }
      } catch {
        // Recua para memória
      }
    }
  }

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

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('increment_login_failure', {
          p_key: key,
          p_window_ms: windowMs,
        });
        if (!error && typeof data === 'number') {
          return data;
        }
        if (isMissingRelationOrRpcError(error)) {
          warnMissingTableOnce();
        }
      } catch {
        // Recua para memória
      }
    }
  }

  return memoryCount(key, windowMs, true);
}

export async function resetFailures(key: string): Promise<void> {
  memory.delete(key);
  await upstashPipeline([['DEL', `rl:${key}`]]);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        const { error } = await supabase.from('admin_login_attempts').delete().eq('key', key);
        if (isMissingRelationOrRpcError(error)) {
          warnMissingTableOnce();
        }
      } catch {
        // Ignora erro de rede no reset
      }
    }
  }
}

/** Revoga um ID de sessão (jti) no logout até sua expiração natural. */
export async function revokeSessionJti(jti: string, ttlSeconds: number): Promise<void> {
  if (!jti || ttlSeconds <= 0) return;

  const expiresAtMs = Date.now() + ttlSeconds * 1000;
  if (revokedMemory.size >= MAX_MEMORY_KEYS) {
    const now = Date.now();
    revokedMemory.forEach((exp, k) => {
      if (exp <= now) revokedMemory.delete(k);
    });
  }
  revokedMemory.set(jti, expiresAtMs);

  await upstashPipeline([['SET', `revoked:${jti}`, '1', 'EX', Math.ceil(ttlSeconds)]]);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        const nowIso = new Date().toISOString();
        await supabase.from('admin_revoked_sessions').delete().lt('expires_at', nowIso);
        const { error } = await supabase.from('admin_revoked_sessions').upsert({
          jti,
          expires_at: new Date(expiresAtMs).toISOString(),
        });
        if (isMissingRelationOrRpcError(error)) {
          warnMissingTableOnce();
        }
      } catch {
        // Já protegido em memória local / cookie removido
      }
    }
  }
}

/** Verifica se um token de sessão (jti) foi encerrado antes do vencimento. */
export async function isSessionJtiRevoked(jti: string | undefined): Promise<boolean> {
  if (!jti) return false;

  const memExp = revokedMemory.get(jti);
  if (memExp !== undefined) {
    if (memExp > Date.now()) return true;
    revokedMemory.delete(jti);
  }

  const out = await upstashPipeline([['GET', `revoked:${jti}`]]);
  if (out && out[0] === '1') return true;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('admin_revoked_sessions')
          .select('expires_at')
          .eq('jti', jti)
          .maybeSingle();

        if (!error && data) {
          const expMs = new Date(data.expires_at as string).getTime();
          if (Number.isFinite(expMs) && expMs > Date.now()) {
            revokedMemory.set(jti, expMs);
            return true;
          }
        }
      } catch {
        // Ignora falha transitória de rede para não derrubar sessão válida
      }
    }
  }

  return false;
}
