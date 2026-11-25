-- Libera as categorias 'arabes' (Perfumes Árabes) e 'farmacia' (Farmácia) na tabela de produtos.
-- Rode ANTES de importar os perfumes. Pode rodar mais de uma vez.
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE public.products
  ADD CONSTRAINT products_category_check
  CHECK (category IN ('farmacia', 'perfumes', 'arabes', 'beleza', 'eletronicos', 'smartphones', 'acessorios'));
