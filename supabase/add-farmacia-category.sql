-- Libera a categoria 'farmacia' (Farmácia) na tabela de produtos. Pode rodar mais de uma vez.
-- (Já inclui 'arabes'; não importa a ordem em relação ao add-arabes-category.sql.)
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE public.products
  ADD CONSTRAINT products_category_check
  CHECK (category IN ('farmacia', 'perfumes', 'arabes', 'beleza', 'eletronicos', 'smartphones', 'acessorios'));
