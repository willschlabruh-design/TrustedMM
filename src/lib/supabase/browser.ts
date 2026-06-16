import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import { getSupabasePublicEnv } from './env';

export function createBrowserClient() {
  const { url, key } = getSupabasePublicEnv();
  return createSupabaseBrowserClient(url, key);
}
