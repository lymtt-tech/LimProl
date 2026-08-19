import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Calendar,
  Tag,
  Truck,
  DollarSign,
  LogOut,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  FlaskConical
} from 'lucide-react';

interface Supply {
  id: string;
  name: string;
  unit: string;
  stockQuantity: number;
  minStock: number;
  costPerUnit: number;
  batchNumber?: string;
  supplier?: string;
  purchaseDate?: string;
  expirationDate?: string;
  createdAt: string;
}

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'expiring'>('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingSupplyId, setEditingSupplyId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('L');
  const [stockQuantity, setStockQuantity] = useState<number | string>(0);
  const [minStock, setMinStock] = useState<number | string>(10);
  const [costPerUnit, setCostPerUnit] = useState<number | string>(0);
  const [batchNumber, setBatchNumber] = useState('');
  const [supplier, setSupplier] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchSupplies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/supplies');
      setSupplies(res.data || []);
    } catch (err) {
      console.error('Erro ao buscar insumos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplies();
  }, []);

  const openCreateModal = () => {
    setEditingSupplyId(null);
    setName('');
    setUnit('L');
    setStockQuantity(0);
    setMinStock(10);
    setCostPerUnit(0);
    setBatchNumber('');
    setSupplier('');
    setPurchaseDate('');
    setExpirationDate('');
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (supply: Supply) => {
    setEditingSupplyId(supply.id);
    setName(supply.name);
    setUnit(supply.unit);
    setStockQuantity(supply.stockQuantity);
    setMinStock(supply.minStock);
    setCostPerUnit(supply.costPerUnit);
    setBatchNumber(supply.batchNumber || '');
    setSupplier(supply.supplier || '');
    setPurchaseDate(supply.purchaseDate ? supply.purchaseDate.split('T')[0] : '');
    setExpirationDate(supply.expirationDate ? supply.expirationDate.split('T')[0] : '');
    setFormError(null);
    setShowModal(true);
  };

  const handleSaveSupply = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payload = {
      name,
      unit,
      stockQuantity: Number(stockQuantity),
      minStock: Number(minStock),
      costPerUnit: Number(costPerUnit),
      batchNumber: batchNumber || null,
      supplier: supplier || null,
      purchaseDate: purchaseDate || null,
      expirationDate: expirationDate || null,
    };

    try {
      if (editingSupplyId) {
        await api.put(`/supplies/${editingSupplyId}`, payload);
      } else {
        await api.post('/supplies', payload);
      }

      setShowModal(false);
      fetchSupplies();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Erro ao salvar matéria-prima.');
    }
  };

  const handleDeleteSupply = async (id: string, supplyName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a matéria-prima "${supplyName}"?`)) return;

    try {
      await api.delete(`/supplies/${id}`);
      fetchSupplies();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir matéria-prima.');
    }
  };

  const getExpirationStatus = (expDateStr?: string) => {
    if (!expDateStr) return { label: 'Sem Data', color: 'text-slate-600 bg-slate-100 border-slate-300' };
    const expDate = new Date(expDateStr);
    const today = new Date();
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 0) {
      return { label: 'VENCIDO', color: 'text-red-700 bg-red-50 border-red-200' };
    }
    if (diffDays <= 90) {
      return { label: `Vence em ${diffDays} dias`, color: 'text-amber-800 bg-amber-50 border-amber-200' };
    }
    return { label: 'Válido', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
  };

  const filteredSupplies = supplies.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.batchNumber && s.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.supplier && s.supplier.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'low') {
      return s.stockQuantity <= s.minStock;
    }
    if (statusFilter === 'expiring') {
      if (!s.expirationDate) return false;
      const expDate = new Date(s.expirationDate);
      const today = new Date();
      const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return diffDays <= 90;
    }

    return true;
  });

  const totalStockValue = supplies.reduce((acc, item) => acc + item.stockQuantity * item.costPerUnit, 0);
  const lowStockCount = supplies.filter((s) => s.stockQuantity <= s.minStock).length;
  const expiringCount = supplies.filter((s) => {
    if (!s.expirationDate) return false;
    const expDate = new Date(s.expirationDate);
    const today = new Date();
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return diffDays <= 90;
  }).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Topbar Modo Claro Neutro */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shadow-sm">
            <FlaskConical className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">LimProl - Gestão de Matérias-Primas</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 border border-slate-300 text-slate-700">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500">Controle Sanitário, Lotes, Validades e Compras de Insumos</p>
          </div>
        </div>

        {/* Perfil & Logout */}
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
          </div>

          <button
            onClick={logout}
            title="Sair do Sistema"
            className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-xl transition border border-slate-200"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Cards de Métricas Claro Neutro */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total de Insumos</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{supplies.length}</h3>
              <p className="text-[11px] text-slate-500 mt-1">Matérias-Primas Cadastradas</p>
            </div>
            <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-700">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Estoque Crítico</p>
              <h3 className="text-2xl font-extrabold text-amber-700 mt-1">{lowStockCount}</h3>
              <p className="text-[11px] text-slate-500 mt-1">Abaixo do limite mínimo</p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Validade Próxima</p>
              <h3 className="text-2xl font-extrabold text-red-700 mt-1">{expiringCount}</h3>
              <p className="text-[11px] text-slate-500 mt-1">Vencimento nos próximos 90 dias</p>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Valor em Estoque</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                R$ {totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Investimento acumulado</p>
            </div>
            <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-700">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Action Bar Claro */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar por nome, lote ou fornecedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-slate-800"
            >
              <option value="all">Todos os Insumos</option>
              <option value="low">Apenas Estoque Baixo</option>
              <option value="expiring">Apenas Validade Próxima</option>
            </select>

            <button
              onClick={fetchSupplies}
              className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl text-xs transition"
              title="Atualizar Tabela"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <button
            onClick={openCreateModal}
            className="w-full md:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Matéria-Prima</span>
          </button>
        </div>

        {/* Tabela de Insumos Claro Neutro */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <FlaskConical className="w-5 h-5 text-slate-700" />
              <span>Inventário de Matérias-Primas & Controle de Lote</span>
            </h2>
            <span className="text-xs text-slate-500">Exibindo {filteredSupplies.length} registros</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 flex flex-col items-center space-y-3">
              <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
              <span>Carregando inventário...</span>
            </div>
          ) : filteredSupplies.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-semibold text-slate-700 text-sm">Nenhuma matéria-prima cadastrada no momento.</p>
              <p className="text-xs text-slate-500 mt-1">O banco de dados está limpo para inserção de dados reais. Clique no botão acima para adicionar a primeira matéria-prima.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Matéria-Prima & Lote</th>
                    <th className="px-4 py-3">Fornecedor</th>
                    <th className="px-4 py-3">Data de Compra</th>
                    <th className="px-4 py-3">Validade</th>
                    <th className="px-4 py-3 text-right">Estoque / Min</th>
                    <th className="px-4 py-3 text-right">Custo Unid</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredSupplies.map((s) => {
                    const expStatus = getExpirationStatus(s.expirationDate);
                    const isLowStock = s.stockQuantity <= s.minStock;

                    return (
                      <tr key={s.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="text-[11px] font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 flex items-center space-x-1">
                              <Tag className="w-3 h-3 text-slate-500" />
                              <span>Lote: {s.batchNumber || 'N/A'}</span>
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          <div className="flex items-center space-x-1.5">
                            <Truck className="w-3.5 h-3.5 text-slate-400" />
                            <span>{s.supplier || 'Não Informado'}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-slate-600 font-mono">
                          {s.purchaseDate ? new Date(s.purchaseDate).toLocaleDateString('pt-BR') : '-'}
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-mono text-slate-700">
                            {s.expirationDate ? new Date(s.expirationDate).toLocaleDateString('pt-BR') : '-'}
                          </div>
                          <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold border ${expStatus.color}`}>
                            {expStatus.label}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className={`font-bold font-mono text-sm ${isLowStock ? 'text-amber-700' : 'text-slate-900'}`}>
                            {s.stockQuantity} {s.unit}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">Mínimo: {s.minStock} {s.unit}</div>
                        </td>

                        <td className="px-4 py-3 text-right font-mono text-slate-700">
                          R$ {s.costPerUnit.toFixed(2)}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {isLowStock ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Estoque Baixo</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Normal</span>
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => openEditModal(s)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition border border-slate-200"
                              title="Editar Insumo"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {(user?.role === 'GERENTE' || user?.role === 'ROOT') && (
                              <button
                                onClick={() => handleDeleteSupply(s.id, s.name)}
                                className="p-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 rounded-lg transition border border-slate-200"
                                title="Excluir Insumo"
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
      </main>

      {/* MODAL DE CADASTRO E EDIÇÃO Claro Neutro */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <FlaskConical className="w-5 h-5 text-slate-700" />
                <span>{editingSupplyId ? 'Editar Matéria-Prima' : 'Cadastrar Nova Matéria-Prima'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveSupply} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome da Matéria-Prima *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Lauril Éter Sulfato de Sódio 27%"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Número de Lote (ANVISA/Fabricante)</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="Ex: LT-2026-089A"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fornecedor / Distribuidor</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="Ex: Química do Brasil Ltda"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Data de Compra / Entrada</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Data de Validade *</label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Unidade *</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                  >
                    <option value="L">Litros (L)</option>
                    <option value="Kg">Quilos (Kg)</option>
                    <option value="Unid">Unidade (Unid)</option>
                    <option value="Galão 20L">Galão (20L)</option>
                    <option value="Tambor 200L">Tambor (200L)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Estoque Inicial</label>
                  <input
                    type="number"
                    step="0.01"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Estoque Mínimo</label>
                  <input
                    type="number"
                    step="0.01"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Custo Unitário (R$ por Unidade)</label>
                <input
                  type="number"
                  step="0.01"
                  value={costPerUnit}
                  onChange={(e) => setCostPerUnit(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                />
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
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-md"
                >
                  {editingSupplyId ? 'Salvar Alterações' : 'Cadastrar Insumo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
