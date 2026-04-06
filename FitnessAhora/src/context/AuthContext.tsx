import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { isAxiosError } from "axios";

interface User {
  id: string;
  nombre: string;
  email: string;
  objetivo: string;
  somatotipo: string;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // Exponemos setUser para actualizar el perfil
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  // Efecto para verificar si ya hay una sesión iniciada al cargar la app
  useEffect(() => {
    const loadStoredUser = () => {
      const token = localStorage.getItem("fitness_token");
      const savedUser = localStorage.getItem("fitness_user");

      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
    };

    loadStoredUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Petición real al backend de Node.js
      const response = await api.post("/login", { email, password });

      const { user: userData, token } = response.data;

      // Guardamos el usuario en el estado
      setUser(userData);

      // Guardamos el token y los datos del usuario para persistencia
      localStorage.setItem("fitness_token", token);
      localStorage.setItem("fitness_user", JSON.stringify(userData));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } catch (error) {
      console.error("Error en la autenticación:", error);
      throw new Error("Credenciales incorrectas");
    }
  };

  const register = async (nombre: string, email: string, password: string) => {
    try {
      const response = await api.post("/register", { nombre, email, password });
      const { user: userData, token } = response.data;

      setUser(userData);
      localStorage.setItem("fitness_token", token);
      localStorage.setItem("fitness_user", JSON.stringify(userData));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(
          error.response?.data?.mensaje || "Error al crear la cuenta",
        );
      }
      throw new Error("Error al crear la cuenta");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("fitness_token");
    localStorage.removeItem("fitness_user"); // Limpiamos la info del usuario al salir
    delete api.defaults.headers.common["Authorization"]; // Limpiamos el header al salir
  };

  return (
    // Agregamos 'setUser' aquí para que esté disponible en toda la app
    <AuthContext.Provider value={{ user, setUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};
