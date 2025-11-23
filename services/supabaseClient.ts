import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;

  // 1. Try Process Env (Build time configuration)
  let url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  let key = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY;

  // 2. Try Local Storage (Runtime user configuration)
  // This allows the user to enter keys via the UI without rebuilding the app
  if (!url || !key) {
     try {
         url = localStorage.getItem('sb_url') || '';
         key = localStorage.getItem('sb_key') || '';
     } catch (e) {
         // Ignore localStorage errors
     }
  }

  if (url && key) {
    try {
      supabaseInstance = createClient(url, key);
    } catch (e) {
      console.error("Invalid Supabase credentials provided", e);
      return null;
    }
  }

  return supabaseInstance;
};

// Allow resetting the client if the user changes keys
export const resetSupabaseClient = () => {
    supabaseInstance = null;
};

// Export a default for backward compatibility, though using getSupabase() is preferred for dynamic checking
export const supabase = getSupabase();