import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('nexus_token');
    const savedUser = localStorage.getItem('nexus_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Error al parsear usuario guardado:', err);
        localStorage.removeItem('nexus_token');
        localStorage.removeItem('nexus_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    if (data.token) {
      const u = data.usuario || {};
      const userData = {
        id: u.id ?? data.id,
        username: u.username || data.username || username,
        email: u.email || data.email || `${username}@nexuslogix.pe`,
        nombre: u.nombre || data.nombre || username,
        apellido: u.apellido || data.apellido || '',
        rol: u.rol || data.rol || data.role || (username.toLowerCase().includes('admin') ? 'ROLE_ADMINISTRADOR' : 'OPERADOR'),
        role: u.rol || data.rol || data.role || (username.toLowerCase().includes('admin') ? 'ROLE_ADMINISTRADOR' : 'OPERADOR'),
        area: u.area || data.area || 'Logística',
        estado: u.estado || 'ACTIVO',
      };

      setToken(data.token);
      setUser(userData);

      localStorage.setItem('nexus_token', data.token);
      localStorage.setItem('nexus_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    return { success: false, mensaje: data.mensaje || 'Error en autenticación' };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
  };

  const updateUser = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('nexus_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
