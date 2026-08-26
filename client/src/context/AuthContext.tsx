import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile, UserRoleName } from '../types';
import { AuthService, SignInCredentials } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  role: UserRoleName | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadUserProfile = useCallback(async (userId: string) => {
    const userProfile = await ProfileService.fetchUserProfile(userId);
    setProfile(userProfile);
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const currentSession = await AuthService.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (currentSession?.user) {
        await loadUserProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error initializing auth state:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadUserProfile]);

  useEffect(() => {
    initializeAuth();

    // Subscribe to auth state changes (sign in, sign out, token refresh)
    const subscription = AuthService.onAuthStateChange(async (newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);

      if (newSession?.user) {
        await loadUserProfile(newSession.user.id);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth, loadUserProfile]);

  const signIn = async (credentials: SignInCredentials) => {
    setIsLoading(true);
    try {
      const data = await AuthService.signIn(credentials);
      setSession(data.session);
      setUser(data.user);
      if (data.user) {
        await loadUserProfile(data.user.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await AuthService.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  const role: UserRoleName | null = profile?.role?.name || null;
  const isAuthenticated = Boolean(session && user && profile && profile.status === 'active');

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        role,
        isLoading,
        isAuthenticated,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
