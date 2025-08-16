import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const loadMe = async () => {
    if (localStorage.getItem('auth_token')) {
      try {
        const { data } = await api.get('/me');
        setUser(data);

        // THE FIX IS HERE: Check for profile completion using the new primary_citizen relationship.
        if (data && data.role === 'user' && !data.primary_citizen?.dob) {
          setShowProfileModal(true);
        }
      } catch {
        setUser(null);
        localStorage.removeItem('auth_token');
      }
    }
    setReady(true);
  };

  useEffect(() => { loadMe(); }, []);

  const login = async (credentials) => {
    const { data } = await api.post('/login', credentials);
    localStorage.setItem('auth_token', data.token);
    await loadMe();
  };

  const hideProfileModal = () => {
    setShowProfileModal(false);
  };

  const logout = async () => {
    try { await api.post('/logout'); } catch {}
    localStorage.removeItem('auth_token');
    setUser(null);
    setShowProfileModal(false);
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, loadMe, showProfileModal, hideProfileModal }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
