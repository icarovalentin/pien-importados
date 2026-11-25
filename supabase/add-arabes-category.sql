-- Libera a categoria 'arabes' (Perfumes Árabes) na tabela de produtos.
-- Rode ANTES de importar os perfumes. Pode rodar mais de uma vez.
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE public.products
  ADD CONSTRAINT products_category_check
  CHECK (category IN ('perfumes', 'arabes', 'beleza', 'eletronicos', 'smartphones', 'acessorios'));
