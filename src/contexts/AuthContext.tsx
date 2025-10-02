import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../config/supabaseClient';
import { isAdmin } from '../services/authService';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isUserAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!isMounted) return;
      setCurrentUser(data.user ?? null);
      setIsUserAdmin(data.user ? isAdmin(data.user.email ?? null) : false);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      setIsUserAdmin(user ? isAdmin(user.email ?? null) : false);
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { user: null, error: error.message };
      return { user: data.user, error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      console.error('Sign in error:', errorMessage);
      return { user: null, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { user: null, error: error.message };
      return { user: data.user, error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      console.error('Sign up error:', errorMessage);
      return { user: null, error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ? error.message : null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      console.error('Sign out error:', errorMessage);
      return { error: errorMessage };
    }
  };

  const value = {
    currentUser,
    loading,
    isUserAdmin,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};