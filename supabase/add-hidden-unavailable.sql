-- Adiciona os controles de visibilidade/disponibilidade do produto. Pode rodar mais de uma vez.
--   is_hidden:      oculta o produto da vitrine do site (continua no painel admin)
--   is_unavailable: mantém o produto no site, mas sem pedido/orçamento
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_unavailable BOOLEAN NOT NULL DEFAULT FALSE;
