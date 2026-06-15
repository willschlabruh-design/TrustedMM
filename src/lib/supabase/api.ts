import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';
import type { NextApiRequest, NextApiResponse } from 'next';

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export function createSupabaseApiClient(req: NextApiRequest, res?: NextApiResponse) {
  const env = getSupabaseEnv();
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
