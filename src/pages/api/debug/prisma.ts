import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const userCount = await prisma.user.count();

    return res.status(200).json({
      connected: true,
      userCount,
    });
  } catch (error: any) {
    return res.status(500).json({
      connected: false,
      error: error.message,
      code: error.code,
    });
  }
}