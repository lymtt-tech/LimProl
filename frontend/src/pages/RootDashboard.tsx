import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  Activity, 
  Users, 
  LogOut, 
  RefreshCw, 
  UserPlus, 
  Trash2, 
  Clock, 
  Terminal, 
  Server, 
  CheckCircle,
  XCircle
} from 'lucide-react';

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export const RootDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'audit' | 'users'>('audit');
  
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  // Form para novo usuário
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'VENDEDOR' | 'ADMINISTRADOR' | 'GERENTE' | 'ROOT'>('VENDEDOR');
  const [userModalError, setUserModalError] = useState<string | null>(null);

  const checkServerHealth = async () => {
    try {
      setServerStatus('checking');
      await api.get('/');
      setServerStatus('online');
    } catch {
      setServerStatus('offline');
    }
  };

  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const response = await api.get('/audit');
      setAuditLogs(response.data.logs || []);
    } catch (err) {
      console.error('Erro ao buscar audit logs:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await api.get('/users');
      setUsersList(response.data || []);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    checkServerHealth();
    fetchAuditLogs();
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserModalError(null);

    try {
      await api.post('/users', {
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
      });

      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('VENDEDOR');

      fetchUsers();
      fetchAuditLogs();
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setUserModalError(err.response.data.message);
      } else {
        setUserModalError('Erro ao criar usuário.');
      }
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário "${name}"?`)) return;

    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
      fetchAuditLogs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir usuário');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Topbar / Header Modo Claro Neutro */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shadow-sm">
            <ShieldCheck className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">LimProl - Developer Console</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 border border-slate-300 text-slate-700">
                Nível ROOT (T.I)
              </span>
            </div>
            <p className="text-xs text-slate-500">Acesso Total & Rastreabilidade do Sistema</p>
          </div>
        </div>

        {/* Status da API & Perfil */}
        <div className="flex items-center space-x-6">
          <div className="hidden sm:flex items-center space-x-2 text-xs px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
            <Server className="w-4 h-4 text-slate-500" />
            <span className="text-slate-600">API Backend:</span>
            {serverStatus === 'online' && (
              <span className="text-emerald-700 flex items-center space-x-1 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Online (Porta 3000)</span>
              </span>
            )}
            {serverStatus === 'offline' && (
              <span className="text-red-600 flex items-center space-x-1 font-semibold">
                <XCircle className="w-3.5 h-3.5" />
                <span>Offline</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
            <div className="text-right hidden md:block">
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
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Navigation Tabs Claro Neutro */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex space-x-3">
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm transition ${
                activeTab === 'audit'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Logs de Auditoria & Rastreabilidade</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm transition ${
                activeTab === 'users'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Gestão Global de Usuários ({usersList.length})</span>
            </button>
          </div>

          <button
            onClick={() => {
              fetchAuditLogs();
              fetchUsers();
              checkServerHealth();
            }}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingAudit || loadingUsers ? 'animate-spin' : ''}`} />
            <span>Atualizar Dados</span>
          </button>
        </div>

        {/* TAB 1: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <Terminal className="w-5 h-5 text-slate-700" />
                    <span>Registro Rastreável de Operações (Audit Logs)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rastreie em tempo real ações de login, criação de produtos, baixas de estoque, ordens de produção e vendas.
                  </p>
                </div>
                <span className="text-xs font-mono bg-slate-100 border border-slate-300 text-slate-700 px-3 py-1 rounded-full font-semibold">
                  {auditLogs.length} Registros Encontrados
                </span>
              </div>

              {loadingAudit ? (
                <div className="py-12 text-center text-slate-500 flex flex-col items-center space-y-3">
                  <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
                  <span>Carregando dados de auditoria...</span>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                  Nenhum registro de auditoria encontrado.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Horário</th>
                        <th className="px-4 py-3">Usuário</th>
                        <th className="px-4 py-3">Função (Role)</th>
                        <th className="px-4 py-3">Ação</th>
                        <th className="px-4 py-3">Entidade</th>
                        <th className="px-4 py-3">IP</th>
                        <th className="px-4 py-3">Detalhes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white font-mono">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3 whitespace-nowrap text-slate-500 flex items-center space-x-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{new Date(log.createdAt).toLocaleString('pt-BR')}</span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{log.userName || 'Sistema'}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                              {log.userRole}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900">{log.action}</td>
                          <td className="px-4 py-3 text-slate-600">{log.entity}</td>
                          <td className="px-4 py-3 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                          <td className="px-4 py-3 text-slate-700 max-w-md truncate" title={log.details || ''}>
                            {log.details || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: GESTÃO DE USUÁRIOS */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <Users className="w-5 h-5 text-slate-700" />
                    <span>Controle de Usuários & Níveis de Acesso</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Como ROOT, você tem permissão exclusiva para criar, gerenciar e excluir qualquer conta de usuário no sistema.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl shadow-md transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Cadastrar Novo Usuário</span>
                </button>
              </div>

              {loadingUsers ? (
                <div className="py-12 text-center text-slate-500 flex flex-col items-center space-y-3">
                  <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
                  <span>Carregando usuários...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {usersList.map((u) => (
                    <div
                      key={u.id}
                      className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-slate-300 shadow-sm transition"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-bold text-slate-900 text-base">{u.name}</h3>
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 border border-slate-300 text-slate-800">
                            {u.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-mono">{u.email}</p>
                        <p className="text-[11px] text-slate-400">
                          Cadastrado em: {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                        {u.id !== user?.id ? (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Excluir</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Sua conta atual</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal para Cadastro de Usuário */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-slate-700" />
                <span>Novo Usuário (Nível ROOT)</span>
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {userModalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {userModalError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Ex: Roberto Silva"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="roberto@limprol.com.br"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Senha Inicial</label>
                <input
                  type="password"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nível de Acesso (Role)</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-slate-800"
                >
                  <option value="VENDEDOR">VENDEDOR (Baixo - Vendas e Catálogo)</option>
                  <option value="ADMINISTRADOR">ADMINISTRADOR (Médio - Produtos e Insumos)</option>
                  <option value="GERENTE">GERENTE (Alto - Usuários e Produção)</option>
                  <option value="ROOT">ROOT (Desenvolvedor T.I - Acesso Total)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-md"
                >
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
