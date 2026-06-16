import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdminEnvOrNull } from './env';

export function createSupabaseAdminClient() {
  const env = getSupabaseAdminEnvOrNull();
  if (!env) return null;

  return createClient(env.url, env.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
