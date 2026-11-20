import { useEffect, useMemo, useState } from 'react';
import { AuthContext } from './context';
import { supabase, supabaseConfigError } from './supabase';
import { useToast } from '../notifications/useToast';

export function AuthProvider({ children }) {
  const { showSuccess } = useToast();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) return undefined;

    let isMounted = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return;
      if (error) console.error('Unable to restore Supabase session:', error);
      setSession(data?.session ?? null);
      setLoading(false);
    }).catch((error) => {
      if (!isMounted) return;
      console.error('Unable to restore Supabase session:', error);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({
    user: session?.user ?? null,
    session,
    loading,
    isConfigured: Boolean(supabase),
    configurationError: supabaseConfigError,
    signIn: async ({ email, password }) => {
      if (!supabase) throw new Error(supabaseConfigError);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    signUp: async ({ email, password, fullName, phone }) => {
      if (!supabase) throw new Error(supabaseConfigError);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone },
          emailRedirectTo: window.location.origin
        }
      });
      if (error) throw error;
      return data;
    },
    signInWithProvider: async (provider) => {
      if (!supabase) throw new Error(supabaseConfigError);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    },
    resetPassword: async (email) => {
      if (!supabase) throw new Error(supabaseConfigError);
      const redirectTo = new URL('/', window.location.origin);
      redirectTo.searchParams.set('flow', 'reset-password');
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo.toString()
      });
      if (error) throw error;
    },
    updatePassword: async (password) => {
      if (!supabase) throw new Error(supabaseConfigError);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
    signOut: async () => {
      if (!supabase) throw new Error(supabaseConfigError);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      showSuccess('Đăng xuất thành công.');
    }
  }), [session, loading, showSuccess]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
