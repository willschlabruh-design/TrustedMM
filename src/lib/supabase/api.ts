import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabasePublicEnvOrNull } from './env';

export function createSupabaseApiClient(req: NextApiRequest, res?: NextApiResponse) {
  const env = getSupabasePublicEnvOrNull();
  if (!env) return null;

  const { url, key } = env;

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return parseCookieHeader(req.headers.cookie ?? '').flatMap((cookie) =>
          cookie.value === undefined ? [] : [{ name: cookie.name, value: cookie.value }]
        );
      },
      setAll(cookiesToSet, headers) {
        if (!res) return;
        cookiesToSet.forEach(({ name, value, options }) => {
          res.appendHeader('Set-Cookie', serializeCookieHeader(name, value, options));
        });
        Object.entries(headers).forEach(([header, value]) => {
          res.setHeader(header, value);
        });
      },
    },
  });
}
