import {
    createContext,
    useEffect,
    useState,
} from "react";

import type { ReactNode } from "react";


import api from "../services/api";
import { removeToken } from "../services/storage";
import type { User, AuthContextType } from "../types/auth";

export const AuthContext = createContext<AuthContextType | null>(null);

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  async function loadUser() {
    try {
      const response = await api.get<User>("/users/me");

      setUser(response.data);
    } catch {
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function login() {
    await loadUser();
  }

  function logout() {
    removeToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}