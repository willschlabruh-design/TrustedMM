function normalizeEnv(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().replace(/^["']|["']$/g, '');
  return trimmed || undefined;
}

function assertSupabaseUrl(url: string | undefined): string {
  const normalized = normalizeEnv(url);
  if (!normalized) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing or empty');
  }
  if (!/^https?:\/\//i.test(normalized)) {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL must be a valid HTTP or HTTPS URL (received "${normalized.slice(0, 48)}")`
    );
  }
  return normalized;
}

function assertSupabaseKey(key: string | undefined, name: string): string {
  const normalized = normalizeEnv(key);
  if (!normalized) {
    throw new Error(`${name} is missing or empty`);
  }
  return normalized;
}

export function getSupabasePublicEnv() {
  const url = assertSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = assertSupabaseKey(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
  );
  return { url, key };
}

export function getSupabasePublicEnvOrNull() {
  try {
    return getSupabasePublicEnv();
  } catch {
    return null;
  }
}

export function getSupabaseAdminEnvOrNull() {
  const publicEnv = getSupabasePublicEnvOrNull();
  const serviceRoleKey = normalizeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!publicEnv || !serviceRoleKey) return null;
  return { ...publicEnv, serviceRoleKey };
}
