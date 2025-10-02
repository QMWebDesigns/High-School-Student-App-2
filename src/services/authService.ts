import { User } from '@supabase/supabase-js';
import { supabase } from '../config/supabaseClient';

const ADMIN_EMAILS = ['admin@example.com', 'admin@school.com'];

export const isAdmin = (email: string | null): boolean => {
  return email ? ADMIN_EMAILS.includes(email.toLowerCase()) : false;
};

export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { user: null, error: error.message };
    return { user: data.user, error: null };
  } catch (error: unknown) {
    return { user: null, error: error instanceof Error ? error.message : 'An error occurred' };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { user: null, error: error.message };
    return { user: data.user, error: null };
  } catch (error: unknown) {
    return { user: null, error: error instanceof Error ? error.message : 'An error occurred' };
  }
};

export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error: error ? error.message : null };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'An error occurred' };
  }
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise(async (resolve) => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      resolve(null);
      return;
    }
    resolve(data.user ?? null);
  });
};