import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  res.status(200).json({
    supabaseUrl,
    startsWithHttps: supabaseUrl?.startsWith("https://") ?? false,
    hasPublishableKey:
      !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    hasServiceRole:
      !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV,
  });
}