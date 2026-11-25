-- Libera TODAS as categorias do site na tabela de produtos (inclui Farmácia, Perfumaria Árabe e Bebidas).
-- Pode rodar mais de uma vez. Ao criar uma categoria nova em src/config/site.ts, acrescente o id na lista abaixo e rode de novo.
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE public.products
  ADD CONSTRAINT products_category_check
  CHECK (category IN ('farmacia', 'perfumes', 'arabes', 'bebidas', 'beleza', 'eletronicos', 'smartphones', 'acessorios'));
