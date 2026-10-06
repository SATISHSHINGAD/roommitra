import express, { Response } from 'express';
import crypto from 'crypto';
import { db } from '../db.ts';
import { requireAuth, AuthenticatedRequest } from '../auth.ts';
import { Report } from '../../src/types/index.ts';

const router = express.Router();

// POST /api/reports (Submit complaint/report)
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { targetType, targetId, targetTitleOrName, category, description } = req.body;

    if (!targetType || !targetId || !category || !description) {
      return res.status(400).json({ error: 'Missing report target, category, or description.' });
    }

    const report: Report = {
      id: `rep_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      reporterId: req.user!.id,
      reporterName: req.user!.name,
      targetType,
      targetId,
      targetTitleOrName: targetTitleOrName || 'Reported Entity',
      category,
      description: String(description).trim(),
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };

    db.createReport(report);

    return res.status(201).json({
      message: 'Complaint submitted successfully. Our trust and safety team will investigate within 24 hours.',
      report,
    });
  } catch {
    return res.status(500).json({ error: 'Failed to submit report.' });
  }
});

// GET /api/reports/my (User's complaints)
router.get('/my', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const reports = db.getReports().filter(r => r.reporterId === req.user!.id);
  return res.json({ reports });
});

export default router;
