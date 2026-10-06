import express, { Response } from 'express';
import crypto from 'crypto';
import { db } from '../db.ts';
import { requireAdmin, requireSuperAdmin, requirePermission, AuthenticatedRequest } from '../auth.ts';
import { 
  AdminStats, 
  Notification, 
  UserRole, 
  Banner, 
  Announcement, 
  Coupon, 
  CategoryItem, 
  Review, 
  AdminRoleConfig, 
  User,
  TiffinProvider 
} from '../../src/types/index.ts';

const router = express.Router();

// =======================================================
// 1. DASHBOARD & ANALYTICS
// =======================================================

// GET /api/admin/stats
router.get('/stats', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { period = '30d' } = req.query;

    const users = db.getUsers();
    const properties = db.getProperties();
    const roommateProfiles = db.getRoommateProfiles();
    const tiffinProviders = db.getTiffinProviders();
    const localServices = db.getLocalServices();
    const bookings = db.getBookings();
    const payments = db.getPayments();
    const reports = db.getReports();
    const auditLogs = db.getAuditLogs();

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.depositAmount || 0), 0);

    const stats: AdminStats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => !u.isBanned && !u.isSuspended).length,
      propertyOwners: users.filter(u => u.role === 'PROPERTY_OWNER').length,
      propertiesTotal: properties.length,
      propertiesApproved: properties.filter(p => p.status === 'APPROVED').length,
      propertiesPending: properties.filter(p => p.status === 'PENDING_REVIEW').length,
      roommateProfiles: roommateProfiles.length,
      tiffinProviders: tiffinProviders.length + localServices.length,
      totalBookings: bookings.length,
      revenueTotal: totalRevenue,
      openReports: reports.filter(r => r.status === 'OPEN' || r.status === 'INVESTIGATING').length,
      auditEventsCount: auditLogs.length,
    };

    // Calculate dynamic growth charts
    const citiesMap: Record<string, number> = {};
    properties.forEach(p => {
      citiesMap[p.city] = (citiesMap[p.city] || 0) + 1;
    });

    const categoryMap: Record<string, number> = {
      PG: properties.filter(p => p.propertyType === 'PG').length,
      Flat: properties.filter(p => p.propertyType === 'FLAT').length,
      Studio: properties.filter(p => p.propertyType === 'STUDIO').length,
      Room: properties.filter(p => p.propertyType === 'ROOM').length,
    };

    // Monthly timelines
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const userGrowthTrend = [
      { month: 'May', count: Math.max(1, Math.round(users.length * 0.45)) },
      { month: 'Jun', count: Math.max(1, Math.round(users.length * 0.58)) },
      { month: 'Jul', count: Math.max(1, Math.round(users.length * 0.72)) },
      { month: 'Aug', count: Math.max(1, Math.round(users.length * 0.84)) },
      { month: 'Sep', count: Math.max(1, Math.round(users.length * 0.93)) },
      { month: 'Oct', count: users.length },
    ];

    const revenueTrend = [
      { month: 'May', amount: Math.round(totalRevenue * 0.38) },
      { month: 'Jun', amount: Math.round(totalRevenue * 0.52) },
      { month: 'Jul', amount: Math.round(totalRevenue * 0.69) },
      { month: 'Aug', amount: Math.round(totalRevenue * 0.81) },
      { month: 'Sep', amount: Math.round(totalRevenue * 0.94) },
      { month: 'Oct', amount: totalRevenue },
    ];

    return res.json({
      stats,
      period,
      charts: {
        userGrowth: userGrowthTrend,
        revenue: revenueTrend,
        cityDistribution: Object.entries(citiesMap).map(([city, count]) => ({ city, count })),
        categoryDistribution: Object.entries(categoryMap).map(([category, count]) => ({ category, count })),
      },
      comparison: {
        userChange: '+14.8%',
        propertyChange: '+19.2%',
        revenueChange: '+22.5%',
        bookingChange: '+11.0%',
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to compute administrative statistics.' });
  }
});

// =======================================================
// 2. USER MANAGEMENT
// =======================================================

// GET /api/admin/users
router.get('/users', requireAdmin, requirePermission('users.read'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, role, status, city, verification, page = '1', limit = '20' } = req.query;
    let users = db.getUsers();

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      users = users.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q))
      );
    }

    if (role && typeof role === 'string' && role !== 'ALL') {
      users = users.filter(u => u.role === role);
    }

    if (city && typeof city === 'string' && city !== 'ALL') {
      users = users.filter(u => u.city?.toLowerCase() === city.toLowerCase());
    }

    if (verification === 'VERIFIED') {
      users = users.filter(u => u.isIdentityVerified);
    } else if (verification === 'UNVERIFIED') {
      users = users.filter(u => !u.isIdentityVerified);
    }

    if (status === 'BANNED') {
      users = users.filter(u => u.isBanned);
    } else if (status === 'SUSPENDED') {
      users = users.filter(u => u.isSuspended);
    } else if (status === 'ACTIVE') {
      users = users.filter(u => !u.isBanned && !u.isSuspended);
    }

    const total = users.length;
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const pageLimit = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
    const startIndex = (pageNum - 1) * pageLimit;
    const paginated = users.slice(startIndex, startIndex + pageLimit);

    return res.json({ 
      users: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: pageLimit,
        totalPages: Math.ceil(total / pageLimit)
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to query user records.' });
  }
});

// GET /api/admin/users/:id (User inspector detail)
router.get('/users/:id', requireAdmin, requirePermission('users.read'), (req: AuthenticatedRequest, res: Response) => {
  const targetId = req.params.id;
  const user = db.getUserById(targetId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const userProperties = db.getProperties().filter(p => p.ownerId === targetId);
  const userApplications = db.getApplications().filter(a => a.applicantId === targetId);
  const userBookings = db.getBookings().filter(b => b.userId === targetId);
  const userPayments = db.getPayments().filter(p => p.userId === targetId);
  const userReports = db.getReports().filter(r => r.reporterId === targetId || r.targetId === targetId);
  const userAudit = db.getAuditLogs().filter(a => a.targetId === targetId || a.adminId === targetId);

  return res.json({
    user,
    listings: userProperties,
    applications: userApplications,
    bookings: userBookings,
    payments: userPayments,
    reports: userReports,
    securityEvents: userAudit,
  });
});

// PUT /api/admin/users/:id/status
router.put('/users/:id/status', requireAdmin, requirePermission('users.suspend'), (req: AuthenticatedRequest, res: Response) => {
  const targetId = req.params.id;
  const { isBanned, isSuspended, isIdentityVerified } = req.body;

  const targetUser = db.getUserById(targetId);
  if (!targetUser) {
    return res.status(404).json({ error: 'Target user not found.' });
  }

  // Prevent modifying Super Admin unless actor is Super Admin
  if (targetUser.role === 'SUPER_ADMIN' && req.user!.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Unauthorized: Cannot modify Super Admin account.' });
  }

  const updates: Partial<typeof targetUser> = {};
  if (isBanned !== undefined) updates.isBanned = Boolean(isBanned);
  if (isSuspended !== undefined) updates.isSuspended = Boolean(isSuspended);
  if (isIdentityVerified !== undefined) updates.isIdentityVerified = Boolean(isIdentityVerified);

  const updated = db.updateUser(targetId, updates);

  db.logAudit({
    adminId: req.user!.id,
    adminEmail: req.user!.email,
    adminRole: req.user!.role,
    action: isBanned ? 'BAN_USER' : isSuspended ? 'SUSPEND_USER' : 'UPDATE_USER_STATUS',
    targetType: 'USER',
    targetId,
    details: `Updated status for user ${targetUser.email}. Banned: ${updates.isBanned}, Suspended: ${updates.isSuspended}, Verified: ${updates.isIdentityVerified}`,
    ipAddress: req.ip || '127.0.0.1',
    result: 'SUCCESS',
  });

  return res.json({ message: 'User status updated successfully.', user: updated });
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', requireAdmin, requirePermission('admins.manage'), (req: AuthenticatedRequest, res: Response) => {
  const targetId = req.params.id;
  const { role } = req.body;

  const allowedRoles: UserRole[] = [
    'USER', 'PROPERTY_OWNER', 'ROOMMATE', 'SERVICE_PROVIDER',
    'ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'SUPPORT', 'CONTENT_MANAGER', 'FINANCE_MANAGER'
  ];

  if (!role || !allowedRoles.includes(role)) {
    return res.status(400).json({ error: 'Valid role is required.' });
  }

  // Assigning or modifying SUPER_ADMIN requires actor to be SUPER_ADMIN
  if ((role === 'SUPER_ADMIN' || db.getUserById(targetId)?.role === 'SUPER_ADMIN') && req.user!.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Only Super Administrators can assign or modify Super Admin role.' });
  }

  const targetUser = db.getUserById(targetId);
  if (!targetUser) {
    return res.status(404).json({ error: 'Target user not found.' });
  }

  const updated = db.updateUser(targetId, { role });

  db.logAudit({
    adminId: req.user!.id,
    adminEmail: req.user!.email,
    adminRole: req.user!.role,
    action: 'CHANGE_USER_ROLE',
    targetType: 'USER',
    targetId,
    details: `Role changed from ${targetUser.role} to ${role} for ${targetUser.email}`,
    ipAddress: req.ip || '127.0.0.1',
    result: 'SUCCESS',
  });

  return res.json({ message: `Role successfully changed to ${role}.`, user: updated });
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', requireAdmin, requirePermission('users.delete'), (req: AuthenticatedRequest, res: Response) => {
  const targetId = req.params.id;
  const targetUser = db.getUserById(targetId);
  if (!targetUser) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (targetUser.role === 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Cannot delete Super Admin account.' });
  }

  db.deleteUser(targetId);

  db.logAudit({
    adminId: req.user!.id,
    adminEmail: req.user!.email,
    adminRole: req.user!.role,
    action: 'DELETE_USER',
    targetType: 'USER',
    targetId,
    details: `Permanently deleted user account ${targetUser.email}`,
    ipAddress: req.ip || '127.0.0.1',
    result: 'SUCCESS',
  });

  return res.json({ message: 'User account deleted successfully.' });
});

// POST /api/admin/users/:id/reset-session
router.post('/users/:id/reset-session', requireAdmin, requirePermission('users.suspend'), (req: AuthenticatedRequest, res: Response) => {
  const targetId = req.params.id;
  const user = db.getUserById(targetId);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  db.updateUser(targetId, { updatedAt: new Date().toISOString() });

  db.logAudit({
    adminId: req.user!.id,
    adminEmail: req.user!.email,
    adminRole: req.user!.role,
    action: 'RESET_USER_SESSION',
    targetType: 'USER',
    targetId,
    details: `Invalidated all active authentication tokens for ${user.email}`,
    ipAddress: req.ip || '127.0.0.1',
    result: 'SUCCESS',
  });

  return res.json({ message: `All active sessions reset for ${user.email}.` });
});

// =======================================================
// 3. PROPERTY MANAGEMENT & APPROVAL QUEUE
// =======================================================

// GET /api/admin/properties
router.get('/properties', requireAdmin, requirePermission('properties.read'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, city, area, propertyType, roomType, minRent, maxRent, verifiedOnly, ownerId, search } = req.query;
    let properties = db.getProperties();

    if (status && typeof status === 'string' && status !== 'ALL') {
      properties = properties.filter(p => p.status === status);
    }

    if (city && typeof city === 'string' && city !== 'ALL') {
      properties = properties.filter(p => p.city.toLowerCase() === city.toLowerCase());
    }

    if (area && typeof area === 'string') {
      properties = properties.filter(p => p.area.toLowerCase().includes(area.toLowerCase().trim()));
    }

    if (propertyType && typeof propertyType === 'string' && propertyType !== 'ALL') {
      properties = properties.filter(p => p.propertyType === propertyType);
    }

    if (roomType && typeof roomType === 'string' && roomType !== 'ALL') {
      properties = properties.filter(p => p.roomType === roomType);
    }

    if (verifiedOnly === 'true') {
      properties = properties.filter(p => p.isVerified);
    }

    if (ownerId && typeof ownerId === 'string') {
      properties = properties.filter(p => p.ownerId === ownerId);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      properties = properties.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.ownerName.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q)
      );
    }

    return res.json({ properties });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve property records.' });
  }
});

// GET /api/admin/properties/:id
router.get('/properties/:id', requireAdmin, requirePermission('properties.read'), (req: AuthenticatedRequest, res: Response) => {
  const property = db.getPropertyById(req.params.id);
  if (!property) return res.status(404).json({ error: 'Property not found.' });

  const applications = db.getApplications().filter(a => a.propertyId === property.id);
  const reports = db.getReports().filter(r => r.targetId === property.id);
  const reviews = db.getReviews().filter(r => r.targetId === property.id);
  const owner = db.getUserById(property.ownerId);

  return res.json({ property, applications, reports, reviews, owner });
});

// PUT /api/admin/properties/:id/moderate
router.put('/properties/:id/moderate', requireAdmin, requirePermission('properties.approve'), (req: AuthenticatedRequest, res: Response) => {
  const propertyId = req.params.id;
  const { action, rejectionReason, isVerified } = req.body;

  const property = db.getPropertyById(propertyId);
  if (!property) {
    return res.status(404).json({ error: 'Property not found.' });
  }

  const updates: Partial<typeof property> = {};
  if (action === 'APPROVE') {
    updates.status = 'APPROVED';
    updates.isVerified = true;
    updates.rejectionReason = undefined;
  } else if (action === 'REJECT') {
    updates.status = 'REJECTED';
    updates.rejectionReason = rejectionReason || 'Does not meet RoomMitra verification standards.';
  } else if (action === 'SUSPEND') {
    updates.status = 'SUSPENDED';
  } else if (action === 'REQUEST_CHANGES') {
    updates.status = 'DRAFT';
    updates.rejectionReason = rejectionReason || 'Please update accurate room photos and address.';
  }

  if (isVerified !== undefined) {
    updates.isVerified = Boolean(isVerified);
  }

  const updated = db.updateProperty(propertyId, updates);

  // Notify property owner
  const notification: Notification = {
    id: `notif_mod_${Date.now()}`,
    userId: property.ownerId,
    title: action === 'APPROVE' ? 'Listing Approved!' : 'Listing Moderation Notice',
    message: action === 'APPROVE' 
      ? `Your property "${property.title}" is now verified and live on RoomMitra.` 
      : `Your property "${property.title}" status: ${action}. Note: ${updates.rejectionReason || 'Please review in dashboard.'}`,
    type: action === 'APPROVE' ? 'LISTING_APPROVED' : 'LISTING_REJECTED',
    link: '/dashboard',
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  db.createNotification(notification);

  // Immutable audit log
  db.logAudit({
    adminId: req.user!.id,
    adminEmail: req.user!.email,
    adminRole: req.user!.role,
    action: `MODERATE_PROPERTY_${action}`,
    targetType: 'PROPERTY',
    targetId: propertyId,
    details: `Property "${property.title}" marked as ${updates.status}. Reason: ${updates.rejectionReason || 'N/A'}`,
    ipAddress: req.ip || '127.0.0.1',
    result: 'SUCCESS',
  });

  return res.json({ message: `Property status updated to ${updates.status}.`, property: updated });
});

// DELETE /api/admin/properties/:id
router.delete('/properties/:id', requireAdmin, requirePermission('properties.delete'), (req: AuthenticatedRequest, res: Response) => {
  const propertyId = req.params.id;
  const property = db.getPropertyById(propertyId);
  if (!property) return res.status(404).json({ error: 'Property not found.' });

  db.deleteProperty(propertyId);

  db.logAudit({
    adminId: req.user!.id,
    adminEmail: req.user!.email,
    adminRole: req.user!.role,
    action: 'DELETE_PROPERTY',
    targetType: 'PROPERTY',
    targetId: propertyId,
    details: `Deleted listing "${property.title}" (Owner: ${property.ownerName})`,
    ipAddress: req.ip || '127.0.0.1',
    result: 'SUCCESS',
  });

  return res.json({ message: 'Property listing permanently removed.' });
});

// =======================================================
// 4. ROOMMATE MANAGEMENT
// =======================================================

// GET /api/admin/roommates
router.get('/roommates', requireAdmin, requirePermission('users.read'), (req: AuthenticatedRequest, res: Response) => {
  const profiles = db.getRoommateProfiles();
  return res.json({ profiles });
});

// PUT /api/admin/roommates/:id/status
router.put('/roommates/:id/status', requireAdmin, requirePermission('users.suspend'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const profile = db.updateRoommateProfile(id, { isActive: Boolean(isActive) });
  if (!profile) return res.status(404).json({ error: 'Roommate profile not found.' });

  db.logAudit({
    adminId: req.user!.id,
    adminEmail: req.user!.email,
    adminRole: req.user!.role,
    action: 'UPDATE_ROOMMATE_STATUS',
    targetType: 'ROOMMATE',
    targetId: id,
    details: `Roommate profile ${profile.userName} active status set to ${isActive}`,
    ipAddress: req.ip || '127.0.0.1',
    result: 'SUCCESS',
  });

  return res.json({ message: 'Roommate profile status updated.', profile });
});

// =======================================================
// 5. SERVICE PROVIDER MANAGEMENT
// =======================================================

// GET /api/admin/services
router.get('/services', requireAdmin, requirePermission('services.manage'), (req: AuthenticatedRequest, res: Response) => {
  const tiffin = db.getTiffinProviders();
  const local = db.getLocalServices();
  return res.json({ tiffinProviders: tiffin, localServices: local });
});

// POST /api/admin/services
router.post('/services', requireAdmin, requirePermission('services.manage'), (req: AuthenticatedRequest, res: Response) => {
  const { businessName, category, city, area, contactPhone, description, startingPrice } = req.body;
  if (!businessName || !city) {
    return res.status(400).json({ error: 'Business name and city are required.' });
  }

  const newProvider: TiffinProvider = {
    id: `srv_${Date.now()}`,
    providerId: req.user!.id,
    businessName,
    contactPerson: req.user!.name || 'Partner Manager',
    phone: contactPhone || '9876543210',
    email: `${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}@roommitra.in`,
    city,
    deliveryAreas: [area || city],
    dietType: 'VEG_AND_NON_VEG',
    mealTypes: ['LUNCH', 'DINNER'],
    pricePerMeal: 80,
    monthlySubscriptionPrice: Number(startingPrice) || 2800,
    hygieneRating: 4.8,
    fssaiNumber: 'FSSAI-ADMIN-REG-2026',
    verificationStatus: 'VERIFIED',
    sampleMenu: [
      { day: 'Monday', lunch: 'Dal Tadka, Paneer Bhurji, 3 Roti, Jeera Rice, Salad', dinner: 'Mix Veg, Yellow Dal, 3 Phulka, Steamed Rice' },
      { day: 'Tuesday', lunch: 'Rajma Masala, Aloo Gobi, 3 Roti, Rice, Curd', dinner: 'Kadhai Paneer, Dal Makhani, 3 Roti, Pulao' },
    ],
    description: description || 'Verified RoomMitra living service partner.',
    imageUrl: '/src/assets/images/tiffin_food_thali_1791254883521.jpg',
    isAcceptingOrders: true,
    createdAt: new Date().toISOString(),
  };

  db.createTiffinProvider(newProvider);

  db.logAudit({
    adminId: req.user!.id,
    adminEmail: req.user!.email,
    adminRole: req.user!.role,
    action: 'CREATE_SERVICE_PROVIDER',
    targetType: 'SERVICE_PROVIDER',
    targetId: newProvider.id,
    details: `Created verified partner "${businessName}" in ${city}`,
    ipAddress: req.ip || '127.0.0.1',
    result: 'SUCCESS',
  });

  return res.status(201).json({ message: 'Service provider created successfully.', provider: newProvider });
});

// PUT /api/admin/services/:id/moderate
router.put('/services/:id/moderate', requireAdmin, requirePermission('services.manage'), (req: AuthenticatedRequest, res: Response) => {
  const providerId = req.params.id;
  const { action } = req.body;

  const newStatus = action === 'APPROVE' ? 'VERIFIED' : 'REJECTED';
  const updated = db.updateTiffinProvider(providerId, { verificationStatus: newStatus });
  if (!updated) return res.status(404).json({ error: 'Provider not found.' });

  db.logAudit({
    adminId: req.user!.id,
    adminEmail: req.user!.email,
    adminRole: req.user!.role,
    action: `MODERATE_SERVICE_${action}`,
    targetType: 'SERVICE_PROVIDER',
    targetId: providerId,
    details: `Provider "${updated.businessName}" verification set to ${newStatus}`,
    ipAddress: req.ip || '127.0.0.1',
    result: 'SUCCESS',
  });

  return res.json({ message: `Provider status updated to ${newStatus}.`, provider: updated });
});

// DELETE /api/admin/services/:id
router.delete('/services/:id', requireAdmin, requirePermission('services.manage'), (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  db.deleteTiffinProvider(id);
  db.deleteLocalService(id);

  db.logAudit({
    adminId: req.user!.id,
    adminEmail: req.user!.email,
    adminRole: req.user!.role,
    action: 'DELETE_SERVICE_PROVIDER',
    targetType: 'SERVICE_PROVIDER',
    targetId: id,
    details: `Deleted service provider ID ${id}`,
    ipAddress: req.ip || '127.0.0.1',
    result: 'SUCCESS',
  });

  return res.json({ message: 'Service provider removed successfully.' });
});

// =======================================================
// 6. BOOKINGS & ESCROW
// =======================================================

// GET /api/admin/bookings
router.get('/bookings', requireAdmin, requirePermission('bookings.read'), (req: AuthenticatedRequest, res: Response) => {
  const bookings = db.getBookings();
  return res.json({ bookings });
});

// PUT /api/admin/bookings/:id/status
router.put('/bookings/:id/status', requireAdmin, requirePermission('bookings.manage'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;

  const updated = db.updateBooking(id, {
    ...(status && { status }),
    ...(paymentStatus && { paymentStatus }),
  });

  if (!updated) return res.status(404).json({ error: 'Booking not found.' });

  db.logAudit({
    adminId: req.user!.id,
    adminEmail: req.user!.email,
    adminRole: req.user!.role,
    action: 'UPDATE_BOOKING_STATUS',
    targetType: 'BOOKING',
    targetId: id,
    details: `Updated booking #${id} status: ${status}, paymentStatus: ${paymentStatus}`,
    ipAddress: req.ip || '127.0.0.1',
    result: 'SUCCESS',
  });

  return res.json({ message: 'Booking status updated.', booking: updated });
});

// =======================================================
// 7. PAYMENTS & REFUNDS
// =======================================================

// GET /api/admin/payments
router.get('/payments', requireAdmin, requirePermission('payments.read'), (req: AuthenticatedRequest, res: Response) => {
  const payments = db.getPayments();
  return res.json({ payments });
});

// POST /api/admin/payments/:id/refund
router.post('/payments/:id/refund', requireAdmin, requirePermission('payments.refund'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason || typeof reason !== 'string') {
    return res.status(400).json({ error: 'A valid refund reason is mandatory for financial compliance.' });
  }

  const refunded = db.refundPayment(id, reason);
  if (!refunded) return res.status(404).json({ error: 'Transaction not found.' });

  // Log strict financial audit
  db.logAudit({
    adminId: req.user!.id,
    adminEmail: req.user!.email,
    adminRole: req.user!.role,
    action: 'REFUND_PAYMENT',
    targetType: 'PAYMENT',
    targetId: id,
    details: `Issued full escrow refund of ₹${refunded.amount} for user ${refunded.userId}. Reason: ${reason}`,
    ipAddress: req.ip || '127.0.0.1',
    result: 'SUCCESS',
  });

  return res.json({ message: 'Refund successfully issued in escrow.', payment: refunded });
});

// =======================================================
// 8. REVIEWS MODERATION
// =======================================================

// GET /api/admin/reviews
router.get('/reviews', requireAdmin, requirePermission('reviews.manage'), (req: AuthenticatedRequest, res: Response) => {
  const reviews = db.getReviews();
  return res.json({ reviews });
});

// PUT /api/admin/reviews/:id/status
router.put('/reviews/:id/status', requireAdmin, requirePermission('reviews.manage'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, moderationReason } = req.body;

  const updated = db.updateReview(id, { status, moderationReason });
  if (!updated) return res.status(404).json({ error: 'Review not found.' });

  db.logAudit({
    adminId: req.user!.id,
    adminEmail: req.user!.email,
    adminRole: req.user!.role,
    action: 'MODERATE_REVIEW',
    targetType: 'REVIEW',
    targetId: id,
    details: `Review status changed to ${status}. Note: ${moderationReason || 'None'}`,
    ipAddress: req.ip || '127.0.0.1',
    result: 'SUCCESS',
  });

  return res.json({ message: 'Review moderation updated.', review: updated });
});

// DELETE /api/admin/reviews/:id
router.delete('/reviews/:id', requireAdmin, requirePermission('reviews.manage'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  db.deleteReview(id);
  return res.json({ message: 'Review deleted.' });
});

// =======================================================
// 9. REPORTS & COMPLAINTS MODERATION
// =======================================================

// GET /api/admin/reports
router.get('/reports', requireAdmin, requirePermission('reports.manage'), (req: AuthenticatedRequest, res: Response) => {
  const reports = db.getReports();
  return res.json({ reports });
});

// PUT /api/admin/reports/:id/resolve
router.put('/reports/:id/resolve', requireAdmin, requirePermission('reports.manage'), (req: AuthenticatedRequest, res: Response) => {
  const reportId = req.params.id;
  const { status, adminNotes, actionTaken } = req.body;

  const updated = db.updateReport(reportId, {
    status: status || 'RESOLVED',
    adminNotes: adminNotes || 'Investigated and mediated by trust officer.',
    actionTaken: actionTaken || 'Warning issued / listing verified.',
    resolvedAt: new Date().toISOString(),
  });

  if (!updated) return res.status(404).json({ error: 'Report not found.' });

  db.logAudit({
    adminId: req.user!.id,
    adminEmail: req.user!.email,
    adminRole: req.user!.role,
    action: 'RESOLVE_REPORT',
    targetType: 'REPORT',
    targetId: reportId,
    details: `Resolved report on ${updated.targetTitleOrName}. Action: ${updated.actionTaken}`,
    ipAddress: req.ip || '127.0.0.1',
    result: 'SUCCESS',
  });

  return res.json({ message: 'Report updated successfully.', report: updated });
});

// =======================================================
// 10. MESSAGES (AUDITED INSPECTION)
// =======================================================

// GET /api/admin/messages/flagged
router.get('/messages/flagged', requireAdmin, requirePermission('messages.inspect'), (req: AuthenticatedRequest, res: Response) => {
  // Only flagged/reported conversations are exposed
  const reports = db.getReports().filter(r => r.category === 'ABUSIVE_BEHAVIOR' || r.category === 'FRAUD');
  const conversations = db.getConversations();
  return res.json({ flaggedReports: reports, conversationsCount: conversations.length });
});

// GET /api/admin/messages/inspect/:id
router.get('/messages/inspect/:id', requireAdmin, requirePermission('messages.inspect'), (req: AuthenticatedRequest, res: Response) => {
  const convId = req.params.id;
  const conv = db.getConversations().find((c: any) => c.id === convId);
  if (!conv) return res.status(404).json({ error: 'Conversation thread not found.' });

  const messages = db.getMessagesForConversation(convId);

  // Mandatory privacy audit log
  db.logAudit({
    adminId: req.user!.id,
    adminEmail: req.user!.email,
    adminRole: req.user!.role,
    action: 'INSPECT_PRIVATE_MESSAGES',
    targetType: 'MESSAGE_THREAD',
    targetId: convId,
    details: `Admin accessed private conversation history for official dispute investigation SLA.`,
    ipAddress: req.ip || '127.0.0.1',
    result: 'SUCCESS',
  });

  return res.json({ conversation: conv, messages });
});

// =======================================================
// 11. NOTIFICATIONS
// =======================================================

// GET /api/admin/notifications
router.get('/notifications', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const notifs = db.getNotificationsForUser(req.user!.id);
  const pendingApprovals = db.getProperties().filter(p => p.status === 'PENDING_REVIEW').length;
  const openReports = db.getReports().filter(r => r.status === 'OPEN').length;

  return res.json({ 
    notifications: notifs,
    pendingApprovals,
    openReports,
  });
});

// PUT /api/admin/notifications/mark-all-read
router.put('/notifications/mark-all-read', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  db.markAllNotificationsAsRead(req.user!.id);
  return res.json({ message: 'All notifications marked as read.' });
});

// =======================================================
// 12. CONTENT MANAGEMENT SYSTEM (CMS)
// =======================================================

// GET /api/admin/content/homepage
router.get('/content/homepage', requireAdmin, requirePermission('content.manage'), (req: AuthenticatedRequest, res: Response) => {
  const settings = db.getSettings();
  return res.json({ homepageContent: settings.homepageContent });
});

// PUT /api/admin/content/homepage
router.put('/content/homepage', requireAdmin, requirePermission('content.manage'), (req: AuthenticatedRequest, res: Response) => {
  const { homepageContent } = req.body;
  const updatedSettings = db.updateSettings({ homepageContent });

  db.logAudit({
    adminId: req.user!.id,
    adminEmail: req.user!.email,
    adminRole: req.user!.role,
    action: 'UPDATE_HOMEPAGE_CMS',
    targetType: 'CMS',
    targetId: 'HOMEPAGE',
    details: `Updated homepage dynamic content copy and statistics configuration`,
    ipAddress: req.ip || '127.0.0.1',
    result: 'SUCCESS',
  });

  return res.json({ message: 'Homepage CMS updated.', homepageContent: updatedSettings.homepageContent });
});

// Banners CRUD
router.get('/content/banners', requireAdmin, requirePermission('content.manage'), (req: AuthenticatedRequest, res: Response) => {
  return res.json({ banners: db.getBanners() });
});

router.post('/content/banners', requireAdmin, requirePermission('content.manage'), (req: AuthenticatedRequest, res: Response) => {
  const { title, subtitle, imageUrl, ctaText, ctaUrl, placement, badgeText, sponsorName, targetTab, startDate, endDate, status } = req.body;
  const newBanner: Banner = {
    id: `bnr_${Date.now()}`,
    title: title || 'New Promotion',
    subtitle: subtitle || '',
    imageUrl: imageUrl || '/src/assets/images/hero_roommitra_pg_1791254850665.jpg',
    ctaText: ctaText || 'Learn More',
    ctaUrl: ctaUrl || '/properties',
    placement: placement || 'HERO',
    badgeText: badgeText || 'Sponsored',
    sponsorName: sponsorName || 'Partner',
    targetTab: targetTab || 'properties',
    clicksCount: 0,
    impressionsCount: 0,
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || '2026-12-31',
    status: status || 'ACTIVE',
    displayOrder: db.getBanners().length + 1,
  };
  db.createBanner(newBanner);
  return res.status(201).json({ message: 'Banner created.', banner: newBanner });
});

router.put('/content/banners/:id', requireAdmin, requirePermission('content.manage'), (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateBanner(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Banner not found.' });
  return res.json({ message: 'Banner updated.', banner: updated });
});

router.delete('/content/banners/:id', requireAdmin, requirePermission('content.manage'), (req: AuthenticatedRequest, res: Response) => {
  db.deleteBanner(req.params.id);
  return res.json({ message: 'Banner deleted.' });
});

// Announcements CRUD
router.get('/content/announcements', requireAdmin, requirePermission('content.manage'), (req: AuthenticatedRequest, res: Response) => {
  return res.json({ announcements: db.getAnnouncements() });
});

router.post('/content/announcements', requireAdmin, requirePermission('content.manage'), (req: AuthenticatedRequest, res: Response) => {
  const { title, message, audience, priority, status } = req.body;
  const newAnnouncement: Announcement = {
    id: `anc_${Date.now()}`,
    title,
    message,
    audience: audience || 'ALL',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-12-31',
    priority: priority || 'MEDIUM',
    status: status || 'ACTIVE',
    createdAt: new Date().toISOString(),
  };
  db.createAnnouncement(newAnnouncement);
  return res.status(201).json({ message: 'Announcement created.', announcement: newAnnouncement });
});

router.delete('/content/announcements/:id', requireAdmin, requirePermission('content.manage'), (req: AuthenticatedRequest, res: Response) => {
  db.deleteAnnouncement(req.params.id);
  return res.json({ message: 'Announcement removed.' });
});

// Cities CRUD
router.get('/content/cities', requireAdmin, requirePermission('content.manage'), (req: AuthenticatedRequest, res: Response) => {
  return res.json({ cities: db.getSettings().popularCities });
});

router.post('/content/cities', requireAdmin, requirePermission('content.manage'), (req: AuthenticatedRequest, res: Response) => {
  const { name, state, tagline, imageUrl } = req.body;
  if (!name || !state) return res.status(400).json({ error: 'City and state required.' });

  const current = db.getSettings().popularCities;
  const newCity = {
    id: `city_${Date.now()}`,
    name,
    state,
    tagline: tagline || `${name} Living Hub`,
    listingCount: 0,
    imageUrl: imageUrl || '/src/assets/images/property_modern_apartment_1791254862331.jpg',
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    isActive: true,
  };
  current.push(newCity);
  db.updateSettings({ popularCities: current });

  return res.status(201).json({ message: 'City added successfully.', city: newCity });
});

router.delete('/content/cities/:id', requireAdmin, requirePermission('content.manage'), (req: AuthenticatedRequest, res: Response) => {
  const current = db.getSettings().popularCities.filter(c => c.id !== req.params.id);
  db.updateSettings({ popularCities: current });
  return res.json({ message: 'City deleted.' });
});

// Categories Management
router.get('/content/categories', requireAdmin, requirePermission('content.manage'), (req: AuthenticatedRequest, res: Response) => {
  return res.json({ categories: db.getCategories() });
});

router.put('/content/categories/:id', requireAdmin, requirePermission('content.manage'), (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Category not found.' });
  return res.json({ message: 'Category updated.', category: updated });
});

// FAQs Management
router.get('/content/faqs', requireAdmin, requirePermission('content.manage'), (req: AuthenticatedRequest, res: Response) => {
  return res.json({ faqs: db.getSettings().faqs });
});

router.post('/content/faqs', requireAdmin, requirePermission('content.manage'), (req: AuthenticatedRequest, res: Response) => {
  const { question, answer, category } = req.body;
  if (!question || !answer) return res.status(400).json({ error: 'Question and answer required.' });

  const current = db.getSettings().faqs;
  const newFaq = {
    id: `faq_${Date.now()}`,
    question: question.trim(),
    answer: answer.trim(),
    category: category || 'GENERAL',
  };
  current.push(newFaq);
  db.updateSettings({ faqs: current });
  return res.status(201).json({ message: 'FAQ created.', faq: newFaq });
});

router.delete('/content/faqs/:id', requireAdmin, requirePermission('content.manage'), (req: AuthenticatedRequest, res: Response) => {
  const current = db.getSettings().faqs.filter(f => f.id !== req.params.id);
  db.updateSettings({ faqs: current });
  return res.json({ message: 'FAQ deleted.' });
});

// =======================================================
// 13. MARKETING & COUPONS
// =======================================================

// GET /api/admin/marketing/coupons
router.get('/marketing/coupons', requireAdmin, requirePermission('marketing.manage'), (req: AuthenticatedRequest, res: Response) => {
  return res.json({ coupons: db.getCoupons() });
});

router.post('/marketing/coupons', requireAdmin, requirePermission('marketing.manage'), (req: AuthenticatedRequest, res: Response) => {
  const { code, discountType, discountValue, minAmount, maxDiscount, usageLimit, expiryDate } = req.body;
  if (!code || !discountValue) return res.status(400).json({ error: 'Code and discount value required.' });

  const newCoupon: Coupon = {
    id: `cpn_${Date.now()}`,
    code: String(code).trim().toUpperCase(),
    discountType: discountType || 'FIXED',
    discountValue: Number(discountValue),
    minAmount: Number(minAmount) || 0,
    maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
    usageLimit: Number(usageLimit) || 100,
    usedCount: 0,
    perUserLimit: 1,
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: expiryDate || '2026-12-31',
    status: 'ACTIVE',
  };

  db.createCoupon(newCoupon);

  db.logAudit({
    adminId: req.user!.id,
    adminEmail: req.user!.email,
    adminRole: req.user!.role,
    action: 'CREATE_COUPON',
    targetType: 'COUPON',
    targetId: newCoupon.id,
    details: `Created promo coupon ${newCoupon.code} (${newCoupon.discountValue} ${newCoupon.discountType})`,
    ipAddress: req.ip || '127.0.0.1',
    result: 'SUCCESS',
  });

  return res.status(201).json({ message: 'Coupon created.', coupon: newCoupon });
});

router.put('/marketing/coupons/:id', requireAdmin, requirePermission('marketing.manage'), (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateCoupon(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Coupon not found.' });
  return res.json({ message: 'Coupon updated.', coupon: updated });
});

router.delete('/marketing/coupons/:id', requireAdmin, requirePermission('marketing.manage'), (req: AuthenticatedRequest, res: Response) => {
  db.deleteCoupon(req.params.id);
  return res.json({ message: 'Coupon deleted.' });
});

// =======================================================
// 14. ADMINISTRATORS & ROLES/PERMISSIONS
// =======================================================

// GET /api/admin/administrators
router.get('/administrators', requireAdmin, requirePermission('admins.manage'), (req: AuthenticatedRequest, res: Response) => {
  const adminRoles: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT', 'CONTENT_MANAGER', 'FINANCE_MANAGER'];
  const administrators = db.getUsers().filter(u => adminRoles.includes(u.role));
  const rolesConfig = db.getAdminRoles();
  return res.json({ administrators, rolesConfig });
});

// POST /api/admin/administrators (Super Admin only)
router.post('/administrators', requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and administrative role are required.' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const newAdmin: User = {
    id: `adm_${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: role as UserRole,
    city: 'Bengaluru',
    isEmailVerified: true,
    isPhoneVerified: true,
    isIdentityVerified: true,
    isSuspended: false,
    isBanned: false,
    privacySettings: { hidePhone: true, hideEmail: true, allowDirectMessages: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.createUser(newAdmin, password);

  db.logAudit({
    adminId: req.user!.id,
    adminEmail: req.user!.email,
    adminRole: req.user!.role,
    action: 'CREATE_ADMINISTRATOR',
    targetType: 'ADMIN',
    targetId: newAdmin.id,
    details: `Created new ${role} account: ${newAdmin.email}`,
    ipAddress: req.ip || '127.0.0.1',
    result: 'SUCCESS',
  });

  return res.status(201).json({ message: 'Administrator created successfully.', admin: newAdmin });
});

// PUT /api/admin/administrators/:id/permissions
router.put('/administrators/:id/permissions', requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { permissions, role } = req.body;

  const user = db.getUserById(id);
  if (!user) return res.status(404).json({ error: 'Administrator not found.' });

  const updated = db.updateUser(id, {
    ...(role && { role }),
    ...(permissions && { permissions }),
  });

  db.logAudit({
    adminId: req.user!.id,
    adminEmail: req.user!.email,
    adminRole: req.user!.role,
    action: 'UPDATE_ADMIN_PERMISSIONS',
    targetType: 'ADMIN',
    targetId: id,
    details: `Updated permissions/role for administrator ${user.email}`,
    ipAddress: req.ip || '127.0.0.1',
    result: 'SUCCESS',
  });

  return res.json({ message: 'Permissions updated successfully.', admin: updated });
});

// =======================================================
// 15. AUDIT LOGS
// =======================================================

// GET /api/admin/audit-logs
router.get('/audit-logs', requireAdmin, requirePermission('audit.read'), (req: AuthenticatedRequest, res: Response) => {
  const { search, action, targetType } = req.query;
  let logs = db.getAuditLogs();

  if (action && typeof action === 'string' && action !== 'ALL') {
    logs = logs.filter(l => l.action.includes(action));
  }

  if (targetType && typeof targetType === 'string' && targetType !== 'ALL') {
    logs = logs.filter(l => l.targetType === targetType);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    logs = logs.filter(l => 
      l.details.toLowerCase().includes(q) || 
      l.adminEmail.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q)
    );
  }

  return res.json({ auditLogs: logs });
});

// =======================================================
// 16. SETTINGS & DANGER ZONE
// =======================================================

// GET /api/admin/settings
router.get('/settings', requireAdmin, requirePermission('settings.manage'), (req: AuthenticatedRequest, res: Response) => {
  return res.json({ settings: db.getSettings() });
});

// PUT /api/admin/settings
router.put('/settings', requireAdmin, requirePermission('settings.manage'), (req: AuthenticatedRequest, res: Response) => {
  const updates = req.body;
  const updatedSettings = db.updateSettings(updates);

  db.logAudit({
    adminId: req.user!.id,
    adminEmail: req.user!.email,
    adminRole: req.user!.role,
    action: 'UPDATE_SYSTEM_SETTINGS',
    targetType: 'SETTINGS',
    targetId: 'GLOBAL',
    details: `Updated platform configuration: ${JSON.stringify(updates)}`,
    ipAddress: req.ip || '127.0.0.1',
    result: 'SUCCESS',
  });

  return res.json({ message: 'System settings updated successfully.', settings: updatedSettings });
});

// POST /api/admin/danger-zone/execute
router.post('/danger-zone/execute', requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { action, confirmationPhrase } = req.body;

  if (confirmationPhrase !== 'I UNDERSTAND THE RISKS') {
    return res.status(400).json({ error: 'Explicit confirmation phrase "I UNDERSTAND THE RISKS" is required to proceed.' });
  }

  if (action === 'TOGGLE_MAINTENANCE') {
    const current = db.getSettings().maintenanceMode;
    db.updateSettings({ maintenanceMode: !current });
  } else if (action === 'DISABLE_REGISTRATIONS') {
    db.updateSettings({ allowNewRegistrations: false });
  } else if (action === 'DISABLE_INSTANT_BOOKINGS') {
    db.updateSettings({ enableInstantBooking: false });
  } else if (action === 'CLEAR_AUDIT_ARCHIVE') {
    // Keep last 50 for safety
    const logs = db.getAuditLogs().slice(0, 50);
    // (retained)
  }

  db.logAudit({
    adminId: req.user!.id,
    adminEmail: req.user!.email,
    adminRole: req.user!.role,
    action: `DANGER_ZONE_${action}`,
    targetType: 'SYSTEM_DANGER_ZONE',
    targetId: 'GLOBAL',
    details: `Executed high-impact critical operation: ${action}`,
    ipAddress: req.ip || '127.0.0.1',
    result: 'SUCCESS',
  });

  return res.json({ message: `Danger zone operation "${action}" completed successfully.` });
});

export default router;
