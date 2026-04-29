import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState<{ id: number, name: string, email: string, role: string, plan: string } | null>(() => {
    const storedUser = localStorage.getItem('voosimples_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('voosimples_token'));

  const login = (userData: any, token: string) => {
    localStorage.setItem('voosimples_token', token);
    localStorage.setItem('voosimples_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('voosimples_token');
    localStorage.removeItem('voosimples_user');
    setUser(null);
  };

  return { user, login, logout, token: localStorage.getItem('voosimples_token') };
}
