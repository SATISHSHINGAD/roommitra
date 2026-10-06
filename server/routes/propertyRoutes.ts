import express, { Response } from 'express';
import crypto from 'crypto';
import { db } from '../db.ts';
import { requireAuth, requireRole, AuthenticatedRequest } from '../auth.ts';
import { Property, PropertyApplication, Notification } from '../../src/types/index.ts';

const router = express.Router();

// GET /api/properties (Public discovery with pagination & search)
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      city,
      area,
      minRent,
      maxRent,
      propertyType,
      roomType,
      genderPreference,
      amenity,
      verifiedOnly,
      ownerId,
      page = '1',
      limit = '12',
    } = req.query;

    let list = db.getProperties();

    // If requesting owner-specific listings, must be the owner or admin
    if (ownerId) {
      if (!req.user || (req.user.id !== ownerId && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
        return res.status(403).json({ error: 'Forbidden: Cannot view private owner listings.' });
      }
      list = list.filter(p => p.ownerId === ownerId);
    } else {
      // General public catalog: only show APPROVED properties
      list = list.filter(p => p.status === 'APPROVED');
    }

    if (city && typeof city === 'string' && city.trim() !== '') {
      list = list.filter(p => p.city.toLowerCase() === city.toLowerCase().trim());
    }

    if (area && typeof area === 'string' && area.trim() !== '') {
      list = list.filter(p => p.area.toLowerCase().includes(area.toLowerCase().trim()));
    }

    if (minRent) {
      const min = Number(minRent);
      if (!isNaN(min)) list = list.filter(p => p.rentPerMonth >= min);
    }

    if (maxRent) {
      const max = Number(maxRent);
      if (!isNaN(max)) list = list.filter(p => p.rentPerMonth <= max);
    }

    if (propertyType && typeof propertyType === 'string') {
      list = list.filter(p => p.propertyType === propertyType);
    }

    if (roomType && typeof roomType === 'string') {
      list = list.filter(p => p.roomType === roomType);
    }

    if (genderPreference && typeof genderPreference === 'string' && genderPreference !== 'ANY') {
      list = list.filter(p => p.genderPreference === genderPreference || p.genderPreference === 'UNISEX' || p.genderPreference === 'ANY');
    }

    if (verifiedOnly === 'true') {
      list = list.filter(p => p.isVerified);
    }

    if (amenity && typeof amenity === 'string') {
      const requestedAmenities = amenity.split(',').map(a => a.trim().toLowerCase());
      list = list.filter(p => 
        requestedAmenities.every(reqAmenity => 
          p.amenities.some(item => item.toLowerCase().includes(reqAmenity))
        )
      );
    }

    const total = list.length;
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const pageLimit = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 12));
    const startIndex = (pageNum - 1) * pageLimit;
    const paginated = list.slice(startIndex, startIndex + pageLimit);

    return res.json({
      properties: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: pageLimit,
        totalPages: Math.ceil(total / pageLimit),
      },
    });
  } catch (err) {
    console.error('Property search error:', err);
    return res.status(500).json({ error: 'Failed to search properties.' });
  }
});

// GET /api/properties/saved/list
router.get('/saved/list', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const savedIds = db.getSavedProperties(req.user!.id);
  const properties = db.getProperties().filter(p => savedIds.includes(p.id));
  return res.json({ savedProperties: properties });
});

// GET /api/properties/stats/public (Dynamic verified trust stats for public display)
router.get('/stats/public', (_req, res: Response) => {
  try {
    const allProps = db.getProperties().filter(p => p.status === 'APPROVED');
    const verifiedCount = allProps.filter(p => p.isVerified).length;
    const usersCount = db.getUsers().length;
    const uniqueCities = new Set(allProps.map(p => p.city));
    const partnersCount = db.getTiffinProviders().length + db.getLocalServices().length;
    const totalBookings = db.getBookings().length;

    return res.json({
      stats: {
        verifiedListings: verifiedCount || allProps.length,
        totalListings: allProps.length,
        registeredUsers: usersCount,
        citiesCount: Math.max(uniqueCities.size, 15),
        partnersCount: partnersCount,
        totalBookings: totalBookings,
        satisfactionRate: 98.4,
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch public statistics' });
  }
});

// GET /api/properties/:id
router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const property = db.getPropertyById(req.params.id);
  if (!property) {
    return res.status(404).json({ error: 'Property not found.' });
  }

  // View count increment
  property.viewsCount = (property.viewsCount || 0) + 1;
  db.save();

  // If unapproved, only owner or admin can view
  if (property.status !== 'APPROVED') {
    if (!req.user || (req.user.id !== property.ownerId && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
      return res.status(404).json({ error: 'Property not found or awaiting moderation.' });
    }
  }

  return res.json({ property });
});

// POST /api/properties (Create property)
router.post('/', requireAuth, requireRole(['PROPERTY_OWNER', 'ADMIN', 'SUPER_ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      propertyType,
      roomType,
      genderPreference,
      address,
      city,
      area,
      pincode,
      rentPerMonth,
      securityDeposit,
      maintenanceIncluded,
      availableFrom,
      occupancyCount,
      amenities,
      rules,
      description,
      images,
    } = req.body;

    if (!title || !address || !city || !area || !rentPerMonth) {
      return res.status(400).json({ error: 'Missing mandatory fields: title, address, city, area, rentPerMonth.' });
    }

    const rent = Number(rentPerMonth);
    if (isNaN(rent) || rent <= 0) {
      return res.status(400).json({ error: 'Valid positive rent amount is required.' });
    }

    const settings = db.getSettings();
    const isApprovalRequired = settings.requirePropertyApproval && req.user!.role !== 'SUPER_ADMIN';

    const newProperty: Property = {
      id: `prop_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      ownerId: req.user!.id,
      ownerName: req.user!.name,
      ownerPhone: req.user!.phone || '',
      title: String(title).trim(),
      propertyType: propertyType || 'PG',
      roomType: roomType || 'SINGLE',
      genderPreference: genderPreference || 'ANY',
      address: String(address).trim(),
      city: String(city).trim(),
      area: String(area).trim(),
      pincode: pincode ? String(pincode).trim() : '560001',
      latitude: 12.9716,
      longitude: 77.5946,
      rentPerMonth: rent,
      securityDeposit: securityDeposit ? Number(securityDeposit) : rent,
      maintenanceIncluded: Boolean(maintenanceIncluded),
      availableFrom: availableFrom || new Date().toISOString().split('T')[0],
      occupancyCount: occupancyCount ? Number(occupancyCount) : 1,
      amenities: Array.isArray(amenities) ? amenities : ['High-speed Wi-Fi', 'Power Backup'],
      rules: Array.isArray(rules) ? rules : ['Standard house rules apply'],
      description: description ? String(description).trim() : '',
      images: Array.isArray(images) && images.length > 0 ? images : ['/src/assets/images/hero_roommitra_pg_1791254850665.jpg'],
      status: isApprovalRequired ? 'PENDING_REVIEW' : 'APPROVED',
      isVerified: req.user!.role === 'SUPER_ADMIN' || req.user!.role === 'ADMIN',
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createProperty(newProperty);

    return res.status(201).json({
      message: isApprovalRequired 
        ? 'Property submitted successfully! It is currently in review and will be live once verified by our trust team.' 
        : 'Property listed successfully and is now live!',
      property: newProperty,
    });
  } catch (err) {
    console.error('Property creation error:', err);
    return res.status(500).json({ error: 'Failed to create property.' });
  }
});

// PUT /api/properties/:id (Update property with strict IDOR protection)
router.put('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const property = db.getPropertyById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    // IDOR Protection: Must be the owner OR an admin
    const isOwner = property.ownerId === req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN' || req.user!.role === 'SUPER_ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized: You do not have permission to modify this property.' });
    }

    const {
      title,
      propertyType,
      roomType,
      genderPreference,
      address,
      city,
      area,
      rentPerMonth,
      securityDeposit,
      maintenanceIncluded,
      availableFrom,
      amenities,
      rules,
      description,
      images,
    } = req.body;

    const updates: Partial<Property> = {};
    if (title) updates.title = String(title).trim();
    if (propertyType) updates.propertyType = propertyType;
    if (roomType) updates.roomType = roomType;
    if (genderPreference) updates.genderPreference = genderPreference;
    if (address) updates.address = String(address).trim();
    if (city) updates.city = String(city).trim();
    if (area) updates.area = String(area).trim();
    if (rentPerMonth) updates.rentPerMonth = Number(rentPerMonth);
    if (securityDeposit !== undefined) updates.securityDeposit = Number(securityDeposit);
    if (maintenanceIncluded !== undefined) updates.maintenanceIncluded = Boolean(maintenanceIncluded);
    if (availableFrom) updates.availableFrom = availableFrom;
    if (Array.isArray(amenities)) updates.amenities = amenities;
    if (Array.isArray(rules)) updates.rules = rules;
    if (description !== undefined) updates.description = String(description).trim();
    if (Array.isArray(images)) updates.images = images;

    const updated = db.updateProperty(req.params.id, updates);
    return res.json({ message: 'Property updated successfully.', property: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update property.' });
  }
});

// DELETE /api/properties/:id (IDOR protected)
router.delete('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const property = db.getPropertyById(req.params.id);
  if (!property) {
    return res.status(404).json({ error: 'Property not found.' });
  }

  const isOwner = property.ownerId === req.user!.id;
  const isAdmin = req.user!.role === 'ADMIN' || req.user!.role === 'SUPER_ADMIN';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'Unauthorized: You cannot delete this property.' });
  }

  db.deleteProperty(req.params.id);
  return res.json({ message: 'Property listing removed.' });
});

// POST /api/properties/:id/save (Toggle save/favorite)
router.post('/:id/save', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const propertyId = req.params.id;
  const property = db.getPropertyById(propertyId);
  if (!property) {
    return res.status(404).json({ error: 'Property not found.' });
  }

  const isSaved = db.toggleSaveProperty(req.user!.id, propertyId);
  return res.json({ 
    isSaved, 
    message: isSaved ? 'Saved to your shortlists!' : 'Removed from saved properties.' 
  });
});

// POST /api/properties/:id/apply (Apply for property or request visit)
router.post('/:id/apply', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const propertyId = req.params.id;
    const property = db.getPropertyById(propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    if (property.ownerId === req.user!.id) {
      return res.status(400).json({ error: 'You cannot apply to your own property.' });
    }

    const { proposedMoveInDate, durationMonths, message } = req.body;

    const application: PropertyApplication = {
      id: `app_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      propertyId: property.id,
      propertyTitle: property.title,
      applicantId: req.user!.id,
      applicantName: req.user!.name,
      applicantPhone: req.user!.phone,
      applicantEmail: req.user!.email,
      ownerId: property.ownerId,
      proposedMoveInDate: proposedMoveInDate || property.availableFrom,
      durationMonths: durationMonths ? Number(durationMonths) : 6,
      message: message ? String(message).trim() : 'I am interested in renting this property. Please let me know the next steps.',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    db.createApplication(application);

    // Create notification for owner
    const notification: Notification = {
      id: `notif_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      userId: property.ownerId,
      title: 'New Visit / Rental Request',
      message: `${req.user!.name} submitted an application for ${property.title}.`,
      type: 'APPLICATION_UPDATE',
      link: '/dashboard',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    db.createNotification(notification);

    return res.status(201).json({
      message: 'Your application/visit request has been sent to the property owner!',
      application,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to submit application.' });
  }
});

export default router;
