import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { SidebarLayout } from './components/SidebarLayout';
import { AdminDashboard as SuppliesPage } from './pages/AdminDashboard';
import { ProductsPage } from './pages/ProductsPage';
import { ProductionPage } from './pages/ProductionPage';
import { SalesPage } from './pages/SalesPage';
import { RootDashboard as AuditAndUsersPage } from './pages/RootDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirecionamento inteligente se o usuário tentar acessar rota sem permissão
    return <Navigate to="/supplies" replace />;
  }

  return <SidebarLayout>{children}</SidebarLayout>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Rota 1: Matérias-Primas / Insumos */}
          <Route
            path="/supplies"
            element={
              <ProtectedRoute allowedRoles={['VENDEDOR', 'ADMINISTRADOR', 'GERENTE', 'ROOT']}>
                <SuppliesPage />
              </ProtectedRoute>
            }
          />

          {/* Rota 2: Produtos & Fórmulas */}
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={['VENDEDOR', 'ADMINISTRADOR', 'GERENTE', 'ROOT']}>
                <ProductsPage />
              </ProtectedRoute>
            }
          />

          {/* Rota 3: Fabricação / Ordens de Produção */}
          <Route
            path="/production"
            element={
              <ProtectedRoute allowedRoles={['GERENTE', 'ROOT']}>
                <ProductionPage />
              </ProtectedRoute>
            }
          />

          {/* Rota 4: Vendas & Pedidos */}
          <Route
            path="/sales"
            element={
              <ProtectedRoute allowedRoles={['VENDEDOR', 'ADMINISTRADOR', 'GERENTE', 'ROOT']}>
                <SalesPage />
              </ProtectedRoute>
            }
          />

          {/* Rota 5: Logs de Auditoria (ROOT) */}
          <Route
            path="/audit"
            element={
              <ProtectedRoute allowedRoles={['GERENTE', 'ROOT']}>
                <AuditAndUsersPage />
              </ProtectedRoute>
            }
          />

          {/* Rota 6: Usuários do Sistema */}
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['GERENTE', 'ROOT']}>
                <AuditAndUsersPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/supplies" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
