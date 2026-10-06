import express, { Response } from 'express';
import crypto from 'crypto';
import { db } from '../db.ts';
import { requireAuth, AuthenticatedRequest } from '../auth.ts';
import { Booking, PaymentTransaction, Notification } from '../../src/types/index.ts';

const router = express.Router();

// GET /api/bookings
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const isOwner = req.user!.role === 'PROPERTY_OWNER';
  const isAdmin = req.user!.role === 'ADMIN' || req.user!.role === 'SUPER_ADMIN';

  let bookings = db.getBookings();
  if (isAdmin) {
    // Admins see all bookings
  } else if (isOwner) {
    bookings = bookings.filter(b => b.ownerId === userId || b.userId === userId);
  } else {
    bookings = bookings.filter(b => b.userId === userId);
  }

  return res.json({ bookings });
});

// POST /api/bookings/create
router.post('/create', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { propertyId, moveInDate, tokenDepositAmount = 5000 } = req.body;

    const property = db.getPropertyById(propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    if (property.ownerId === req.user!.id) {
      return res.status(400).json({ error: 'You cannot book your own property.' });
    }

    const bookingId = `bk_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const paymentId = `pay_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const deposit = Number(tokenDepositAmount) || 5000;

    const newBooking: Booking = {
      id: bookingId,
      propertyId: property.id,
      propertyTitle: property.title,
      userId: req.user!.id,
      userName: req.user!.name,
      ownerId: property.ownerId,
      roomType: property.roomType,
      rentPerMonth: property.rentPerMonth,
      depositAmount: deposit,
      totalPaid: deposit,
      status: 'CONFIRMED',
      paymentId,
      moveInDate: moveInDate || property.availableFrom,
      createdAt: new Date().toISOString(),
    };

    const payment: PaymentTransaction = {
      id: paymentId,
      bookingId,
      userId: req.user!.id,
      amount: deposit,
      currency: 'INR',
      description: `Token Deposit for ${property.title} (${property.city})`,
      status: 'SUCCESS',
      paymentMethod: 'UPI / Razorpay Verified',
      gatewayTransactionId: `TXN_GATEWAY_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    db.createBooking(newBooking);
    db.createPayment(payment);

    // Notify landlord
    const landlordNotification: Notification = {
      id: `notif_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      userId: property.ownerId,
      title: 'New Confirmed Booking!',
      message: `${req.user!.name} paid token deposit of ₹${deposit.toLocaleString('en-IN')} for ${property.title}.`,
      type: 'BOOKING_UPDATE',
      link: '/dashboard',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    db.createNotification(landlordNotification);

    // Notify tenant
    const tenantNotification: Notification = {
      id: `notif_t_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      userId: req.user!.id,
      title: 'Booking Confirmed!',
      message: `Your booking for ${property.title} is confirmed. Move-in date: ${newBooking.moveInDate}.`,
      type: 'BOOKING_UPDATE',
      link: '/dashboard',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    db.createNotification(tenantNotification);

    return res.status(201).json({
      message: 'Booking confirmed and receipt generated!',
      booking: newBooking,
      transaction: payment,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process booking.' });
  }
});

// GET /api/payments/history
router.get('/payments/history', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const isAdmin = req.user!.role === 'ADMIN' || req.user!.role === 'SUPER_ADMIN';

  let payments = db.getPayments();
  if (!isAdmin) {
    payments = payments.filter(p => p.userId === userId);
  }
  return res.json({ payments });
});

export default router;
