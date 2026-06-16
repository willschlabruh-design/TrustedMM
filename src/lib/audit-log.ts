import type { NextApiRequest } from 'next';
import { prisma } from './prisma';

export const AuthAuditAction = {
  USER_REGISTRATION: 'USER_REGISTRATION',
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED: 'PASSWORD_RESET_COMPLETED',
  EMAIL_RESEND_REQUESTED: 'EMAIL_RESEND_REQUESTED',
} as const;

export type AuthAuditActionType = (typeof AuthAuditAction)[keyof typeof AuthAuditAction];

export const AUTH_AUDIT_ACTION_LABELS: Record<AuthAuditActionType, string> = {
  [AuthAuditAction.USER_REGISTRATION]: 'User registration',
  [AuthAuditAction.EMAIL_VERIFICATION]: 'Email verification',
  [AuthAuditAction.LOGIN_SUCCESS]: 'Login success',
  [AuthAuditAction.LOGIN_FAILURE]: 'Login failure',
  [AuthAuditAction.PASSWORD_RESET_REQUESTED]: 'Password reset requested',
  [AuthAuditAction.PASSWORD_RESET_COMPLETED]: 'Password reset completed',
  [AuthAuditAction.EMAIL_RESEND_REQUESTED]: 'Email resend requested',
};

type AuthAuditInput = {
  req?: NextApiRequest;
  userId?: string | null;
  email?: string | null;
  action: AuthAuditActionType;
};

export function getClientIp(req: NextApiRequest): string | null {
  const forwarded = req.headers['x-forwarded-for'];

  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() || null;
  }

  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0]?.trim() || null;
  }

  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.length > 0) {
    return realIp.trim();
  }

  return req.socket?.remoteAddress ?? null;
}

function normalizeEmail(email?: string | null) {
  if (!email) return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed || null;
}

export async function writeAuthAuditLog(input: AuthAuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        email: normalizeEmail(input.email),
        ipAddress: input.req ? getClientIp(input.req) : null,
        action: input.action,
      },
    });
  } catch (error) {
    console.error('[audit-log] Failed to write auth audit log', {
      action: input.action,
      userId: input.userId ?? null,
      error,
    });
  }
}

export function logAuthAudit(input: AuthAuditInput): void {
  void writeAuthAuditLog(input);
}
