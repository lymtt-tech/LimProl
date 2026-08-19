import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Shield, Sparkles, Lock, Mail, Eye, EyeOff, Terminal, UserCheck, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      login(token, user);

      // Redireciona para o menu unificado do sistema
      if (user.role === 'ROOT') {
        navigate('/audit');
      } else if (user.role === 'ADMINISTRADOR' || user.role === 'GERENTE') {
        navigate('/supplies');
      } else {
        navigate('/sales');
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Erro de conexão com o servidor. Verifique se o backend está online.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillTestAccount = (userEmail: string, pass: string) => {
    setEmail(userEmail);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center px-4 py-12">
      {/* Cartão de Login Modo Claro Neutro */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
        
        {/* Header da Marca */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 mb-4 shadow-sm">
            <Sparkles className="w-8 h-8 text-slate-700" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Lim<span className="text-slate-600">Prol</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Sistema Integrado de Gestão Industrial e Vendas
          </p>
        </div>

        {/* Alerta de Erro */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulário de Login */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              E-mail de Acesso
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@limprol.com.br"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-slate-800 focus:ring-offset-2 transition disabled:opacity-50 flex justify-center items-center space-x-2"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Entrar na Plataforma</span>
                <UserCheck className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Atalhos Rápidos para Teste */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-3 flex items-center justify-center space-x-1.5">
            <Terminal className="w-4 h-4 text-slate-600" />
            <span>Preenchimento Rápido para Testes</span>
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillTestAccount('root@limprol.com.br', 'root123')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-medium rounded-lg transition flex items-center space-x-1.5 justify-center"
            >
              <Shield className="w-3.5 h-3.5 text-slate-700" />
              <span>ROOT (T.I)</span>
            </button>

            <button
              type="button"
              onClick={() => fillTestAccount('gerente@limprol.com.br', '123456')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-medium rounded-lg transition flex items-center space-x-1.5 justify-center"
            >
              <span>GERENTE</span>
            </button>

            <button
              type="button"
              onClick={() => fillTestAccount('admin@limprol.com.br', '123456')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-medium rounded-lg transition flex items-center space-x-1.5 justify-center"
            >
              <span>ADMINISTRADOR</span>
            </button>

            <button
              type="button"
              onClick={() => fillTestAccount('vendedor@limprol.com.br', '123456')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-medium rounded-lg transition flex items-center space-x-1.5 justify-center"
            >
              <span>VENDEDOR</span>
            </button>
          </div>
        </div>

      </div>

      <footer className="mt-8 text-center text-xs text-slate-500">
        LimProl Enterprise System v1.0.0 &bull; Sistema Industrial Unificado
      </footer>
    </div>
  );
};
