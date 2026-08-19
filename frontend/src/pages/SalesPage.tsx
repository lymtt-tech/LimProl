import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  ShoppingBag,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  DollarSign,
  Trash2
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  unit: string;
  price: number;
  stockQuantity: number;
}

interface SaleItem {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: {
    name: string;
    unit: string;
  };
}

interface Sale {
  id: string;
  totalAmount: number;
  customerName?: string;
  createdAt: string;
  seller: {
    name: string;
    role: string;
  };
  items: SaleItem[];
}

export const SalesPage: React.FC = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Lançar Venda
  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [cartItems, setCartItems] = useState<Array<{ productId: string; quantity: number }>>([]);
  const [modalError, setModalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salesRes, prodRes] = await Promise.all([
        api.get('/sales'),
        api.get('/products'),
      ]);
      setSales(salesRes.data || []);
      setProducts(prodRes.data || []);
    } catch (err) {
      console.error('Erro ao carregar vendas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openNewSaleModal = () => {
    setCustomerName('');
    if (products.length > 0) {
      setCartItems([{ productId: products[0].id, quantity: 1 }]);
    } else {
      setCartItems([]);
    }
    setModalError(null);
    setShowModal(true);
  };

  const addCartRow = () => {
    if (products.length === 0) return;
    setCartItems([...cartItems, { productId: products[0].id, quantity: 1 }]);
  };

  const removeCartRow = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => {
      const prod = products.find((p) => p.id === item.productId);
      return acc + (prod ? prod.price * (item.quantity || 0) : 0);
    }, 0);
  };

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);

    try {
      await api.post('/sales', {
        customerName: customerName || 'Cliente Balcão',
        items: cartItems.map((ci) => ({
          productId: ci.productId,
          quantity: Number(ci.quantity),
        })),
      });

      setShowModal(false);
      fetchData();
    } catch (err: any) {
      if (err.response && err.response.data) {
        const msg = err.response.data.message;
        const details = err.response.data.details;
        setModalError(details ? `${msg} -> ${details.join(' | ')}` : msg);
      } else {
        setModalError('Erro de conexão ao registrar venda.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <ShoppingBag className="w-7 h-7 text-slate-800" />
            <span>Vendas & Pedidos de Produtos de Limpeza</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Lançamento de vendas com baixa imediata no estoque de produtos acabados.
          </p>
        </div>

        <button
          onClick={openNewSaleModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Lançar Nova Venda</span>
        </button>
      </div>

      {/* Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <span className="text-xs text-slate-500 font-semibold">Histórico de Pedidos de Venda</span>
        <button
          onClick={fetchData}
          className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl text-xs transition"
          title="Atualizar Dados"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Histórico de Vendas */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-slate-500 flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
            <span>Carregando histórico de vendas...</span>
          </div>
        ) : sales.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-semibold text-slate-700 text-sm">Nenhuma venda registrada ainda.</p>
            <p className="text-xs text-slate-500 mt-1">Cadastre produtos e execute a fabricação antes de realizar a primeira venda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => (
              <div
                key={sale.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">
                      Pedido #{sale.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Concluído
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Cliente: <strong>{sale.customerName || 'Cliente Balcão'}</strong></span>
                    </span>
                    <span>&bull;</span>
                    <span>Vendedor: <strong>{sale.seller.name}</strong> ({sale.seller.role})</span>
                    <span>&bull;</span>
                    <span className="font-mono text-slate-500">{new Date(sale.createdAt).toLocaleString('pt-BR')}</span>
                  </div>
                </div>

                {/* Itens do Pedido */}
                <div className="flex-1 max-w-md bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                  <div className="font-semibold text-slate-700 mb-1 text-[11px]">Itens do Pedido:</div>
                  <ul className="space-y-0.5 text-slate-600 font-mono text-[11px]">
                    {sale.items.map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <span>• {item.product.name} ({item.quantity} un)</span>
                        <span className="font-bold">R$ {item.subtotal.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Valor Total */}
                <div className="text-right flex-shrink-0">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Valor Total</div>
                  <div className="text-lg font-extrabold text-slate-900 font-mono">
                    R$ {sale.totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Lançar Venda */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-slate-700" />
                <span>Lançar Nova Venda</span>
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
                Nenhum produto cadastrado no sistema. Cadastre produtos no menu de Produtos antes de realizar vendas.
              </div>
            ) : (
              <form onSubmit={handleCreateSale} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nome do Cliente</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: Mercado São José (opcional)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-700 font-semibold">Produtos Vendidos:</label>
                    <button
                      type="button"
                      onClick={addCartRow}
                      className="text-xs text-slate-800 font-bold hover:underline"
                    >
                      + Adicionar Item
                    </button>
                  </div>

                  {cartItems.map((ci, index) => {
                    const prod = products.find((p) => p.id === ci.productId);

                    return (
                      <div key={index} className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <select
                          value={ci.productId}
                          onChange={(e) => {
                            const updated = [...cartItems];
                            updated[index].productId = e.target.value;
                            setCartItems(updated);
                          }}
                          className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-slate-800"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (R$ {p.price.toFixed(2)} | Disp: {p.stockQuantity} un)
                            </option>
                          ))}
                        </select>

                        <input
                          type="number"
                          min="1"
                          value={ci.quantity}
                          onChange={(e) => {
                            const updated = [...cartItems];
                            updated[index].quantity = Number(e.target.value);
                            setCartItems(updated);
                          }}
                          className="w-20 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-right"
                        />

                        {cartItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCartRow(index)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between border border-slate-200">
                  <span className="font-semibold text-slate-700">Total da Venda:</span>
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    R$ {calculateTotal().toFixed(2)}
                  </span>
                </div>

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
                    disabled={submitting || cartItems.length === 0}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-md disabled:opacity-50"
                  >
                    {submitting ? 'Finalizando...' : 'Finalizar Venda & Baixar Estoque'}
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
