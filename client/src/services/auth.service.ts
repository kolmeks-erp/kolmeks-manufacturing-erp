import { supabase } from './supabase';
import { Session, User } from '@supabase/supabase-js';

export interface SignInCredentials {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Authenticate user via Supabase Auth
   */
  static async signIn({ email, password }: SignInCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Terminate active Supabase session
   */
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    }
  }

  /**
   * Retrieve current Supabase Session
   */
  static async getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error retrieving session:', error.message);
      return null;
    }
    return data.session;
  }

  /**
   * Retrieve current Supabase User
   */
  static async getCurrentUser(): Promise<User | null> {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      return null;
    }
    return data.user;
  }

  /**
   * Listen for authentication state changes (sign in, sign out, token refresh)
   */
  static onAuthStateChange(callback: (session: Session | null) => void) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
    return data.subscription;
  }

  /**
   * Request password reset link via Supabase Auth
   */
  static async resetPasswordForEmail(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/secure-kolmeks-x0y0/reset-password`,
    });
    if (error) {
      throw new Error(error.message);
    }
  }
}
