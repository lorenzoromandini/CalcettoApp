/**
 * Supabase Client for Browser
 * 
 * Creates a singleton Supabase client for use in client components.
 * Uses @supabase/ssr for cookie-based session handling.
 * 
 * @see RESEARCH.md Pattern 3 for SSR architecture
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

/**
 * Create a Supabase client for browser use
 * This client handles authentication via cookies automatically
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton instance for reuse across components
let browserClient: ReturnType<typeof createClient> | null = null;

/**
 * Get or create the singleton Supabase browser client
 * Use this in client components for consistent session handling
 */
export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
}
