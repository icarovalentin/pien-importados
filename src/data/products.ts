import { Product } from '@/types/product';

export const STORE_PHONE_NUMBER = '5511999999999'; // Número do WhatsApp (configurável)

export const PRODUCTS: Product[] = [
  // --- PERFUMES ---
  {
    id: 'perf-01',
    name: 'Dior Sauvage Eau de Parfum 100ml',
    brand: 'Dior',
    category: 'perfumes',
    categoryLabel: 'Perfumaria Masculina',
    price: 689.90,
    originalPrice: 820.00,
    status: 'pronta_entrega',
    deliveryTime: 'Envio Imediato (em até 24h)',
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Um clássico absoluto da perfumaria mundial. Fragrância amadeirada e aromática com notas de bergamota da Calábria, pimenta de Sichuan e âmbar cinza.',
    specs: [
      'Concentração: Eau de Parfum (EDP)',
      'Volumetria: 100ml',
      'Origem: Importado da França',
      'Fragrância: Cítrico e Amadeirado Intenso'
    ],
    isFeatured: true,
    batchCodeInfo: 'Lote gravado no frasco e caixa com selo de autenticidade.'
  },
  {
    id: 'perf-02',
    name: 'Carolina Herrera Good Girl Eau de Parfum 80ml',
    brand: 'Carolina Herrera',
    category: 'perfumes',
    categoryLabel: 'Perfumaria Feminina',
    price: 649.90,
    originalPrice: 770.00,
    status: 'pronta_entrega',
    deliveryTime: 'Envio Imediato (em até 24h)',
    images: [
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'O icônico perfume do salto agulha. Uma fragrância sensual, ousada e sofisticada que combina tuberosa, jasmim sambac e cacau torrado.',
    specs: [
      'Concentração: Eau de Parfum (EDP)',
      'Volumetria: 80ml',
      'Origem: Importado da Espanha',
      'Família Olfativa: Floral Oriental'
    ],
    isFeatured: true,
    batchCodeInfo: 'Frasco original com código de lote conferível nos sites de batch check.'
  },
  {
    id: 'perf-03',
    name: '212 VIP Black Eau de Parfum 100ml',
    brand: 'Carolina Herrera',
    category: 'perfumes',
    categoryLabel: 'Perfumaria Masculina',
    price: 599.90,
    originalPrice: 710.00,
    status: 'encomenda',
    deliveryTime: 'Sob Encomenda (7 a 12 dias úteis)',
    images: [
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Criado para o homem noturno, sedutor e magnético. Notas contrastantes de absinto, lavanda aromática e almíscar negro.',
    specs: [
      'Concentração: Eau de Parfum (EDP)',
      'Volumetria: 100ml',
      'Origem: Importado dos EUA',
      'Família Olfativa: Fougère Aromático'
    ],
    isFeatured: false,
    batchCodeInfo: 'Produto 100% lacrado em celofane de fábrica com batch code.'
  },
  {
    id: 'perf-04',
    name: 'Bleu de Chanel Eau de Parfum 100ml',
    brand: 'Chanel',
    category: 'perfumes',
    categoryLabel: 'Perfumaria Masculina',
    price: 899.90,
    originalPrice: 1050.00,
    status: 'encomenda',
    deliveryTime: 'Sob Encomenda (10 a 15 dias úteis)',
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'A essência da liberdade e elegância atemporal masculina. Uma fragrância aromático-amadeirada com rastro cativante.',
    specs: [
      'Concentração: Eau de Parfum (EDP)',
      'Volumetria: 100ml',
      'Origem: Importado da França',
      'Família Olfativa: Aromático Amadeirado'
    ],
    isFeatured: true,
    batchCodeInfo: 'Importação direta exclusiva, sob encomenda.'
  },

  // --- BELEZA & CUIDADOS (VICTORIA'S SECRET & SKINCARE) ---
  {
    id: 'bel-01',
    name: 'Hidratante Corporal Victoria\'s Secret Bare Vanilla 236ml',
    brand: 'Victoria\'s Secret',
    category: 'beleza',
    categoryLabel: 'Cuidados & Fragrância',
    price: 139.90,
    originalPrice: 179.90,
    status: 'pronta_entrega',
    deliveryTime: 'Envio Imediato (em até 24h)',
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'A fragrância mais desejada da Victoria\'s Secret. Uma mistura aconchegante de baunilha batida e flor de maçã suave. Hidratação profunda 24h com absorção rápida.',
    specs: [
      'Volume: 236ml / 8.4 fl oz',
      'Notas: Baunilha Aveludada e Maçã Doce',
      'Fórmula nutritiva com aloe vera e vitamina E',
      'Importado direto da loja oficial nos EUA'
    ],
    isFeatured: true,
    batchCodeInfo: 'Lacre original dos EUA e selo de procedência.'
  },
  {
    id: 'bel-02',
    name: 'Body Splash Victoria\'s Secret Pure Seduction 250ml',
    brand: 'Victoria\'s Secret',
    category: 'beleza',
    categoryLabel: 'Body Splash & Perfumaria',
    price: 139.90,
    originalPrice: 179.90,
    status: 'pronta_entrega',
    deliveryTime: 'Envio Imediato (em até 24h)',
    images: [
      'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Fragrância frutada e floral apaixonante. Combinação irresistível de ameixa vermelha suculenta e frésia doce.',
    specs: [
      'Volume: 250ml / 8.4 fl oz',
      'Tipo: Fragrance Mist (Body Splash)',
      'Fixação duradoura e frescor imediato',
      'Produto 100% original americano'
    ],
    isFeatured: true,
    batchCodeInfo: 'Importado diretamente dos Estados Unidos.'
  },
  {
    id: 'bel-03',
    name: 'Kit Velvet Petals: Loção Hidratante + Body Splash',
    brand: 'Victoria\'s Secret',
    category: 'beleza',
    categoryLabel: 'Kits & Presentes',
    price: 259.90,
    originalPrice: 320.00,
    status: 'pronta_entrega',
    deliveryTime: 'Envio Imediato (em até 24h)',
    images: [
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'O combo perfeito para hidratação e perfumação prolongada. Notas florais exuberantes com pralinê de amêndoas.',
    specs: [
      'Contém: 1 Loção 236ml + 1 Body Splash 250ml',
      'Fragrância: Velvet Petals',
      'Excelente opção para presente',
      'Originalidade e procedência garantida'
    ],
    isFeatured: false,
    batchCodeInfo: 'Ambos com batch code conferível.'
  },
  {
    id: 'bel-04',
    name: 'Kit The Ordinary: Niacinamide 10% + Hyaluronic Acid 2%',
    brand: 'The Ordinary',
    category: 'beleza',
    categoryLabel: 'Skincare Importado',
    price: 189.90,
    originalPrice: 240.00,
    status: 'encomenda',
    deliveryTime: 'Sob Encomenda (8 a 12 dias úteis)',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'A dupla mais famosa do skincare mundial para controle de oleosidade, uniformização de textura e hidratação profunda.',
    specs: [
      'Contém: 2 frascos de 30ml cada',
      'Fórmula pura canadense',
      'Vegano e Cruelty-free'
    ],
    isFeatured: false,
    batchCodeInfo: 'Caixas com código de rastreabilidade Deciem.'
  },

  // --- ELETRÔNICOS & SOM (JBL & APPLE) ---
  {
    id: 'elet-01',
    name: 'Caixa de Som Bluetooth JBL Flip 6 (Edição Original)',
    brand: 'JBL',
    category: 'eletronicos',
    categoryLabel: 'Áudio & Caixas Bluetooth',
    price: 549.90,
    originalPrice: 699.00,
    status: 'pronta_entrega',
    deliveryTime: 'Envio Imediato (em até 24h)',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Som mais potente, nítido e graves mais profundos com o sistema de alto-falantes de 2 vias. À prova d\'água e poeira com certificação IP67.',
    specs: [
      'Potência: 30W RMS',
      'Bateria: Até 12 horas de reprodução contínua',
      'Resistência: IP67 à prova d\'água e poeira',
      'Conexão: Bluetooth 5.1 e PartyBoost',
      'Garantia: 100% Original JBL com número de série'
    ],
    isFeatured: true,
    batchCodeInfo: 'Número de série gravado no conector e conferível no app JBL Portable.'
  },
  {
    id: 'elet-02',
    name: 'Caixa de Som JBL Boombox 3 Bluetooth Portátil',
    brand: 'JBL',
    category: 'eletronicos',
    categoryLabel: 'Áudio Profissional & Potente',
    price: 2499.90,
    originalPrice: 2999.00,
    status: 'encomenda',
    deliveryTime: 'Sob Encomenda (8 a 14 dias úteis)',
    images: [
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'A caixa mais potente da categoria portátil. Graves monstruosos, design icônico com alça de metal resistente e bateria impressionante para durar o dia todo.',
    specs: [
      'Potência: Até 180W RMS (na tomada) / 136W (na bateria)',
      'Bateria: Até 24 horas de duração contínua',
      'Powerbank integrado: Carrega seu smartphone via USB',
      'Resistência: IP67 à prova de água e poeira',
      'Conecta com o app oficial JBL'
    ],
    isFeatured: true,
    batchCodeInfo: 'Importado direto, lacrado com garantia de originalidade.'
  },
  {
    id: 'elet-03',
    name: 'Apple AirPods Pro (2ª Geração) com Estojo USB-C',
    brand: 'Apple',
    category: 'eletronicos',
    categoryLabel: 'Fones de Ouvido Premium',
    price: 1699.90,
    originalPrice: 2199.00,
    status: 'pronta_entrega',
    deliveryTime: 'Envio Imediato (em até 24h)',
    images: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Cancelamento Ativo de Ruído até 2x mais potente, Áudio Espacial Personalizado e o novo chip H2. Estojo MagSafe agora com USB-C e alto-falante integrado.',
    specs: [
      'Chip: Apple H2 com cancelamento adaptativo',
      'Conector: USB-C mais recente',
      'Bateria: Até 6 horas (30h com estojo)',
      'Garantia mundial Apple de 1 ano ativada no primeiro uso'
    ],
    isFeatured: true,
    batchCodeInfo: 'Serial number original validável no site oficial checkcoverage.apple.com.'
  },

  // --- ACESSÓRIOS TECH ---
  {
    id: 'acess-01',
    name: 'Carregador Rápido Anker Nano Pro 20W USB-C',
    brand: 'Anker',
    category: 'acessorios',
    categoryLabel: 'Carregadores & Cabos',
    price: 119.90,
    originalPrice: 159.00,
    status: 'pronta_entrega',
    deliveryTime: 'Envio Imediato (em até 24h)',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'O menor e mais seguro carregador rápido do mundo para iPhone e Android. Tecnologia de proteção térmica ActiveShield.',
    specs: [
      'Potência: 20W Power Delivery 3.0',
      'Tamanho ultracompacto (50% menor que o padrão)',
      'Compatível com iPhone 11 ao 16 Pro Max e Samsung Galaxy',
      'Certificação Anker de segurança contra picos'
    ],
    isFeatured: false,
    batchCodeInfo: 'Produto original lacrado Anker com código QR de verificação.'
  }
];
