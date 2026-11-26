-- ============================================================================
-- Pien Importados — Endurecimento de Segurança (Rate Limit + Revogação de Sessão)
-- Script idempotente: pode ser executado mais de uma vez no SQL Editor do Supabase.
-- ============================================================================

-- Tabela de controle de tentativas de login (acesso exclusivo via service_role)
CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
  key TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 1,
  reset_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_reset_at
  ON public.admin_login_attempts (reset_at);

ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.admin_login_attempts FROM PUBLIC, anon, authenticated;

-- Tabela de sessões encerradas antecipadamente (logout real)
CREATE TABLE IF NOT EXISTS public.admin_revoked_sessions (
  jti TEXT PRIMARY KEY,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_revoked_sessions_expires_at
  ON public.admin_revoked_sessions (expires_at);

ALTER TABLE public.admin_revoked_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.admin_revoked_sessions FROM PUBLIC, anon, authenticated;

-- Incremento atômico da janela de falhas de login (SECURITY INVOKER, search_path vazio)
CREATE OR REPLACE FUNCTION public.increment_login_failure(p_key TEXT, p_window_ms INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_attempts INTEGER;
  v_window INTERVAL := GREATEST(1, p_window_ms) * interval '1 millisecond';
BEGIN
  DELETE FROM public.admin_login_attempts
   WHERE reset_at < now() - interval '1 day';

  INSERT INTO public.admin_login_attempts (key, attempts, reset_at)
  VALUES (p_key, 1, now() + v_window)
  ON CONFLICT (key) DO UPDATE
    SET attempts = CASE
          WHEN public.admin_login_attempts.reset_at <= now() THEN 1
          ELSE public.admin_login_attempts.attempts + 1
        END,
        reset_at = CASE
          WHEN public.admin_login_attempts.reset_at <= now() THEN now() + v_window
          ELSE public.admin_login_attempts.reset_at
        END
  RETURNING attempts INTO v_attempts;

  RETURN v_attempts;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_login_failure(TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_login_failure(TEXT, INTEGER) TO service_role;
