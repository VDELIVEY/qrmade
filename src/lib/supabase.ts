import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL is required.');
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY is required.');
}

const supabaseOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);

export const supabaseServer = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, supabaseOptions)
  : supabase;

