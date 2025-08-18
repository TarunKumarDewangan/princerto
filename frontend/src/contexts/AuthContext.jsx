import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // New import
import api from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate(); // New hook for navigation

  const loadMe = async (redirectTo = null) => { // Accept the redirect path
    if (localStorage.getItem('auth_token')) {
      try {
        const { data } = await api.get('/me');
        setUser(data);

        if (data && data.role === 'user' && !data.primary_citizen?.dob) {
          setShowProfileModal(true);
        } else {
          setShowProfileModal(false);
        }

        // THE FIX IS HERE: After loading, perform the redirect.
        if (redirectTo) {
          navigate(redirectTo);
        } else {
          // Default redirect for normal logins
          navigate('/dashboard');
        }

      } catch {
        setUser(null);
        localStorage.removeItem('auth_token');
      }
    }
    setReady(true);
  };

  useEffect(() => {
    // On initial page load, we don't redirect, just check for existing session
    const checkSession = async () => {
      if (localStorage.getItem('auth_token')) {
        try {
          const { data } = await api.get('/me');
          setUser(data);
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
    checkSession();
  }, []);

  const login = async (credentials, redirectTo = null) => {
    const { data } = await api.post('/login', credentials);
    localStorage.setItem('auth_token', data.token);

    // After logging in, immediately fetch user data AND pass the redirect path
    await loadMe(redirectTo);
  };

  const hideProfileModal = () => setShowProfileModal(false);

  const logout = async () => {
    try { await api.post('/logout'); } catch {}
    localStorage.removeItem('auth_token');
    setUser(null);
    setShowProfileModal(false);
    toast.success('Logged out');
    navigate('/'); // Redirect to homepage on logout
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
