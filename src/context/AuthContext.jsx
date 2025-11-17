import React, { createContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// ✅ Usar variables de entorno en lugar de window.firebaseConfig
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 1. CREAR el Context
export const AuthContext = createContext();

// 2. CREAR el Provider (el componente que "envuelve" toda la app)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 3. ESCUCHAR cambios de autenticación
  useEffect(() => {
    // onAuthStateChanged detecta cuando el usuario se loguea o desloguea
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // null si no está logueado, objeto del usuario si lo está
      setLoading(false);
    });

    // Limpiar el listener cuando el componente se desmonte
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};