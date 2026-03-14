import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Debug: Check environment variables
console.log("[v0] Supabase URL exists:", !!supabaseUrl, "length:", supabaseUrl.length);
console.log("[v0] Supabase Anon Key exists:", !!supabaseAnonKey, "length:", supabaseAnonKey.length);

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create a mock client or real client based on configuration
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as SupabaseClient);
