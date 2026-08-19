import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  FlaskConical,
  DollarSign,
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface Supply {
  id: string;
  name: string;
  unit: string;
}

interface RecipeItem {
  id: string;
  supplyId: string;
  supply: Supply;
  quantityRequired: number;
}

interface Recipe {
  id: string;
  description?: string;
  items: RecipeItem[];
}

interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  stockQuantity: number;
  minStock: number;
  price: number;
  recipe?: Recipe;
  createdAt: string;
}

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modais State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Campos Produto
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Desinfetantes');
  const [unit, setUnit] = useState('5L');
  const [stockQuantity, setStockQuantity] = useState<number | string>(0);
  const [minStock, setMinStock] = useState<number | string>(10);
  const [price, setPrice] = useState<number | string>(0);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal Receita / Fórmula
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedProductForRecipe, setSelectedProductForRecipe] = useState<Product | null>(null);
  const [recipeDescription, setRecipeDescription] = useState('');
  const [recipeItems, setRecipeItems] = useState<Array<{ supplyId: string; quantityRequired: number }>>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, suppRes] = await Promise.all([
        api.get('/products'),
        api.get('/supplies'),
      ]);
      setProducts(prodRes.data || []);
      setSupplies(suppRes.data || []);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateProductModal = () => {
    setEditingProductId(null);
    setName('');
    setCategory('Desinfetantes');
    setUnit('5L');
    setStockQuantity(0);
    setMinStock(10);
    setPrice(0);
    setFormError(null);
    setShowProductModal(true);
  };

  const openEditProductModal = (p: Product) => {
    setEditingProductId(p.id);
    setName(p.name);
    setCategory(p.category);
    setUnit(p.unit);
    setStockQuantity(p.stockQuantity);
    setMinStock(p.minStock);
    setPrice(p.price);
    setFormError(null);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payload = {
      name,
      category,
      unit,
      stockQuantity: Number(stockQuantity),
      minStock: Number(minStock),
      price: Number(price),
    };

    try {
      if (editingProductId) {
        await api.put(`/products/${editingProductId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setShowProductModal(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Erro ao salvar produto.');
    }
  };

  const handleDeleteProduct = async (id: string, prodName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o produto "${prodName}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir produto.');
    }
  };

  // Abrir Modal de Fórmula
  const openRecipeModal = (p: Product) => {
    setSelectedProductForRecipe(p);
    setRecipeDescription(p.recipe?.description || `Fórmula para produção de 1 unidade de ${p.name}`);
    
    if (p.recipe && p.recipe.items.length > 0) {
      setRecipeItems(
        p.recipe.items.map((item) => ({
          supplyId: item.supplyId,
          quantityRequired: item.quantityRequired,
        }))
      );
    } else {
      setRecipeItems([{ supplyId: supplies[0]?.id || '', quantityRequired: 1 }]);
    }
    setShowRecipeModal(true);
  };

  const addRecipeItemRow = () => {
    if (supplies.length === 0) return;
    setRecipeItems([...recipeItems, { supplyId: supplies[0].id, quantityRequired: 1 }]);
  };

  const removeRecipeItemRow = (index: number) => {
    setRecipeItems(recipeItems.filter((_, i) => i !== index));
  };

  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForRecipe) return;

    try {
      await api.post(`/products/${selectedProductForRecipe.id}/recipe`, {
        description: recipeDescription,
        items: recipeItems.map((item) => ({
          supplyId: item.supplyId,
          quantityRequired: Number(item.quantityRequired),
        })),
      });

      setShowRecipeModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar fórmula.');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Package className="w-7 h-7 text-slate-800" />
            <span>Produtos de Limpeza Acabados & Fórmulas</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestão do catálogo de produtos finais e fórmulas de composição química para produção.
          </p>
        </div>

        {(user?.role === 'ADMINISTRADOR' || user?.role === 'GERENTE' || user?.role === 'ROOT') && (
          <button
            onClick={openCreateProductModal}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Produto de Limpeza</span>
          </button>
        )}
      </div>

      {/* Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por produto ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800"
          />
        </div>

        <button
          onClick={fetchData}
          className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl text-xs transition"
          title="Atualizar Dados"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Catálogo de Produtos Acabados</h2>
          <span className="text-xs text-slate-500">Exibindo {filteredProducts.length} produtos</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
            <span>Carregando produtos...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-semibold text-slate-700 text-sm">Nenhum produto cadastrado no catálogo.</p>
            <p className="text-xs text-slate-500 mt-1">O banco de dados está zerado para inserção dos seus produtos reais.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Produto de Limpeza</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Embalagem/Unid</th>
                  <th className="px-4 py-3 text-right">Estoque Acabado</th>
                  <th className="px-4 py-3 text-right">Preço de Venda</th>
                  <th className="px-4 py-3 text-center">Fórmula Química</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredProducts.map((p) => {
                  const hasRecipe = p.recipe && p.recipe.items.length > 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-bold text-slate-900 text-sm">{p.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 border border-slate-300 text-slate-700">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-mono">{p.unit}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                        {p.stockQuantity} un
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                        R$ {p.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {hasRecipe ? (
                          <button
                            onClick={() => openRecipeModal(p)}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-semibold text-[11px] hover:bg-emerald-100 transition inline-flex items-center space-x-1"
                          >
                            <FlaskConical className="w-3.5 h-3.5" />
                            <span>{p.recipe?.items.length} Insumos</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => openRecipeModal(p)}
                            className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-semibold text-[11px] hover:bg-amber-100 transition inline-flex items-center space-x-1"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            <span>Sem Receita</span>
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => openEditProductModal(p)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition border border-slate-200"
                            title="Editar Produto"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {(user?.role === 'GERENTE' || user?.role === 'ROOT') && (
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 rounded-lg transition border border-slate-200"
                              title="Excluir Produto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Cadastro/Edição de Produto */}
      {showProductModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <Package className="w-5 h-5 text-slate-700" />
                <span>{editingProductId ? 'Editar Produto' : 'Cadastrar Novo Produto'}</span>
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Detergente Neutro Concentrado 500ml"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Categoria *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                  >
                    <option value="Detergentes">Detergentes</option>
                    <option value="Desinfetantes">Desinfetantes</option>
                    <option value="Sabões Líquidos">Sabões Líquidos</option>
                    <option value="Limpeza Pesada / Desengraxante">Limpeza Pesada / Desengraxante</option>
                    <option value="Água Sanitária / Alvejante">Água Sanitária / Alvejante</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Embalagem/Unid *</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Ex: 500ml, 1L, 5L, 20L"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Estoque Inicial (Unid)</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Preço de Venda (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-md"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Definição de Fórmula Química */}
      {showRecipeModal && selectedProductForRecipe && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <FlaskConical className="w-5 h-5 text-slate-700" />
                <span>Fórmula Química para {selectedProductForRecipe.name}</span>
              </h3>
              <button onClick={() => setShowRecipeModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {supplies.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
                Você precisa ter ao menos 1 Matéria-Prima cadastrada no sistema antes de criar uma fórmula. Cadastre as matérias-primas no menu de Insumos.
              </div>
            ) : (
              <form onSubmit={handleSaveRecipe} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Descrição / Instrução Técnica</label>
                  <input
                    type="text"
                    value={recipeDescription}
                    onChange={(e) => setRecipeDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-700 font-semibold">
                      Insumos Necessários por 1 Unidade ({selectedProductForRecipe.unit}):
                    </label>
                    <button
                      type="button"
                      onClick={addRecipeItemRow}
                      className="text-xs text-slate-800 font-bold hover:underline"
                    >
                      + Adicionar Insumo
                    </button>
                  </div>

                  {recipeItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <select
                        value={item.supplyId}
                        onChange={(e) => {
                          const updated = [...recipeItems];
                          updated[index].supplyId = e.target.value;
                          setRecipeItems(updated);
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-slate-800"
                      >
                        {supplies.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.unit})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        step="0.001"
                        value={item.quantityRequired}
                        onChange={(e) => {
                          const updated = [...recipeItems];
                          updated[index].quantityRequired = Number(e.target.value);
                          setRecipeItems(updated);
                        }}
                        placeholder="Qtd"
                        className="w-24 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-right"
                      />

                      {recipeItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRecipeItemRow(index)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowRecipeModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium border border-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-md"
                  >
                    Salvar Fórmula
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
