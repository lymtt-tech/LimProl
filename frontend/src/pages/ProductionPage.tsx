import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Factory,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FlaskConical,
  Package,
  Layers
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  unit: string;
  stockQuantity: number;
  recipe?: {
    items: Array<{
      supplyId: string;
      quantityRequired: number;
      supply: {
        name: string;
        unit: string;
        stockQuantity: number;
      };
    }>;
  };
}

interface ProductionOrder {
  id: string;
  quantityToProduce: number;
  status: string;
  createdAt: string;
  completedAt?: string;
  product: {
    name: string;
    unit: string;
  };
  createdBy: {
    name: string;
    role: string;
  };
}

export const ProductionPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantityToProduce, setQuantityToProduce] = useState<number | string>(10);
  const [modalError, setModalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordRes, prodRes] = await Promise.all([
        api.get('/production'),
        api.get('/products'),
      ]);
      setOrders(ordRes.data || []);
      setProducts(prodRes.data || []);
      if (prodRes.data && prodRes.data.length > 0) {
        setSelectedProductId(prodRes.data[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar dados de produção:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExecuteProduction = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);

    try {
      await api.post('/production', {
        productId: selectedProductId,
        quantityToProduce: Number(quantityToProduce),
      });

      setShowModal(false);
      fetchData();
    } catch (err: any) {
      if (err.response && err.response.data) {
        const msg = err.response.data.message;
        const details = err.response.data.details;
        setModalError(details ? `${msg} -> ${details.join(' | ')}` : msg);
      } else {
        setModalError('Erro de conexão ao processar ordem de produção.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Factory className="w-7 h-7 text-slate-800" />
            <span>Fabricação & Ordens de Produção</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Emissão de lotes de fabricação com baixa automática de matérias-primas e entrada de produto acabado.
          </p>
        </div>

        {(user?.role === 'GERENTE' || user?.role === 'ROOT') && (
          <button
            onClick={() => {
              setModalError(null);
              setShowModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Ordem de Fabricação</span>
          </button>
        )}
      </div>

      {/* Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <span className="text-xs text-slate-500 font-semibold">Histórico de Fabricação da Fábrica</span>
        <button
          onClick={fetchData}
          className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl text-xs transition"
          title="Atualizar Dados"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Histórico de Ordens de Produção */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-slate-500 flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
            <span>Carregando ordens de fabricação...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-semibold text-slate-700 text-sm">Nenhuma ordem de fabricação executada ainda.</p>
            <p className="text-xs text-slate-500 mt-1">Cadastre as matérias-primas e a receita do produto antes de emitir o primeiro lote de produção.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Data / Horário</th>
                  <th className="px-4 py-3">Produto Fabricado</th>
                  <th className="px-4 py-3 text-right">Lote Produzido</th>
                  <th className="px-4 py-3">Responsável</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-600 font-mono flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(o.createdAt).toLocaleString('pt-BR')}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 text-sm">{o.product.name}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      {o.quantityToProduce} {o.product.unit}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <span className="font-medium">{o.createdBy.name}</span>
                      <span className="ml-1 text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {o.createdBy.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Concluído (Estoque Baixado)</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Emitir Ordem de Produção */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <Factory className="w-5 h-5 text-slate-700" />
                <span>Emitir Ordem de Fabricação</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            {products.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
                Nenhum produto cadastrado no catálogo. Cadastre produtos no menu de Produtos antes de fabricar.
              </div>
            ) : (
              <form onSubmit={handleExecuteProduction} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Selecione o Produto a Fabricar *</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Estoque Atual: {p.stockQuantity} un)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Quantidade a Produzir (Lote) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={quantityToProduce}
                    onChange={(e) => setQuantityToProduce(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-sm focus:bg-white focus:outline-none focus:border-slate-800"
                  />
                </div>

                {/* Pré-visualização da Receita / Insumos */}
                {selectedProduct && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
                      <FlaskConical className="w-4 h-4 text-slate-700" />
                      <span>Insumos a serem baixados automaticamente do estoque:</span>
                    </div>

                    {!selectedProduct.recipe || selectedProduct.recipe.items.length === 0 ? (
                      <p className="text-amber-700 font-medium italic">
                        ⚠️ Este produto não possui receita química definida. Defina a receita no menu Produtos antes de produzir.
                      </p>
                    ) : (
                      <ul className="space-y-1 pl-2">
                        {selectedProduct.recipe.items.map((item, i) => {
                          const totalNeeded = item.quantityRequired * Number(quantityToProduce || 0);
                          const hasEnough = item.supply.stockQuantity >= totalNeeded;

                          return (
                            <li key={i} className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-slate-700">• {item.supply.name}</span>
                              <span className={hasEnough ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>
                                Necessário: {totalNeeded} {item.supply.unit} | Disp: {item.supply.stockQuantity} {item.supply.unit}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}

                <div className="pt-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium border border-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !selectedProduct?.recipe || selectedProduct.recipe.items.length === 0}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-md disabled:opacity-50"
                  >
                    {submitting ? 'Fabricando...' : 'Confirmar & Baixar Insumos'}
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
