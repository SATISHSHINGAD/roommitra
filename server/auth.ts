import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from './db.ts';
import { User, UserRole, AdminPermission } from '../src/types/index.ts';

const AUTH_SECRET = process.env.AUTH_SECRET || 'roommitra_secure_signature_secret_2026';
const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const ADMIN_ROLES: UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'MODERATOR',
  'SUPPORT',
  'CONTENT_MANAGER',
  'FINANCE_MANAGER'
];

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, AdminPermission[]> = {
  SUPER_ADMIN: [
    'users.read', 'users.edit', 'users.suspend', 'users.delete',
    'properties.read', 'properties.approve', 'properties.delete',
    'services.manage', 'bookings.read', 'bookings.manage',
    'payments.read', 'payments.refund', 'reports.manage',
    'reviews.manage', 'messages.inspect', 'content.manage',
    'marketing.manage', 'admins.manage', 'settings.manage', 'audit.read'
  ],
  ADMIN: [
    'users.read', 'users.edit', 'users.suspend',
    'properties.read', 'properties.approve',
    'services.manage', 'bookings.read', 'bookings.manage',
    'payments.read', 'reports.manage', 'reviews.manage',
    'content.manage', 'marketing.manage', 'audit.read'
  ],
  MODERATOR: [
    'properties.read', 'properties.approve',
    'users.read', 'users.suspend',
    'reports.manage', 'reviews.manage'
  ],
  SUPPORT: [
    'users.read', 'properties.read', 'bookings.read',
    'reports.manage', 'payments.read'
  ],
  CONTENT_MANAGER: [
    'content.manage', 'marketing.manage', 'properties.read'
  ],
  FINANCE_MANAGER: [
    'payments.read', 'payments.refund', 'bookings.read', 'properties.read'
  ],
  USER: [],
  PROPERTY_OWNER: [],
  ROOMMATE: [],
  SERVICE_PROVIDER: []
};

export function hasPermission(user: User, perm: AdminPermission): boolean {
  if (user.role === 'SUPER_ADMIN') return true;
  if (user.permissions && user.permissions.includes(perm)) return true;
  const rolePerms = ROLE_DEFAULT_PERMISSIONS[user.role] || [];
  return rolePerms.includes(perm);
}

export function requirePermission(permission: AdminPermission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!hasPermission(req.user, permission)) {
      return res.status(403).json({ error: `Forbidden: Missing required permission '${permission}'.` });
    }
    next();
  };
}

export function createToken(userId: string, role: UserRole): string {
  const payload = {
    sub: userId,
    role,
    exp: Date.now() + TOKEN_EXPIRY_MS,
    iat: Date.now(),
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

export function verifyToken(token: string): { userId: string; role: UserRole } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadBase64, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(payloadBase64)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadJson);

    if (Date.now() > payload.exp) {
      return null; // Expired
    }

    return { userId: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

// In-memory rate limiting map for login protection
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

export function checkLoginRateLimit(identifier: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier);

  if (!attempt) {
    return { allowed: true };
  }

  if (attempt.lockedUntil > now) {
    const waitSeconds = Math.ceil((attempt.lockedUntil - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  if (attempt.lockedUntil <= now && attempt.count >= 5) {
    // Lock period expired, reset counter
    loginAttempts.delete(identifier);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedLogin(identifier: string): void {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier) || { count: 0, lockedUntil: 0 };
  attempt.count += 1;

  if (attempt.count >= 5) {
    attempt.lockedUntil = now + 60 * 1000; // 1 minute lockout after 5 fails
  }

  loginAttempts.set(identifier, attempt);
}

export function recordSuccessfulLogin(identifier: string): void {
  loginAttempts.delete(identifier);
}

// Authentication Middlewares
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);
  const tokenData = verifyToken(token);

  if (!tokenData) {
    return next();
  }

  const user = db.getUserById(tokenData.userId);
  if (user && !user.isBanned && !user.isSuspended) {
    req.user = user;
  }

  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges.' });
    }
    next();
  };
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (!ADMIN_ROLES.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: Administrator privileges required.' });
  }
  next();
}

export function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Super Admin access required.' });
  }
  next();
}
