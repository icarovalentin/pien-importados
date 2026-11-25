-- Produto da Farmácia: Tirzec 15 (venda exclusiva no Paraguai, sob prescrição médica).
-- Preço: R$ 900,00.
-- A primeira instrução libera a categoria 'farmacia' no banco (pode rodar mais de uma vez).
-- Cole no SQL Editor do Supabase e clique em Run.

-- Libera a categoria 'farmacia' (Farmácia) na tabela de produtos. Pode rodar mais de uma vez.
-- (Já inclui 'arabes'; não importa a ordem em relação ao add-arabes-category.sql.)
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE public.products
  ADD CONSTRAINT products_category_check
  CHECK (category IN ('farmacia', 'perfumes', 'arabes', 'bebidas', 'beleza', 'eletronicos', 'smartphones', 'acessorios'));

INSERT INTO public.products
  (id, name, brand, category, category_label, price, original_price, status, delivery_time, images, description, specs, is_featured, batch_code_info, variants)
VALUES (
  $j$fm-tirzec-15$j$, $j$Tirzec 15 (Tirzepatida 15 mg/0,5 mL)$j$, $j$Tirzec$j$, $j$farmacia$j$, $j$Farmácia$j$, 900.0, NULL,
  $j$encomenda$j$, $j$Venda exclusiva no Paraguai$j$, ARRAY[$j$/catalog/farmacia/tirzec-15.webp$j$]::text[], $j$Tirzec 15, tirzepatida 15 mg/0,5 mL, solução injetável. Caixa com 4 frascos-ampola de 0,5 mL.

VENDA NO PARAGUAI: este produto é divulgado para venda no Paraguai, e a compra e a retirada são feitas apenas lá.

Medicamento de venda sob prescrição médica. Use somente com orientação de um profissional de saúde.

Atenção, clientes do Brasil: este produto não tem registro na Anvisa, e a importação, a comercialização e o uso no Brasil são proibidos pela Anvisa. Não leve este produto para o Brasil.$j$, ARRAY[$j$Princípio ativo: tirzepatida$j$,$j$Concentração: 15 mg/0,5 mL$j$,$j$Apresentação: 4 frascos-ampola de 0,5 mL (solução injetável)$j$,$j$Venda: exclusiva no Paraguai$j$,$j$Tipo: medicamento de venda sob prescrição médica$j$,$j$Registro na Anvisa: não possui (importação e uso no Brasil proibidos)$j$]::text[], false, NULL, '[]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, brand=EXCLUDED.brand, category=EXCLUDED.category, category_label=EXCLUDED.category_label,
  price=EXCLUDED.price, status=EXCLUDED.status, delivery_time=EXCLUDED.delivery_time, images=EXCLUDED.images,
  description=EXCLUDED.description, specs=EXCLUDED.specs, batch_code_info=EXCLUDED.batch_code_info, variants=EXCLUDED.variants;
