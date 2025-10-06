import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContextType, User } from '../types';
import ApiService from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = useCallback(async () => {
    try {
      console.log('🔍 === CHECKING AUTH STATE ===');
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      console.log('🔍 Token found:', !!token);
      console.log('🔍 User data found:', !!userData);
      
      if (token && userData) {
        console.log('🔍 Token preview:', token.substring(0, 50) + '...');
        const parsedUserData = JSON.parse(userData);
        console.log('🔍 Parsed user data:', JSON.stringify(parsedUserData, null, 2));
        
        // Validate that the user data is complete
        if (parsedUserData && parsedUserData.id && parsedUserData.email) {
          console.log('🔍 ✅ User data is valid, setting user');
          setUser(parsedUserData);
        } else {
          console.log('🔍 ❌ User data is invalid, clearing storage');
          // Clear invalid data
          await AsyncStorage.removeItem('auth_token');
          await AsyncStorage.removeItem('user_data');
          // Try auto-login for development
          await performAutoLogin();
        }
      } else {
        console.log('🔍 ❌ No token or user data found - attempting auto-login for development');
        // Try auto-login for development
        await performAutoLogin();
      }
    } catch (error) {
      console.error('❌ Error checking auth state:', error);
      // Clear potentially corrupted data
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
    } finally {
      console.log('🔍 === AUTH STATE CHECK COMPLETE ===');
      setIsLoading(false);
    }
  }, []);

  const performAutoLogin = useCallback(async () => {
    try {
      console.log('🤖 === ATTEMPTING AUTO-LOGIN FOR DEVELOPMENT ===');
      const response = await ApiService.login('admin@institutoareluna.pt', 'admin123');
      
      console.log('🤖 Auto-login response:', response);
      
      if (response.data && response.data.user && response.data.token) {
        const { user: userData, token } = response.data;
        
        console.log('🤖 Auto-login successful, storing credentials');
        await AsyncStorage.setItem('auth_token', token);
        await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        
        setUser(userData);
        console.log('🤖 ✅ Auto-login completed successfully');
      } else {
        console.log('🤖 ❌ Auto-login failed: Invalid response format');
      }
    } catch (error) {
      console.error('🤖 ❌ Auto-login error:', error);
      // Don't throw error here, just log it - user can still login manually
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await ApiService.login(email, password);
      
      console.log('🔐 Login response:', response);
      
      // Verificar se a resposta contém dados válidos
      if (response.data && response.data.user && response.data.token) {
        const { user: userData, token } = response.data;
        
        console.log('🔐 Storing token:', token.substring(0, 50) + '...');
        console.log('🔐 Storing user data:', userData);
        
        await AsyncStorage.setItem('auth_token', token);
        await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        
        // Verify storage
        const storedToken = await AsyncStorage.getItem('auth_token');
        const storedUserData = await AsyncStorage.getItem('user_data');
        console.log('🔐 Verification - Token stored:', !!storedToken);
        console.log('🔐 Verification - User data stored:', !!storedUserData);
        
        setUser(userData);
      } else {
        throw new Error('Login failed: Invalid response format');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const value: AuthContextType = useMemo(() => ({
    user,
    login,
    logout,
    isLoading,
  }), [user, login, logout, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};