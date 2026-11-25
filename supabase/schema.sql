-- ============================================================================
-- Pien Importados — Schema inicial (Tabela de Produtos + Storage de Imagens)
-- Execute este script no SQL Editor do seu projeto Supabase.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT 'Importado',
  category TEXT NOT NULL CHECK (category IN ('farmacia', 'perfumes', 'arabes', 'beleza', 'eletronicos', 'smartphones', 'acessorios')),
  category_label TEXT NOT NULL DEFAULT 'Diversos',
  price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
  original_price NUMERIC(12, 2) CHECK (original_price IS NULL OR original_price > 0),
  status TEXT NOT NULL DEFAULT 'pronta_entrega' CHECK (status IN ('pronta_entrega', 'encomenda')),
  delivery_time TEXT NOT NULL DEFAULT 'Envio Imediato (em até 24h)',
  images TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL DEFAULT '',
  specs TEXT[] NOT NULL DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  batch_code_info TEXT,
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para filtragem e ordenação da vitrine
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products (status);
CREATE INDEX IF NOT EXISTS idx_products_featured_created ON public.products (is_featured DESC, created_at DESC);

-- Segurança RLS: leitura pública do catálogo; escrita apenas pelo backend (service_role)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public catalog read" ON public.products;
CREATE POLICY "Public catalog read"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Bucket público para fotos dos produtos enviadas pelo Painel Admin
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

-- Carga inicial de produtos (não sobrescreve caso já existam)
INSERT INTO public.products (
  id, name, brand, category, category_label, price, original_price,
  status, delivery_time, images, description, specs, is_featured, batch_code_info
) VALUES
(
  'perf-01',
  'Dior Sauvage Eau de Parfum 100ml',
  'Dior',
  'perfumes',
  'Perfumaria Masculina',
  689.90,
  820.00,
  'pronta_entrega',
  'Envio Imediato (em até 24h)',
  ARRAY[
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80'
  ],
  'Um clássico absoluto da perfumaria mundial. Fragrância amadeirada e aromática com notas de bergamota da Calábria, pimenta de Sichuan e âmbar cinza.',
  ARRAY['Concentração: Eau de Parfum (EDP)', 'Volumetria: 100ml', 'Origem: Importado da França', 'Fragrância: Cítrico e Amadeirado Intenso'],
  true,
  'Lote gravado no frasco e caixa com selo de autenticidade.'
),
(
  'perf-02',
  'Carolina Herrera Good Girl Eau de Parfum 80ml',
  'Carolina Herrera',
  'perfumes',
  'Perfumaria Feminina',
  649.90,
  770.00,
  'pronta_entrega',
  'Envio Imediato (em até 24h)',
  ARRAY['https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80'],
  'O icônico perfume do salto agulha. Uma fragrância sensual, ousada e sofisticada que combina tuberosa, jasmim sambac e cacau torrado.',
  ARRAY['Concentração: Eau de Parfum (EDP)', 'Volumetria: 80ml', 'Origem: Importado da Espanha', 'Família Olfativa: Floral Oriental'],
  true,
  'Frasco original com código de lote conferível nos sites de batch check.'
),
(
  'perf-03',
  '212 VIP Black Eau de Parfum 100ml',
  'Carolina Herrera',
  'perfumes',
  'Perfumaria Masculina',
  599.90,
  710.00,
  'encomenda',
  'Sob Encomenda (7 a 12 dias úteis)',
  ARRAY['https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80'],
  'Criado para o homem noturno, sedutor e magnético. Notas contrastantes de absinto, lavanda aromática e almíscar negro.',
  ARRAY['Concentração: Eau de Parfum (EDP)', 'Volumetria: 100ml', 'Origem: Importado dos EUA', 'Família Olfativa: Fougère Aromático'],
  false,
  'Produto 100% lacrado em celofane de fábrica com batch code.'
),
(
  'perf-04',
  'Bleu de Chanel Eau de Parfum 100ml',
  'Chanel',
  'perfumes',
  'Perfumaria Masculina',
  899.90,
  1050.00,
  'encomenda',
  'Sob Encomenda (10 a 15 dias úteis)',
  ARRAY['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80'],
  'A essência da liberdade e elegância atemporal masculina. Uma fragrância aromático-amadeirada com rastro cativante.',
  ARRAY['Concentração: Eau de Parfum (EDP)', 'Volumetria: 100ml', 'Origem: Importado da França', 'Família Olfativa: Aromático Amadeirado'],
  true,
  'Importação direta exclusiva, sob encomenda.'
),
(
  'bel-01',
  'Hidratante Corporal Victoria''s Secret Bare Vanilla 236ml',
  'Victoria''s Secret',
  'beleza',
  'Cuidados & Fragrância',
  139.90,
  179.90,
  'pronta_entrega',
  'Envio Imediato (em até 24h)',
  ARRAY['https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'],
  'A fragrância mais desejada da Victoria''s Secret. Uma mistura aconchegante de baunilha batida e flor de maçã suave. Hidratação profunda 24h com absorção rápida.',
  ARRAY['Volume: 236ml / 8.4 fl oz', 'Notas: Baunilha Aveludada e Maçã Doce', 'Fórmula nutritiva com aloe vera e vitamina E', 'Importado direto da loja oficial nos EUA'],
  true,
  'Lacre original dos EUA e selo de procedência.'
),
(
  'bel-02',
  'Body Splash Victoria''s Secret Pure Seduction 250ml',
  'Victoria''s Secret',
  'beleza',
  'Body Splash & Perfumaria',
  139.90,
  179.90,
  'pronta_entrega',
  'Envio Imediato (em até 24h)',
  ARRAY['https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80'],
  'Fragrância frutada e floral apaixonante. Combinação irresistível de ameixa vermelha suculenta e frésia doce.',
  ARRAY['Volume: 250ml / 8.4 fl oz', 'Tipo: Fragrance Mist (Body Splash)', 'Fixação duradoura e frescor imediato', 'Produto 100% original americano'],
  false,
  'Importado diretamente dos Estados Unidos.'
),
(
  'bel-03',
  'Kit Velvet Petals: Loção Hidratante + Body Splash',
  'Victoria''s Secret',
  'beleza',
  'Kits & Presentes',
  259.90,
  320.00,
  'pronta_entrega',
  'Envio Imediato (em até 24h)',
  ARRAY['https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80'],
  'O combo perfeito para hidratação e perfumação prolongada. Notas florais exuberantes com pralinê de amêndoas.',
  ARRAY['Contém: 1 Loção 236ml + 1 Body Splash 250ml', 'Fragrância: Velvet Petals', 'Excelente opção para presente', 'Originalidade e procedência garantida'],
  false,
  'Ambos com batch code conferível.'
),
(
  'bel-04',
  'Kit The Ordinary: Niacinamide 10% + Hyaluronic Acid 2%',
  'The Ordinary',
  'beleza',
  'Skincare Importado',
  189.90,
  240.00,
  'encomenda',
  'Sob Encomenda (8 a 12 dias úteis)',
  ARRAY['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'],
  'A dupla mais famosa do skincare mundial para controle de oleosidade, uniformização de textura e hidratação profunda.',
  ARRAY['Contém: 2 frascos de 30ml cada', 'Fórmula pura canadense', 'Vegano e Cruelty-free'],
  false,
  'Caixas com código de rastreabilidade Deciem.'
),
(
  'elet-01',
  'Caixa de Som Bluetooth JBL Flip 6 (Edição Original)',
  'JBL',
  'eletronicos',
  'Áudio & Caixas Bluetooth',
  549.90,
  699.00,
  'pronta_entrega',
  'Envio Imediato (em até 24h)',
  ARRAY['https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'],
  'Som mais potente, nítido e graves mais profundos com o sistema de alto-falantes de 2 vias. À prova d''água e poeira com certificação IP67.',
  ARRAY['Potência: 30W RMS', 'Bateria: Até 12 horas de reprodução contínua', 'Resistência: IP67 à prova d''água e poeira', 'Conexão: Bluetooth 5.1 e PartyBoost', 'Garantia: 100% Original JBL com número de série'],
  true,
  'Número de série gravado no conector e conferível no app JBL Portable.'
),
(
  'elet-02',
  'Caixa de Som JBL Boombox 3 Bluetooth Portátil',
  'JBL',
  'eletronicos',
  'Áudio Profissional & Potente',
  2499.90,
  2999.00,
  'encomenda',
  'Sob Encomenda (8 a 14 dias úteis)',
  ARRAY['https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80'],
  'A caixa mais potente da categoria portátil. Graves monstruosos, design icônico com alça de metal resistente e bateria impressionante para durar o dia todo.',
  ARRAY['Potência: Até 180W RMS (na tomada) / 136W (na bateria)', 'Bateria: Até 24 horas de duração contínua', 'Powerbank integrado: Carrega seu smartphone via USB', 'Resistência: IP67 à prova de água e poeira', 'Conecta com o app oficial JBL'],
  false,
  'Importado direto, lacrado com garantia de originalidade.'
),
(
  'elet-03',
  'Apple AirPods Pro (2ª Geração) com Estojo USB-C',
  'Apple',
  'eletronicos',
  'Fones de Ouvido Premium',
  1699.90,
  2199.00,
  'pronta_entrega',
  'Envio Imediato (em até 24h)',
  ARRAY['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80'],
  'Cancelamento Ativo de Ruído até 2x mais potente, Áudio Espacial Personalizado e o novo chip H2. Estojo MagSafe agora com USB-C e alto-falante integrado.',
  ARRAY['Chip: Apple H2 com cancelamento adaptativo', 'Conector: USB-C mais recente', 'Bateria: Até 6 horas (30h com estojo)', 'Garantia mundial Apple de 1 ano ativada no primeiro uso'],
  true,
  'Serial number original validável no site oficial checkcoverage.apple.com.'
),
(
  'acess-01',
  'Carregador Rápido Anker Nano Pro 20W USB-C',
  'Anker',
  'acessorios',
  'Carregadores & Cabos',
  119.90,
  159.00,
  'pronta_entrega',
  'Envio Imediato (em até 24h)',
  ARRAY['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'],
  'O menor e mais seguro carregador rápido do mundo para iPhone e Android. Tecnologia de proteção térmica ActiveShield.',
  ARRAY['Potência: 20W Power Delivery 3.0', 'Tamanho ultracompacto (50% menor que o padrão)', 'Compatível com iPhone 11 ao 16 Pro Max e Samsung Galaxy', 'Certificação Anker de segurança contra picos'],
  false,
  'Produto original lacrado Anker com código QR de verificação.'
)
ON CONFLICT (id) DO NOTHING;
