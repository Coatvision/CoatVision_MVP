// frontend/src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check for missing environment variables
const isMissingCredentials = !SUPABASE_URL || !SUPABASE_ANON_KEY;

if (isMissingCredentials) {
  console.error(
    "Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables."
  );
}

// Create client - will fail gracefully if credentials are missing
// In development, this allows the app to load but Supabase queries will fail
export const supabase = isMissingCredentials
  ? null
  : createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => !isMissingCredentials && supabase !== null;
