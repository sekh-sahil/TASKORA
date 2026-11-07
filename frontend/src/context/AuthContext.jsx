import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restoreError, setRestoreError] = useState("");
  const [restoreAttempt, setRestoreAttempt] = useState(0);

  const setUser = (nextUser) => {
    setUserState(nextUser);
    setRestoreError("");
    if (nextUser) {
      localStorage.setItem("taskora-user", JSON.stringify(nextUser));
    } else {
      localStorage.removeItem("taskora-user");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("taskora-token");
    let active = true;

    if (!token) {
      localStorage.removeItem("taskora-token");
      localStorage.removeItem("taskora-user");
      setLoading(false);
      return;
    }

    setLoading(true);
    api.get("/auth/me")
      .then(({ data }) => {
        if (active) setUser(data.user);
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.response?.status === 401) {
          localStorage.removeItem("taskora-token");
          localStorage.removeItem("taskora-user");
          setUserState(null);
          return;
        }
        setRestoreError("Unable to verify your session. Check your connection and try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [restoreAttempt]);

  const saveSession = ({ token, user: authenticatedUser }) => {
    if (!token || !authenticatedUser) {
      throw new Error("The server returned an invalid authentication response.");
    }
    localStorage.setItem("taskora-token", token);
    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    return saveSession(data);
  };

  const register = async (userData) => {
    const { data } = await api.post("/auth/register", userData);
    return saveSession(data);
  };

  const logout = () => {
    localStorage.removeItem("taskora-token");
    setUser(null);
  };

  const retryRestore = () => {
    setRestoreError("");
    setLoading(true);
    setRestoreAttempt((attempt) => attempt + 1);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        restoreError,
        retryRestore,
        login,
        register,
        logout,
        setUser,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
