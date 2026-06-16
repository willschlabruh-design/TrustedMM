import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicEnv } from "../../src/lib/supabase/env";

export const createClient = async (cookieStore?: Awaited<ReturnType<typeof cookies>>) => {
  const { url, key } = getSupabasePublicEnv();
  const store = cookieStore ?? await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Server Components cannot always set cookies; middleware handles refresh.
        }
      },
    },
  });
};
