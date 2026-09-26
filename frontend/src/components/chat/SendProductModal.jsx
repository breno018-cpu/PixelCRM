import React, { useState, useEffect } from 'react';
import { 
  X, Search, ShoppingBag, Send, Loader2, Check, AlertCircle, 
  ExternalLink, Tag, ShieldCheck, ArrowRight
} from 'lucide-react';
import { authFetch } from '../../context/CRMContext';

export default function SendProductModal({ isOpen, onClose, activeChat, onProductSent }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [sentSuccessId, setSentSuccessId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCatalog();
    }
  }, [isOpen]);

  const loadCatalog = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [prodsRes, catsRes] = await Promise.all([
        authFetch('http://localhost:5000/api/products?visibility=VISIBLE'),
        authFetch('http://localhost:5000/api/categories')
      ]);

      if (prodsRes.ok) setProducts(await prodsRes.json());
      if (catsRes.ok) setCategories(await catsRes.json());
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      setErrorMsg('Falha ao conectar com o catálogo de produtos.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendProduct = async (product) => {
    if (!activeChat) return;
    setSendingId(product.id);
    setErrorMsg('');

    try {
      const res = await authFetch(`http://localhost:5000/api/products/${product.id}/send-whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: activeChat.id })
      });

      if (res.ok) {
        setSentSuccessId(product.id);
        if (onProductSent) onProductSent(product);
        setTimeout(() => {
          setSentSuccessId(null);
          onClose();
        }, 1200);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Erro ao enviar card do produto via WhatsApp.');
      }
    } catch (err) {
      setErrorMsg('Erro de conexão ao enviar produto.');
    } finally {
      setSendingId(null);
    }
  };

  if (!isOpen) return null;

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery || 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--card-bg)] text-[var(--text-primary)] w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl border border-[var(--border-light)] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border-light)] flex items-center justify-between bg-[var(--header-bg)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shadow-sm">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                Catálogo de Motos Shineray
                {activeChat && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-bold">
                    Para: {activeChat.name || activeChat.phone}
                  </span>
                )}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">Selecione o modelo desejado para enviar o card no WhatsApp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--active-bg)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Busca e Filtros */}
        <div className="p-3 border-b border-[var(--border-light)] bg-[var(--bg-secondary)] flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Buscar por nome do modelo ou código SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[var(--border-light)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-[var(--border-light)] bg-[var(--input-bg)] text-[var(--text-primary)] font-medium focus:outline-none"
            >
              <option value="">Todas as Categorias</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
        </div>

        {/* Feedback de Erro */}
        {errorMsg && (
          <div className="px-4 py-2 bg-rose-500/10 border-b border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
            <AlertCircle size={15} /> {errorMsg}
          </div>
        )}

        {/* Grid de Produtos */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {loading ? (
            <div className="h-48 flex flex-col items-center justify-center gap-2 text-[var(--text-secondary)]">
              <Loader2 size={24} className="animate-spin text-[var(--primary)]" />
              <span className="text-xs">Carregando catálogo de motos...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center gap-2 text-[var(--text-secondary)] text-center">
              <ShoppingBag size={32} className="opacity-30" />
              <p className="text-xs font-semibold">Nenhum produto encontrado no catálogo.</p>
              <p className="text-[11px]">Verifique a busca ou cadastre motos nas Configurações Corporativas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredProducts.map((p) => {
                let images = [];
                try {
                  images = typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images || []);
                } catch (e) {
                  images = [];
                }
                const firstImg = images[0] || null;
                const isSending = sendingId === p.id;
                const isSent = sentSuccessId === p.id;

                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl border border-[var(--border-light)] bg-[var(--card-bg)] hover:border-[var(--primary)] transition-all flex flex-col justify-between gap-3 shadow-sm hover:shadow-md group"
                  >
                    <div className="flex gap-3">
                      {/* Foto do Produto */}
                      <div className="w-16 h-16 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-light)] overflow-hidden shrink-0 flex items-center justify-center">
                        {firstImg ? (
                          <img src={firstImg} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <ShoppingBag size={20} className="text-[var(--text-secondary)] opacity-40" />
                        )}
                      </div>

                      {/* Dados Comerciais */}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">{p.name}</h4>
                          {p.sku && (
                            <span className="text-[9px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[var(--text-secondary)]">
                              {p.sku}
                            </span>
                          )}
                        </div>

                        <div className="text-xs font-extrabold text-[#00a884]">
                          R$ {Number(p.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>

                        {p.promoPrice && (
                          <div className="text-[10px] text-amber-600 font-semibold">
                            Promo: R$ {Number(p.promoPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        )}

                        <p className="text-[10px] text-[var(--text-secondary)] line-clamp-1">{p.description || 'Shineray Motos'}</p>
                      </div>
                    </div>

                    {/* Botão de Envio */}
                    <button
                      onClick={() => handleSendProduct(p)}
                      disabled={isSending || isSent}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                        isSent
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#00a884] hover:bg-emerald-600 text-white disabled:opacity-50'
                      }`}
                    >
                      {isSending ? (
                        <>
                          <Loader2 size={13} className="animate-spin" /> Enviando Card...
                        </>
                      ) : isSent ? (
                        <>
                          <Check size={13} /> Enviado com Sucesso!
                        </>
                      ) : (
                        <>
                          <Send size={13} /> Enviar no WhatsApp
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rodapé com Atalho Informativo */}
        <div className="px-5 py-2.5 bg-[var(--bg-secondary)] border-t border-[var(--border-light)] text-[10px] text-[var(--text-secondary)] flex items-center justify-between">
          <span>O cliente receberá foto, especificações e valor da moto.</span>
          <span className="font-semibold text-[var(--text-primary)]">PixelCRM Shineray</span>
        </div>

      </div>
    </div>
  );
}
