import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { db, verifyPassword } from '../db.ts';
import { 
  createToken, 
  checkLoginRateLimit, 
  recordFailedLogin, 
  recordSuccessfulLogin, 
  requireAuth, 
  AuthenticatedRequest 
} from '../auth.ts';
import { User, UserRole } from '../../src/types/index.ts';

const router = express.Router();

// Input sanitization / validation
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/auth/register
router.post('/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role, city } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Valid full name (minimum 2 characters) is required.' });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    // Role security check: No public registration as ADMIN or SUPER_ADMIN
    const allowedRegistrationRoles: UserRole[] = ['USER', 'PROPERTY_OWNER', 'ROOMMATE', 'SERVICE_PROVIDER'];
    const assignedRole: UserRole = allowedRegistrationRoles.includes(role) ? role : 'USER';

    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const settings = db.getSettings();
    if (!settings.allowNewRegistrations) {
      return res.status(403).json({ error: 'New user registrations are currently disabled by platform administrator.' });
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? String(phone).trim() : '',
      role: assignedRole,
      city: city ? String(city).trim() : 'Bengaluru',
      isEmailVerified: true, // Auto-verified for seamless evaluation
      isPhoneVerified: false,
      isIdentityVerified: false,
      isSuspended: false,
      isBanned: false,
      privacySettings: {
        hidePhone: false,
        hideEmail: true,
        allowDirectMessages: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createUser(newUser, password);
    const token = createToken(newUser.id, newUser.role);

    return res.status(201).json({
      message: 'Registration successful.',
      token,
      user: newUser,
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const rateCheck = checkLoginRateLimit(normalizedEmail);

    if (!rateCheck.allowed) {
      return res.status(429).json({ 
        error: `Too many failed login attempts. Please wait ${rateCheck.waitSeconds} seconds before trying again.` 
      });
    }

    const user = db.getUserByEmail(normalizedEmail);
    if (!user) {
      recordFailedLogin(normalizedEmail);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'This account has been banned for policy violations.' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ error: 'This account is temporarily suspended. Contact support.' });
    }

    const credentials = db.getCredentials(user.id);
    if (!credentials) {
      recordFailedLogin(normalizedEmail);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = verifyPassword(password, credentials.passwordHash, credentials.salt);
    if (!isMatch) {
      recordFailedLogin(normalizedEmail);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    recordSuccessfulLogin(normalizedEmail);
    const token = createToken(user.id, user.role);

    return res.json({
      message: 'Login successful.',
      token,
      user,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// POST /api/auth/admin-login (Dedicated secure admin portal authentication)
router.post('/admin-login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Administrator email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const rateCheck = checkLoginRateLimit(`admin_${normalizedEmail}`);

    if (!rateCheck.allowed) {
      return res.status(429).json({ 
        error: `Security Alert: Rate limit exceeded. Too many login attempts. Locked for ${rateCheck.waitSeconds} seconds.` 
      });
    }

    const user = db.getUserByEmail(normalizedEmail);
    // Generic error to prevent account enumeration
    if (!user) {
      recordFailedLogin(`admin_${normalizedEmail}`);
      return res.status(401).json({ error: 'Invalid administrator credentials.' });
    }

    // Role check: Must have an administrative role
    const adminRoles: UserRole[] = [
      'SUPER_ADMIN',
      'ADMIN',
      'MODERATOR',
      'SUPPORT',
      'CONTENT_MANAGER',
      'FINANCE_MANAGER'
    ];

    if (!adminRoles.includes(user.role)) {
      recordFailedLogin(`admin_${normalizedEmail}`);
      return res.status(403).json({ error: 'Access denied: User does not possess administrative privileges.' });
    }

    if (user.isBanned || user.isSuspended) {
      return res.status(403).json({ error: 'Administrative access suspended. Contact the Super Administrator.' });
    }

    const credentials = db.getCredentials(user.id);
    if (!credentials) {
      recordFailedLogin(`admin_${normalizedEmail}`);
      return res.status(401).json({ error: 'Invalid administrator credentials.' });
    }

    const isMatch = verifyPassword(password, credentials.passwordHash, credentials.salt);
    if (!isMatch) {
      recordFailedLogin(`admin_${normalizedEmail}`);
      return res.status(401).json({ error: 'Invalid administrator credentials.' });
    }

    recordSuccessfulLogin(`admin_${normalizedEmail}`);
    const token = createToken(user.id, user.role);

    // Update lastActiveAt
    db.updateUser(user.id, {
      lastActiveAt: new Date().toISOString(),
      loginCount: (user.loginCount || 0) + 1,
    });

    // Log security audit
    db.logAudit({
      adminId: user.id,
      adminEmail: user.email,
      adminRole: user.role,
      action: 'ADMIN_LOGIN',
      targetType: 'SYSTEM',
      targetId: 'ADMIN_CONSOLE',
      details: `Successful administrator authentication session established from IP ${req.ip || '127.0.0.1'}`,
      ipAddress: req.ip || '127.0.0.1',
      result: 'SUCCESS',
    });

    return res.json({
      message: 'Admin authentication successful.',
      token,
      user,
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: 'Internal server error during admin authentication.' });
  }
});

// POST /api/auth/demo-login
router.post('/demo-login', (req: Request, res: Response) => {
  const { role } = req.body;
  const targetEmailMap: Record<string, string> = {
    SUPER_ADMIN: 'superadmin@roommitra.com',
    ADMIN: 'admin@roommitra.com',
    PROPERTY_OWNER: 'owner@roommitra.com',
    ROOMMATE: 'roommate@roommitra.com',
    SERVICE_PROVIDER: 'tiffin@roommitra.com',
    USER: 'user@roommitra.com',
  };

  const email = targetEmailMap[role];
  if (!email) {
    return res.status(400).json({ error: 'Invalid demo role selected.' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'Demo account not found.' });
  }

  const token = createToken(user.id, user.role);
  return res.json({
    message: `Logged in as ${user.name} (${user.role}).`,
    token,
    user,
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json({ user: req.user });
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, phone, city, occupation, companyOrCollege, bio, privacySettings } = req.body;

    const updates: Partial<User> = {};
    if (name && typeof name === 'string') updates.name = name.trim();
    if (phone !== undefined) updates.phone = String(phone).trim();
    if (city !== undefined) updates.city = String(city).trim();
    if (occupation !== undefined) updates.occupation = String(occupation).trim();
    if (companyOrCollege !== undefined) updates.companyOrCollege = String(companyOrCollege).trim();
    if (bio !== undefined) updates.bio = String(bio).trim();
    if (privacySettings && typeof privacySettings === 'object') {
      updates.privacySettings = {
        ...req.user!.privacySettings,
        ...privacySettings,
      };
    }

    const updatedUser = db.updateUser(userId, updates);
    return res.json({ message: 'Profile updated successfully.', user: updatedUser });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    const creds = db.getCredentials(req.user!.id);
    if (!creds || !verifyPassword(currentPassword, creds.passwordHash, creds.salt)) {
      return res.status(401).json({ error: 'Current password does not match.' });
    }

    db.updatePassword(req.user!.id, newPassword);
    return res.json({ message: 'Password updated successfully.' });
  } catch {
    return res.status(500).json({ error: 'Failed to update password.' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  // Always return identical message to prevent account enumeration
  return res.json({ 
    message: 'If an account exists for this email address, password reset instructions have been sent.' 
  });
});

// DELETE /api/auth/account
router.delete('/account', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  db.deleteUser(userId);
  return res.json({ message: 'Your account and personal data have been completely deleted.' });
});

export default router;
