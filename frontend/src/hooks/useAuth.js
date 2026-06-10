import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * @returns {{ user: object|null, token: string|null, login: Function, register: Function, logout: Function, isAuthenticated: boolean, isLoading: boolean }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
