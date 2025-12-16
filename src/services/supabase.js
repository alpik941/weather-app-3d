import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

// Only create Supabase client if valid credentials are provided
if (supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'your_supabase_url_here' && 
    supabaseAnonKey !== 'your_supabase_anon_key_here') {
  try {
    // Validate URL format
    new URL(supabaseUrl);
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn('Invalid Supabase URL provided, authentication will be disabled');
    supabase = null;
  }
}

export { supabase };