import React, { useState, useEffect } from 'react';
import { 
  X, Search, ShoppingBag, Plus, Edit2, Trash2, Loader2, Save, 
  AlertCircle, CheckCircle2, Image, Tag, ArrowRight
} from 'lucide-react';
import { authFetch } from '../../context/CRMContext';

export default function CatalogGeneralModal({ isOpen, onClose, currentUser }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [productForm, setProductForm] = useState(null); // { id, name, sku, description, brand, price, promoPrice, categoryId, images, visibility }
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.roleRel?.name === 'ADMINISTRADOR';

  useEffect(() => {
    if (isOpen) {
      loadCatalog();
    }
  }, [isOpen]);

  const loadCatalog = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [pRes, cRes] = await Promise.all([
        authFetch('http://localhost:5000/api/products'),
        authFetch('http://localhost:5000/api/categories')
      ]);

      if (pRes.ok) setProducts(await pRes.json());
      if (cRes.ok) setCategories(await cRes.json());
    } catch (err) {
      console.error('Erro ao carregar catálogo:', err);
      setErrorMsg('Falha ao conectar aos serviços do catálogo.');
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (success, error = '') => {
    if (success) {
      setSuccessMsg(success);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
    if (error) {
      setErrorMsg(error);
      setTimeout(() => setErrorMsg(''), 5000);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setErrorMsg('');

    try {
      let imagesArray = [];
      if (productForm.imageUrl) {
        imagesArray = [productForm.imageUrl.trim()];
      }

      const payload = {
        name: productForm.name.trim(),
        sku: productForm.sku?.trim() || null,
        description: productForm.description?.trim() || null,
        brand: productForm.brand?.trim() || 'Shineray',
        price: Number(productForm.price),
        promoPrice: productForm.promoPrice ? Number(productForm.promoPrice) : null,
        categoryId: productForm.categoryId || null,
        images: imagesArray,
        visibility: productForm.visibility || 'VISIBLE'
      };

      const method = productForm.id ? 'PUT' : 'POST';
      const url = productForm.id ? `http://localhost:5000/api/products/${productForm.id}` : 'http://localhost:5000/api/products';

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setProductForm(null);
        await loadCatalog();
        showFeedback('Produto salvo com sucesso no catálogo!');
      } else {
        const data = await res.json();
        showFeedback('', data.error || 'Erro ao salvar produto.');
      }
    } catch (err) {
      showFeedback('', 'Erro de conexão ao salvar produto.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Tem certeza que deseja remover este produto do catálogo?')) return;

    try {
      const res = await authFetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await loadCatalog();
        showFeedback('Produto removido com sucesso.');
      } else {
        const data = await res.json();
        showFeedback('', data.error || 'Erro ao excluir produto.');
      }
    } catch (err) {
      showFeedback('', 'Erro ao excluir produto.');
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
      <div className="bg-[var(--card-bg)] text-[var(--text-primary)] w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl border border-[var(--border-light)] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-light)] flex items-center justify-between bg-[var(--header-bg)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md">
              <ShoppingBag size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Catálogo Comercial Shineray
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  {products.length} {products.length === 1 ? 'modelo' : 'modelos'}
                </span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">Gestão de produtos, fotos, preços regulares e promocionais</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--active-bg)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Feedback */}
        {successMsg && (
          <div className="px-6 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-600 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="px-6 py-2.5 bg-rose-500/10 border-b border-rose-500/20 text-rose-600 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {/* Barra de Filtros & Ações */}
        <div className="p-4 border-b border-[var(--border-light)] bg-[var(--bg-secondary)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Buscar por nome da moto ou código SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[var(--border-light)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-[var(--border-light)] bg-[var(--input-bg)] text-[var(--text-primary)] font-medium focus:outline-none"
              >
                <option value="">Todas as Categorias</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>

          {!productForm && isAdmin && (
            <button
              onClick={() => setProductForm({
                id: null,
                name: '',
                sku: '',
                description: '',
                brand: 'Shineray',
                price: '',
                promoPrice: '',
                categoryId: categories[0]?.id || '',
                imageUrl: '',
                visibility: 'VISIBLE'
              })}
              className="px-3.5 py-1.5 bg-[#00a884] hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus size={15} /> Novo Produto
            </button>
          )}
        </div>

        {/* Corpo do Modal */}
        <div className="flex-1 p-6 overflow-y-auto bg-[var(--card-bg)]">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-[var(--text-secondary)]">
              <Loader2 size={28} className="animate-spin text-[var(--primary)]" />
              <span className="text-xs">Carregando motos e especificações...</span>
            </div>
          ) : productForm ? (
            <form onSubmit={handleSaveProduct} className="p-5 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-secondary)] space-y-4 max-w-2xl mx-auto">
              <h3 className="text-sm font-bold flex items-center gap-2">
                {productForm.id ? `Editar Modelo: ${productForm.name}` : 'Cadastrar Nova Moto'}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold mb-1">Nome do Modelo *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-light)] bg-[var(--input-bg)] text-xs"
                    placeholder="Ex: Shineray SHI 175 EFI 2026"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Código SKU / Ref</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-light)] bg-[var(--input-bg)] text-xs"
                    placeholder="Ex: SHI-175-BLK"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Categoria</label>
                  <select
                    value={productForm.categoryId || ''}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-light)] bg-[var(--input-bg)] text-xs font-semibold"
                  >
                    <option value="">Sem Categoria</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Preço Regular (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-light)] bg-[var(--input-bg)] text-xs font-bold"
                    placeholder="15990.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Preço Promocional (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.promoPrice}
                    onChange={(e) => setProductForm({ ...productForm, promoPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-light)] bg-[var(--input-bg)] text-xs"
                    placeholder="14490.00 (opcional)"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold mb-1">URL da Imagem da Moto</label>
                  <input
                    type="url"
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-light)] bg-[var(--input-bg)] text-xs"
                    placeholder="https://exemplo.com/motos/shi175.jpg"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold mb-1">Descrição e Ficha Técnica</label>
                  <textarea
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border-light)] bg-[var(--input-bg)] text-xs"
                    placeholder="Motor 175cc com injeção eletrônica EFI, freios a disco CBS, painel digital..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProductForm(null)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-light)] text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-5 py-2 bg-[#00a884] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  {saveLoading && <Loader2 size={14} className="animate-spin" />} Salvar Produto
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredProducts.map((p) => {
                let images = [];
                try {
                  images = typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images || []);
                } catch (e) {
                  images = [];
                }
                const firstImg = images[0] || null;

                return (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-[var(--border-light)] bg-[var(--card-bg)] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="h-40 bg-[var(--bg-secondary)] relative flex items-center justify-center overflow-hidden">
                      {firstImg ? (
                        <img src={firstImg} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      ) : (
                        <ShoppingBag size={40} className="text-[var(--text-secondary)] opacity-30" />
                      )}
                      {p.category && (
                        <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                          {p.category.name}
                        </span>
                      )}
                      {p.promoPrice && (
                        <span className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                          OFERTA
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">{p.name}</h4>
                          {p.sku && <span className="text-[9px] font-mono text-[var(--text-secondary)]">{p.sku}</span>}
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mt-1">{p.description || 'Shineray Motos'}</p>
                      </div>

                      <div className="pt-2 border-t border-[var(--border-light)] flex items-center justify-between">
                        <div>
                          <span className="text-xs font-extrabold text-[#00a884]">
                            R$ {Number(p.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          {p.promoPrice && (
                            <span className="text-[10px] text-amber-600 block font-semibold">
                              De: R$ {Number(p.promoPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>

                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setProductForm({
                                  id: p.id,
                                  name: p.name,
                                  sku: p.sku || '',
                                  description: p.description || '',
                                  brand: p.brand || 'Shineray',
                                  price: p.price,
                                  promoPrice: p.promoPrice || '',
                                  categoryId: p.categoryId || '',
                                  imageUrl: firstImg || '',
                                  visibility: p.visibility || 'VISIBLE'
                                });
                              }}
                              className="p-1.5 text-[var(--text-secondary)] hover:text-[#00a884] hover:bg-[var(--active-bg)] rounded-lg"
                              title="Editar Produto"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 text-[var(--text-secondary)] hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Excluir Produto"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
