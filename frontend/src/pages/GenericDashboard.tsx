import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Sparkles, ShoppingBag, Package, Factory, Shield } from 'lucide-react';

export const GenericDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Header Claro */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shadow-sm">
            <Sparkles className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">LimProl - Painel de Controle</h1>
            <p className="text-xs text-slate-500">Sistema de Estoque, Fabricação & Venda</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
              Perfil: {user?.role}
            </span>
          </div>

          <button
            onClick={logout}
            className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-xl transition border border-slate-200"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6 flex flex-col justify-center items-center text-center">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 max-w-xl w-full shadow-sm space-y-6">
          <div className="inline-flex p-4 rounded-2xl bg-slate-100 text-slate-800 border border-slate-200">
            {user?.role === 'VENDEDOR' && <ShoppingBag className="w-10 h-10" />}
            {user?.role === 'ADMINISTRADOR' && <Package className="w-10 h-10" />}
            {user?.role === 'GERENTE' && <Factory className="w-10 h-10" />}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">Bem-vindo, {user?.name}!</h2>
            <p className="text-sm text-slate-500 mt-2">
              Seu perfil de acesso é <strong className="text-slate-800">{user?.role}</strong>. Você está autenticado no sistema LimProl.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left space-y-2">
            <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-slate-700" />
              <span>Nível de Permissões no Sistema:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              {user?.role === 'VENDEDOR' && (
                <>
                  <li>Acesso para registrar vendas de produtos de limpeza.</li>
                  <li>Consulta de catálogo e disponibilidade em estoque.</li>
                </>
              )}
              {user?.role === 'ADMINISTRADOR' && (
                <>
                  <li>Cadastro e gestão de matérias-primas/insumos.</li>
                  <li>Cadastro e ajuste de preços/estoque de produtos.</li>
                </>
              )}
              {user?.role === 'GERENTE' && (
                <>
                  <li>Gestão de fórmulas e ordens de fabricação.</li>
                  <li>Gerenciamento de usuários e relatórios.</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};
