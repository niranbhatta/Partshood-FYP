import React, { createContext, useState, useEffect, useContext } from 'react';

// making a global bubble where we can store whoever is currently logged in
const AuthContext = createContext(null);

const API_BASE = 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // checking if they still have a token sitting in their browser from a previous visit
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // the moment the app loads, we take their stored token and ask the backend who they are
  useEffect(() => {
    const rehydrate = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data); // populating the global state with their name, role, etc
        } else {
          // the backend rejected the token (probably expired), so we silently log them out
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }

      setLoading(false);
    };

    rehydrate();
  }, [token]);

  // handling the form submission from the login page
  const login = async (email, password) => {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    // saving the new jwt token so they don't have to log in again tomorrow
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // basically the same as login but hitting the register endpoint instead
  const register = async (name, email, password, role, company, phone, address) => {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, company, phone, address }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    return data;
  };

  // literally just deleting the token from their browser so the API stops recognizing them
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// a nice little shorthand hook so we don't have to import the context manually everywhere
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
