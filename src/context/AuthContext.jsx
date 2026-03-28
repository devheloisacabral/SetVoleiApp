import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { saveTokens, getAccessToken, clearTokens, getRefreshToken } from '../storage/tokenStorage';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const token = await getAccessToken();
        if (token) {
          const { data } = await api.get('/auth/me');
          setUser(data); 
        }
      } catch {
        await clearTokens();
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    await saveTokens(data.access_token, data.refresh_token);
    const { data: me } = await api.get('/auth/me');
    setUser(me); 
  }

  async function logout() {
    try {
      const refreshToken = await getRefreshToken();
      await api.post('/auth/logout', { refresh_token: refreshToken });
    } catch (err) {
      console.log('Logout error:', err?.response?.status, err?.response?.data);
    } finally {
      await clearTokens();
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
      role: user?.role ?? null, 
      isAdmin: user?.role === 'admin',
      isProfessor: user?.role === 'professor',
      isAtleta: user?.role === 'atleta',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
