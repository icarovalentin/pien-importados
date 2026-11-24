'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, StockStatus } from '@/types/product';
import { formatCurrency } from '@/utils/whatsapp';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  ArrowLeft,
  Search,
  Lock,
  Unlock,
  Package,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Check,
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'todos' | StockStatus>('todos');

  // Estado do Modal de Cadastro / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Estado do Modal de Alteração de Senha
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Campos do Formulário
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formCategory, setFormCategory] = useState<'perfumes' | 'beleza' | 'eletronicos' | 'acessorios'>('perfumes');
  const [formCategoryLabel, setFormCategoryLabel] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formOriginalPrice, setFormOriginalPrice] = useState('');
  const [formStatus, setFormStatus] = useState<StockStatus>('pronta_entrega');
  const [formDeliveryTime, setFormDeliveryTime] = useState('Envio Imediato (em até 24h)');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSpecs, setFormSpecs] = useState('');
  const [formBatchCode, setFormBatchCode] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verifica login salvo na sessão
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('pien_admin_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
    fetchProducts();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;

    setLoginLoading(true);
    setPinError(false);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pinInput }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('pien_admin_auth', 'true');
        setPinError(false);
      } else {
        setPinError(true);
      }
    } catch (err) {
      console.error('Erro ao autenticar:', err);
      setPinError(true);
    } finally {
      setLoginLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para novo produto
  const handleOpenNewModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormBrand('');
    setFormCategory('perfumes');
    setFormCategoryLabel('Perfumaria');
    setFormPrice('');
    setFormOriginalPrice('');
    setFormStatus('pronta_entrega');
    setFormDeliveryTime('Envio Imediato (em até 24h)');
    setFormImageUrl('');
    setFormDescription('');
    setFormSpecs('');
    setFormBatchCode('Lote verificado com selo de autenticidade.');
    setIsModalOpen(true);
  };

  // Abrir modal para editar produto existente
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormBrand(product.brand);
    setFormCategory(product.category as any);
    setFormCategoryLabel(product.categoryLabel);
    setFormPrice(String(product.price));
    setFormOriginalPrice(product.originalPrice ? String(product.originalPrice) : '');
    setFormStatus(product.status);
    setFormDeliveryTime(product.deliveryTime);
    setFormImageUrl(product.images[0] || '');
    setFormDescription(product.description || '');
    setFormSpecs(product.specs ? product.specs.join('\n') : '');
    setFormBatchCode(product.batchCodeInfo || '');
    setIsModalOpen(true);
  };

  // Upload direto de imagem
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setFormImageUrl(data.url);
      }
    } catch (err) {
      alert('Erro ao enviar imagem. Tente novamente.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Salvar produto (Criar ou Atualizar)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice) {
      alert('Nome e Preço são obrigatórios!');
      return;
    }

    setSaveLoading(true);

    const specsArray = formSpecs
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      id: editingProduct ? editingProduct.id : undefined,
      name: formName,
      brand: formBrand || 'Importado',
      category: formCategory,
      categoryLabel: formCategoryLabel || formCategory,
      price: parseFloat(formPrice.replace(',', '.')),
      originalPrice: formOriginalPrice ? parseFloat(formOriginalPrice.replace(',', '.')) : undefined,
      status: formStatus,
      deliveryTime: formDeliveryTime,
      images: [formImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
      description: formDescription,
      specs: specsArray,
      batchCodeInfo: formBatchCode,
    };

    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const res = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchProducts();
      } else {
        alert('Erro ao salvar produto.');
      }
    } catch (err) {
      alert('Erro de conexão ao salvar.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Alternar rapidamente entre Pronta-Entrega e Encomenda
  const handleQuickToggleStatus = async (product: Product) => {
    const nextStatus: StockStatus = product.status === 'pronta_entrega' ? 'encomenda' : 'pronta_entrega';
    const nextDeliveryTime = nextStatus === 'pronta_entrega' 
      ? 'Envio Imediato (em até 24h)' 
      : 'Sob Encomenda (10 a 15 dias úteis)';

    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          status: nextStatus,
          deliveryTime: nextDeliveryTime,
        }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, status: nextStatus, deliveryTime: nextDeliveryTime } : p
          )
        );
      }
    } catch (err) {
      console.error('Erro ao alternar status:', err);
    }
  };

  // Excluir produto
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente excluir o produto "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert('Erro ao excluir produto.');
      }
    } catch (err) {
      alert('Erro ao excluir produto.');
    }
  };

  // Contagens
  const stats = useMemo(() => {
    const total = products.length;
    const pronta = products.filter((p) => p.status === 'pronta_entrega').length;
    const encomenda = products.filter((p) => p.status === 'encomenda').length;
    return { total, pronta, encomenda };
  }, [products]);

  // Produtos filtrados
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (stockFilter !== 'todos' && p.status !== stockFilter) return false;
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, stockFilter, searchTerm]);

  // Se não autenticado, mostra tela de PIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-dark-950 text-zinc-900 dark:text-zinc-100">
        <div className="w-full max-w-sm p-6 sm:p-8 bg-white dark:bg-dark-900 rounded-3xl border border-zinc-200 dark:border-dark-800 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto text-gold-600 dark:text-gold-400">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Painel Pien Importados</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Digite a senha de acesso para gerenciar o catálogo
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              placeholder="Digite a senha de acesso"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-dark-950 border border-zinc-300 dark:border-dark-700 text-sm text-center tracking-widest focus:outline-none focus:border-gold-500"
              autoFocus
            />

            {pinError && (
              <p className="text-xs text-red-500 font-semibold">Senha incorreta. Tente novamente.</p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold text-sm shadow-md transition-all active:scale-95"
            >
              {loginLoading ? 'Verificando...' : 'Entrar no Painel'}
            </button>
          </form>

          <div className="pt-2">
            <Link
              href="/"
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para a Loja</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Topo do Painel */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-dark-800 bg-white/90 dark:bg-dark-900/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-zinc-600 dark:text-zinc-300 transition-colors"
              title="Voltar para a vitrine"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-wider text-zinc-900 dark:text-white">
                  PIEN
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Painel Lojista
                </span>
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:inline">
                Gerencie seus produtos, fotos e estoque
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-dark-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:border-zinc-300 border border-transparent transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver Vitrine</span>
            </Link>

            <button
              onClick={handleOpenNewModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Novo Produto</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-dark-900 border border-zinc-200 dark:border-dark-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Total de Produtos
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">
                {stats.total}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-100 dark:bg-dark-800 text-zinc-600 dark:text-zinc-400">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-dark-900 border border-zinc-200 dark:border-dark-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                🟢 Pronta-Entrega
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">
                {stats.pronta}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-dark-900 border border-zinc-200 dark:border-dark-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                🟡 Sob Encomenda
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">
                {stats.encomenda}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-dark-900 border border-zinc-200 dark:border-dark-800 rounded-2xl shadow-sm">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Buscar por nome ou marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-dark-950 border border-zinc-300 dark:border-dark-700 text-xs sm:text-sm rounded-xl pl-9 pr-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setStockFilter('todos')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                stockFilter === 'todos'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-dark-950'
                  : 'bg-zinc-100 dark:bg-dark-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Todos ({stats.total})
            </button>
            <button
              onClick={() => setStockFilter('pronta_entrega')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                stockFilter === 'pronta_entrega'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-100 dark:bg-dark-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              🟢 Pronta ({stats.pronta})
            </button>
            <button
              onClick={() => setStockFilter('encomenda')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                stockFilter === 'encomenda'
                  ? 'bg-amber-600 text-white'
                  : 'bg-zinc-100 dark:bg-dark-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              🟡 Encomenda ({stats.encomenda})
            </button>
          </div>
        </div>

        {/* Lista de Produtos (Tabela / Cards) */}
        {loading ? (
          <div className="text-center py-12 text-sm text-zinc-500">Carregando catálogo...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-dark-900 border border-zinc-200 dark:border-dark-800 rounded-2xl p-6">
            <Package className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Nenhum produto cadastrado com esses filtros.</p>
            <button
              onClick={handleOpenNewModal}
              className="mt-3 px-4 py-2 rounded-xl bg-gold-500 text-dark-950 text-xs font-bold"
            >
              + Adicionar Primeiro Produto
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-900 border border-zinc-200 dark:border-dark-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-zinc-200 dark:divide-dark-800">
            {filteredProducts.map((p) => {
              const isPronta = p.status === 'pronta_entrega';
              return (
                <div
                  key={p.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-dark-850/60 transition-colors"
                >
                  {/* Foto + Informações */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-zinc-100 dark:bg-dark-950 shrink-0 border border-zinc-200 dark:border-dark-700">
                      <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gold-700 dark:text-gold-400">
                          {p.brand}
                        </span>
                        <span className="text-zinc-400 text-xs">•</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {p.categoryLabel}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white truncate">
                        {p.name}
                      </h3>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(p.price)}
                        </span>
                        {p.originalPrice && (
                          <span className="text-zinc-400 line-through text-[11px]">
                            {formatCurrency(p.originalPrice)}
                          </span>
                        )}
                        <span className="text-zinc-400 text-[11px] hidden sm:inline">
                          ({p.deliveryTime})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ações e Alternador Rápido de Estoque */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-zinc-100 dark:border-dark-800">
                    {/* Botão de Troca Rápida de Estoque (1 Clique) */}
                    <button
                      onClick={() => handleQuickToggleStatus(p)}
                      title="Clique para alternar entre Pronta-Entrega e Sob Encomenda instantaneamente"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                        isPronta
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40 hover:bg-amber-100'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isPronta ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      <span>{isPronta ? '🟢 Pronta-Entrega' : '🟡 Sob Encomenda'}</span>
                    </button>

                    {/* Botão Editar */}
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="p-2 rounded-xl text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-dark-800 transition-colors"
                      title="Editar detalhes do produto"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Botão Excluir */}
                    <button
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Excluir produto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal de Cadastro / Edição de Produto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white dark:bg-dark-900 border border-zinc-200 dark:border-dark-700 rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
            {/* Cabeçalho do Modal */}
            <div className="p-5 border-b border-zinc-200 dark:border-dark-800 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-zinc-900 dark:text-white text-base sm:text-lg">
                  {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Preencha as informações para atualizar o catálogo online
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-dark-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário com Scroll */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Perfume Dior Sauvage EDP 100ml ou JBL Flip 6"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-dark-950 border border-zinc-300 dark:border-dark-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Marca & Categoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                    Marca
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Victoria's Secret, Dior, JBL, Apple"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-dark-950 border border-zinc-300 dark:border-dark-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                    Departamento
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      setFormCategory(cat);
                      const labels: Record<string, string> = {
                        perfumes: 'Perfumaria Fina',
                        beleza: "Victoria's Secret & Cuidados",
                        eletronicos: 'Som JBL & Eletrônicos',
                        acessorios: 'Acessórios Tech',
                      };
                      setFormCategoryLabel(labels[cat] || cat);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-dark-950 border border-zinc-300 dark:border-dark-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="perfumes">🌸 Perfumaria Fina</option>
                    <option value="beleza">💄 Victoria&apos;s Secret & Cuidados</option>
                    <option value="eletronicos">🔊 Som JBL & Eletrônicos</option>
                    <option value="acessorios">⚡ Acessórios Tech</option>
                  </select>
                </div>
              </div>

              {/* Preço e Preço Antigo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                    Preço de Venda (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 549.90"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-dark-950 border border-zinc-300 dark:border-dark-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                    Preço Original / De (R$) <span className="text-zinc-400 font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 699.00 (riscado na vitrine)"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-dark-950 border border-zinc-300 dark:border-dark-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* Disponibilidade (Estoque) & Prazo */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-dark-950 border border-zinc-200 dark:border-dark-800 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Disponibilidade do Estoque
                </label>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormStatus('pronta_entrega');
                      setFormDeliveryTime('Envio Imediato (em até 24h)');
                    }}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      formStatus === 'pronta_entrega'
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow'
                        : 'bg-white dark:bg-dark-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-dark-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-white" />
                    <span>🟢 Pronta-Entrega</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormStatus('encomenda');
                      setFormDeliveryTime('Sob Encomenda (10 a 15 dias úteis)');
                    }}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      formStatus === 'encomenda'
                        ? 'bg-amber-500 text-white border-amber-600 shadow'
                        : 'bg-white dark:bg-dark-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-dark-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-white" />
                    <span>🟡 Sob Encomenda</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                    Mensagem de Prazo na Vitrine:
                  </label>
                  <input
                    type="text"
                    value={formDeliveryTime}
                    onChange={(e) => setFormDeliveryTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-dark-900 border border-zinc-200 dark:border-dark-700 text-xs text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Upload de Imagem */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Foto do Produto
                </label>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {/* Preview da foto se existir */}
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-dark-950 border border-zinc-300 dark:border-dark-700 shrink-0 flex items-center justify-center">
                    {formImageUrl ? (
                      <Image src={formImageUrl} alt="" fill className="object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-zinc-400" />
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    {/* Botão de Enviar Foto do PC/Celular */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-4 rounded-xl border border-dashed border-zinc-400 dark:border-dark-600 hover:border-gold-500 bg-zinc-50 dark:bg-dark-950 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Upload className="w-4 h-4 text-gold-500" />
                      <span>{uploadingImage ? 'Enviando foto...' : 'Escolher foto do computador / celular'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-zinc-400 shrink-0">Ou link da foto:</span>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-dark-950 border border-zinc-200 dark:border-dark-700 text-xs text-zinc-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Descrição do Produto
                </label>
                <textarea
                  rows={3}
                  placeholder="Explique os benefícios, fragrância, notas olfativas ou especificações de som..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-dark-950 border border-zinc-300 dark:border-dark-700 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Especificações e Batch Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                    Especificações <span className="text-zinc-400 font-normal">(1 por linha)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Volume: 100ml&#10;À prova d'água IP67&#10;Bateria: 12h"
                    value={formSpecs}
                    onChange={(e) => setFormSpecs(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-dark-950 border border-zinc-300 dark:border-dark-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                    Garantia / Batch Code
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ex: Lote conferível no frasco e caixa com selo de autenticidade."
                    value={formBatchCode}
                    onChange={(e) => setFormBatchCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-dark-950 border border-zinc-300 dark:border-dark-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* Botões do Rodapé do Formulário */}
              <div className="pt-4 border-t border-zinc-200 dark:border-dark-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-950 text-xs sm:text-sm font-extrabold shadow-lg transition-all active:scale-95"
                >
                  {saveLoading ? 'Salvando...' : editingProduct ? 'Atualizar Produto' : 'Publicar na Vitrine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
