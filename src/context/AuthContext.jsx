import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../api';
import { tokenStore } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(tokenStore.get()));

  // Restore the session from a saved token.
  useEffect(() => {
    if (!tokenStore.get()) return;
    api
      .getMe()
      .then(({ user }) => setUser(user))
      .catch(() => tokenStore.clear())
      .finally(() => setChecking(false));
  }, []);

  const startSession = ({ token, user }) => {
    tokenStore.set(token);
    setUser(user);
  };

  const login = async (credentials) => startSession(await api.login(credentials));
  const signup = async (data) => startSession(await api.register(data));
  const logout = () => {
    tokenStore.clear();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, checking, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
