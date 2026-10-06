import express, { Response } from 'express';
import crypto from 'crypto';
import { db } from '../db.ts';
import { requireAuth, requireRole, AuthenticatedRequest } from '../auth.ts';
import { TiffinProvider, PaymentTransaction, Notification } from '../../src/types/index.ts';

const router = express.Router();

// GET /api/services/tiffin (Approved tiffin providers)
router.get('/tiffin', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { city, dietType, maxPrice } = req.query;
    let list = db.getTiffinProviders().filter(p => p.verificationStatus === 'VERIFIED');

    if (city && typeof city === 'string' && city.trim() !== '') {
      list = list.filter(p => p.city.toLowerCase() === city.toLowerCase().trim());
    }

    if (dietType && typeof dietType === 'string') {
      list = list.filter(p => p.dietType === dietType);
    }

    if (maxPrice) {
      const p = Number(maxPrice);
      if (!isNaN(p)) {
        list = list.filter(item => item.pricePerMeal <= p);
      }
    }

    return res.json({ providers: list });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch tiffin services.' });
  }
});

// GET /api/services/local (Housekeeping, Movers, Laundry)
router.get('/local', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, city } = req.query;
    let list = db.getLocalServices();

    if (category && typeof category === 'string') {
      list = list.filter(s => s.category === category);
    }

    if (city && typeof city === 'string' && city.trim() !== '') {
      list = list.filter(s => s.city.toLowerCase() === city.toLowerCase().trim());
    }

    return res.json({ services: list });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch local services.' });
  }
});

// POST /api/services/tiffin (Register provider)
router.post('/tiffin', requireAuth, requireRole(['SERVICE_PROVIDER', 'ADMIN', 'SUPER_ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      businessName,
      contactPerson,
      phone,
      email,
      city,
      deliveryAreas,
      dietType,
      mealTypes,
      pricePerMeal,
      monthlySubscriptionPrice,
      fssaiNumber,
      description,
      sampleMenu,
    } = req.body;

    if (!businessName || !phone || !city || !pricePerMeal) {
      return res.status(400).json({ error: 'Business name, phone, city, and pricing are required.' });
    }

    const settings = db.getSettings();
    const needsApproval = settings.requireProviderApproval && req.user!.role !== 'SUPER_ADMIN';

    const provider: TiffinProvider = {
      id: `tif_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      providerId: req.user!.id,
      businessName: String(businessName).trim(),
      contactPerson: contactPerson ? String(contactPerson).trim() : req.user!.name,
      phone: String(phone).trim(),
      email: email ? String(email).trim() : req.user!.email,
      city: String(city).trim(),
      deliveryAreas: Array.isArray(deliveryAreas) ? deliveryAreas : ['Central City'],
      dietType: dietType || 'PURE_VEG',
      mealTypes: Array.isArray(mealTypes) ? mealTypes : ['LUNCH', 'DINNER'],
      pricePerMeal: Number(pricePerMeal),
      monthlySubscriptionPrice: monthlySubscriptionPrice ? Number(monthlySubscriptionPrice) : Number(pricePerMeal) * 30,
      hygieneRating: 4.8,
      fssaiNumber: fssaiNumber ? String(fssaiNumber).trim() : 'FSSAI_PENDING_DOCS',
      verificationStatus: needsApproval ? 'PENDING' : 'VERIFIED',
      sampleMenu: Array.isArray(sampleMenu) ? sampleMenu : [
        { day: 'Monday to Sunday', lunch: '4 Rotis, Sabzi, Dal, Rice, Salad', dinner: 'Homestyle Khichdi or Rotis, Dal Fry, Sabzi' }
      ],
      description: description ? String(description).trim() : 'Nutritious homestyle meals delivered hot.',
      imageUrl: '/src/assets/images/tiffin_food_thali_1791254883521.jpg',
      isAcceptingOrders: true,
      createdAt: new Date().toISOString(),
    };

    db.createTiffinProvider(provider);

    return res.status(201).json({
      message: needsApproval 
        ? 'Tiffin service submitted for verification. Our safety team will review your FSSAI certificate shortly.'
        : 'Tiffin service listed and live!',
      provider,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create service provider profile.' });
  }
});

// POST /api/services/subscribe (Order or subscribe to meal plan)
router.post('/subscribe', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { providerId, planType, address, deliverySlot } = req.body;
    const provider = db.getTiffinProviders().find(p => p.id === providerId);
    if (!provider) {
      return res.status(404).json({ error: 'Tiffin provider not found.' });
    }

    const amount = planType === 'MONTHLY' ? provider.monthlySubscriptionPrice : provider.pricePerMeal * 7;

    const payment: PaymentTransaction = {
      id: `pay_tif_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      userId: req.user!.id,
      amount,
      currency: 'INR',
      description: `${planType === 'MONTHLY' ? 'Monthly' : 'Weekly'} Meal Plan Subscription - ${provider.businessName}`,
      status: 'SUCCESS',
      paymentMethod: 'UPI',
      gatewayTransactionId: `TXN_TIF_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    db.createPayment(payment);

    // Notify provider
    const notif: Notification = {
      id: `notif_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      userId: provider.providerId,
      title: 'New Meal Subscription Order',
      message: `${req.user!.name} subscribed to your ${planType} meal plan for delivery at ${address || 'customer address'}.`,
      type: 'PAYMENT_UPDATE',
      link: '/dashboard',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    db.createNotification(notif);

    return res.status(201).json({
      message: `Subscription confirmed! First meal will arrive during ${deliverySlot || 'Lunch slot'}.`,
      transaction: payment,
    });
  } catch {
    return res.status(500).json({ error: 'Failed to process subscription order.' });
  }
});

export default router;
