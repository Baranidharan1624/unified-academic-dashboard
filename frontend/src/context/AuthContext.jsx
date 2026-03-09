import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../features/auth/AuthService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, [token]);

  /**
   * Login user with email and password
   */
  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    
    const userData = {
      id: data.userId,
      email: data.email,
      role: data.role,
      name: data.fullName ?? data.name,
    };
    
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(userData));
    
    setToken(data.token);
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
        name: data.name,
      };
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));
      
      setToken(data.token);
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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

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
    token,
    loading,
    login,
    register,
    logout,
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
