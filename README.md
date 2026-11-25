# 🛍️ Pien Importados — Catálogo Digital para WhatsApp

Vitrine online moderna e sofisticada para produtos importados (Perfumaria Fina, Victoria's Secret, Caixas JBL e Eletrônicos), com foco 100% em conversão e fechamento direto via WhatsApp.

---

## ✨ Destaques da Aplicação

- **Identidade Visual Premium (Dark Luxury):** Fundo grafite/chumbo com detalhes em ouro champagne e tipografia moderna. Unissex, elegante e imponente.
- **Filtros de Disponibilidade:**
  - 🟢 **Pronta-Entrega:** Itens em estoque no Brasil com envio imediato (em até 24h).
  - 🟡 **Sob Encomenda:** Itens trazidos dos EUA e Europa com prazo claro de entrega.
- **Botão Inteligente de WhatsApp:**
  - O cliente clica em "Pedir no WhatsApp" e uma mensagem personalizada é gerada com o nome do produto, lote, preço e status.
- **Sacola de Orçamento (Lista de Interesse):**
  - O cliente pode selecionar múltiplos itens (ex: 1 perfume + 1 hidratante + 1 caixa JBL) e enviar uma única mensagem com a lista completa para o WhatsApp!
- **Pilar Anti-Pirataria & Confiança:**
  - Selos de "100% Original e Lacrado".
  - Campo explicativo de **Batch Code (Código de Lote)** para validação de autenticidade.
- **Busca Rápida em Tempo Real:** Pesquisa por nome, marca ou categoria com resposta instantânea.
- **Mobile First:** Totalmente fluido e otimizado para celulares.

---

## 🚀 Como Executar Localmente

No terminal, dentro da pasta do projeto:

```bash
# Iniciar o servidor de desenvolvimento
npm run dev
```

Abra o navegador em: [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Como Configurar o Número do seu WhatsApp

Abra o arquivo `src/data/products.ts` e altere a constante na linha 3:

```typescript
export const STORE_PHONE_NUMBER = '5511999999999'; // Substitua pelo seu DDI + DDD + Número (ex: 5541999999999)
```

---

## 📦 Como Adicionar ou Alterar Produtos

Pelo painel `/admin` (login com `ADMIN_PASSWORD`) você cadastra, edita e remove produtos e envia fotos. Os dados ficam no Supabase (rode `supabase/schema.sql`). Em desenvolvimento, sem Supabase, usa-se `src/data/products.json`. Referência do formato de produto: Cada produto possui o seguinte formato simples:

```typescript
{
  id: 'novo-01',
  name: 'Nome do Produto',
  brand: 'Marca',
  category: 'perfumes', // 'perfumes' | 'beleza' | 'eletronicos' | 'acessorios'
  categoryLabel: 'Perfumaria Masculina',
  price: 499.90,
  originalPrice: 599.00, // opcional
  status: 'pronta_entrega', // 'pronta_entrega' ou 'encomenda'
  deliveryTime: 'Envio Imediato (em até 24h)',
  images: [
    'https://sua-imagem-aqui.jpg'
  ],
  description: 'Descrição envolvente do produto...',
  specs: [
    '100% Original Lacrado',
    'Volumetria: 100ml'
  ],
  isFeatured: true,
  batchCodeInfo: 'Lote conferível nos sites de batch check.'
}
```

---

## 🌐 Publicação na Internet (Deploy Gratuito na Vercel)

1. Crie uma conta na [Vercel](https://vercel.com).
2. Conecte o repositório ou suba a pasta pelo terminal com `npx vercel`.
3. Pronto! Seu catálogo estará no ar com link próprio para colocar na bio do Instagram e compartilhar no WhatsApp.

### 🔐 Variáveis de ambiente (obrigatórias em produção)

Veja `.env.example`. Defina na Vercel: `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (mín. 32 caracteres, gere com `openssl rand -base64 48`), `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`. Sem as duas primeiras o login do admin retorna 503. Recomendado: crie um banco gratuito no [Upstash](https://upstash.com) e defina `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` para o limite de tentativas de login valer entre todas as instâncias da Vercel. O deploy é automático: cada merge no `main` publica o site na Vercel. O painel não tem mais link no site: acesse digitando `/admin` na URL.

---

## ✏️ Como mexer no menu e nas categorias

Tudo fica em **um único arquivo: `src/config/site.ts`**.

- **Mudar o nome de uma categoria ou a ordem do menu:** edite a lista `CATEGORIES` (a ordem da lista é a ordem do menu, no computador e no celular).
- **Adicionar uma categoria:** acrescente uma linha em `CATEGORIES` (`id` sem acento e minúsculo, e o nome que aparece no menu), inclua o mesmo `id` na lista do arquivo `supabase/add-categorias.sql` e rode esse arquivo uma vez no SQL Editor do Supabase.
- **Categoria só para maiores de 18 anos (bebidas):** use `adultOnly: true`. O site mostra o aviso automaticamente.
- **Texto da faixa preta no topo e aviso de maiores de 18:** objeto `SITE`, no mesmo arquivo.

O painel `/admin`, a API e o menu (computador e celular) leem essa mesma lista, então não é preciso editar mais nada.
