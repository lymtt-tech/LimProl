import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'VENDEDOR' | 'ADMINISTRADOR' | 'GERENTE' | 'ROOT';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('limprol_token');
    const storedUser = localStorage.getItem('limprol_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('limprol_token');
        localStorage.removeItem('limprol_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('limprol_token', newToken);
    localStorage.setItem('limprol_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('limprol_token');
    localStorage.removeItem('limprol_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
