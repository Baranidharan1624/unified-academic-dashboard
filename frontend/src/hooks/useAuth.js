import { useAuth as useAuthContext } from "../context/AuthContext";

/**
 * Custom hook for authentication
 * Provides access to auth context values and methods
 */
export function useAuth() {
  const context = useAuthContext();
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}

/**
 * Hook to check if user has specific role(s)
 * @param {string|string[]} roles - Role(s) to check
 */
export function useHasRole(roles) {
  const { hasRole } = useAuthContext();
  return hasRole(roles);
}

/**
 * Hook to check if user is admin
 */
export function useIsAdmin() {
  const { isAdmin } = useAuthContext();
  return isAdmin();
}

/**
 * Hook to check if user is faculty
 */
export function useIsFaculty() {
  const { isFaculty } = useAuthContext();
  return isFaculty();
}

/**
 * Hook to check if user is student
 */
export function useIsStudent() {
  const { isStudent } = useAuthContext();
  return isStudent();
}

export default useAuth;

