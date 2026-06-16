import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { getSupabasePublicEnvOrNull } from './env';

export async function updateSession(request: NextRequest) {
  const env = getSupabasePublicEnvOrNull();
  if (!env) {
    console.error(
      '[supabase middleware] Skipping session refresh: invalid or missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
    );
    return NextResponse.next();
  }

  const { url, key } = env;

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
          Object.entries(headers).forEach(([header, value]) => {
            supabaseResponse.headers.set(header, value);
          });
        },
      },
    });

    await supabase.auth.getUser();
  } catch (error) {
    console.error('[supabase middleware] Session refresh failed:', error);
  }

  return supabaseResponse;
}
