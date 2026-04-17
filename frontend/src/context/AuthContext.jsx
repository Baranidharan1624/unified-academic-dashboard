import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../features/auth/AuthService";

const AuthContext = createContext(null);
const LOGOUT_REASON_KEY = "logoutReason";
const STATUS_POLL_INTERVAL_MS = 10000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    try {
      setUser(storedUser ? JSON.parse(storedUser) : null);
    } catch {
      localStorage.removeItem("user");
      setUser(null);
    }
    setLoading(false);
  }, []);

  /**
   * Login user with email and password
   */
  const login = useCallback(async (email, password) => {
    const normalizedEmail = (email || "").trim().toLowerCase();
    const data = await authService.login(normalizedEmail, password);
    
    const userData = {
      id: data.userId,
      email: data.email,
      role: data.role,
      name: data.fullName ?? data.name,
    };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    
    return userData;
  }, []);

  /**
   * Register a new user
   */
  const register = useCallback(async (userData) => {
    try {
      const data = await authService.register(userData);
      
      const user = {
        id: data.userId,
        email: data.email,
        role: data.role,
        name: data.fullName ?? data.name,
      };
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      
      return user;
    } catch (error) {
      throw error;
    }
  }, []);

  /**
   * Logout user and clear authentication data
   */
  const logout = useCallback(() => {
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const forceLogout = useCallback((reason) => {
    if (reason) {
      localStorage.setItem(LOGOUT_REASON_KEY, reason);
    }
    logout();
  }, [logout]);

  useEffect(() => {
    if (!user?.id || !user?.email) {
      return undefined;
    }

    let cancelled = false;

    const verifySessionStatus = async () => {
      try {
        const status = await authService.getSessionStatus(user.id, user.email);
        if (cancelled) return;

        if (!status?.active) {
          forceLogout(status?.message || "Your account is inactive. Please contact admin.");
        }
      } catch (error) {
        if (cancelled) return;

        const message = error?.response?.data?.message || "Session is no longer valid";
        forceLogout(message);
      }
    };

    verifySessionStatus();
    const intervalId = window.setInterval(verifySessionStatus, STATUS_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [user, forceLogout]);

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback((roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  }, [user]);

  const isAdmin = useCallback(() => hasRole("ADMIN"), [hasRole]);
  const isFaculty = useCallback(() => hasRole("FACULTY"), [hasRole]);
  const isStudent = useCallback(() => hasRole("STUDENT"), [hasRole]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    forceLogout,
    hasRole,
    isAdmin,
    isFaculty,
    isStudent,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
