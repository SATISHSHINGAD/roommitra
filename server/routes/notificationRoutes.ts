import express, { Response } from 'express';
import { db } from '../db.ts';
import { requireAuth, AuthenticatedRequest } from '../auth.ts';

const router = express.Router();

// GET /api/notifications
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const notifs = db.getNotificationsForUser(req.user!.id);
  const unreadCount = notifs.filter(n => !n.isRead).length;
  return res.json({ notifications: notifs, unreadCount });
});

// PUT /api/notifications/:id/read
router.put('/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = db.markNotificationAsRead(req.params.id, req.user!.id);
  return res.json({ success });
});

// PUT /api/notifications/read-all
router.put('/read-all', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  db.markAllNotificationsAsRead(req.user!.id);
  return res.json({ success: true, message: 'All notifications marked as read.' });
});

export default router;
