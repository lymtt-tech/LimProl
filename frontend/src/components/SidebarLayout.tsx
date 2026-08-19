import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  FlaskConical,
  Package,
  Factory,
  ShoppingBag,
  Activity,
  Users,
  LogOut,
  Sparkles,
  Server,
  CheckCircle,
  XCircle,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await api.get('/');
        setServerStatus('online');
      } catch {
        setServerStatus('offline');
      }
    };
    checkHealth();
  }, []);

  const navItems = [
    {
      label: 'Matérias-Primas / Insumos',
      path: '/supplies',
      icon: FlaskConical,
      allowedRoles: ['VENDEDOR', 'ADMINISTRADOR', 'GERENTE', 'ROOT'],
    },
    {
      label: 'Produtos de Limpeza & Fórmulas',
      path: '/products',
      icon: Package,
      allowedRoles: ['VENDEDOR', 'ADMINISTRADOR', 'GERENTE', 'ROOT'],
    },
    {
      label: 'Fabricação / Produção',
      path: '/production',
      icon: Factory,
      allowedRoles: ['GERENTE', 'ROOT'],
    },
    {
      label: 'Vendas & Pedidos',
      path: '/sales',
      icon: ShoppingBag,
      allowedRoles: ['VENDEDOR', 'ADMINISTRADOR', 'GERENTE', 'ROOT'],
    },
    {
      label: 'Logs de Auditoria (ROOT)',
      path: '/audit',
      icon: Activity,
      allowedRoles: ['GERENTE', 'ROOT'],
    },
    {
      label: 'Usuários do Sistema',
      path: '/users',
      icon: Users,
      allowedRoles: ['GERENTE', 'ROOT'],
    },
  ];

  // Filtrar os itens de menu permitidos para a role do usuário logado
  const filteredNavItems = navItems.filter((item) => user && item.allowedRoles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 min-h-screen sticky top-0 z-40 shadow-sm justify-between p-4">
        <div className="space-y-6">
          {/* Logo & Marca */}
          <div className="flex items-center space-x-3 px-2 py-1">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shadow-sm">
              <Sparkles className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Lim<span className="text-slate-600">Prol</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Fábrica de Limpeza</p>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <div className="font-bold text-slate-900 truncate">{user?.name}</div>
            <div className="text-slate-500 truncate font-mono text-[11px]">{user?.email}</div>
            <div className="pt-1 flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-300 text-slate-700">
                {user?.role}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Módulos Industriais
            </div>
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar & Logout */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-2">
            <div className="flex items-center space-x-1.5">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span>Backend API</span>
            </div>
            {serverStatus === 'online' ? (
              <span className="text-emerald-700 font-bold flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>Online</span>
              </span>
            ) : (
              <span className="text-red-600 font-bold flex items-center space-x-1">
                <XCircle className="w-3 h-3" />
                <span>Offline</span>
              </span>
            )}
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 font-medium text-xs rounded-xl border border-slate-200 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta</span>
          </button>
        </div>
      </aside>

      {/* Header Mobile */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-slate-900 text-lg">LimProl</span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Menu Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-50 text-red-600 font-medium text-xs rounded-xl mt-4"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      )}

      {/* Main View Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};
