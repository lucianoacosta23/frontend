import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { jwtDecode } from 'jwt-decode';
import type { UserData } from '../types/userData';

export function useAuth() {
  const [userData, setUserData] = useState<UserData | undefined>(undefined);
  const [token, setToken] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
    
  const checkAuth = useCallback(() => {
    const stored = localStorage.getItem('user');

    if (!stored) {
      setUserData(undefined);
      setToken(undefined);
      return;
    }

    try {
      const decoded = jwtDecode(stored) as UserData;
      setUserData(decoded);
      setToken(stored);
    } catch (error) {
      console.error('Error decodificando token:', error);
      alert('Error decodificando token:' + error);
      localStorage.removeItem('user');
      setUserData(undefined);
      setToken(undefined);
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    checkAuth();

    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuth]);

  return { userData, token, checkAuth };
}
