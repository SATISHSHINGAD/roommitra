import express, { Response } from 'express';
import { db } from '../db.ts';

const router = express.Router();

// GET /api/content/banners
// Returns active banners/ads, optionally filtered by placement (e.g. HERO, PROPERTIES, TIFFIN, ROOMMATES, SERVICES, MIDPAGE, TOP_ALERT)
router.get('/banners', (req, res: Response) => {
  try {
    const { placement } = req.query;
    let banners = db.getBanners().filter(b => b.status === 'ACTIVE');

    if (placement && typeof placement === 'string') {
      banners = banners.filter(b => b.placement === placement);
    }

    // Automatically count impressions
    banners.forEach(b => {
      db.recordBannerImpression(b.id);
    });

    return res.json({ banners });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve active promotions.' });
  }
});

// POST /api/content/banners/:id/click
// Tracks click through rate
router.post('/banners/:id/click', (req, res: Response) => {
  try {
    const banner = db.recordBannerClick(req.params.id);
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found.' });
    }
    return res.json({ message: 'Click tracked.', clicks: banner.clicksCount });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to record promotion click.' });
  }
});

// GET /api/content/hero
// Returns current hero configuration managed by admin
router.get('/hero', (_req, res: Response) => {
  try {
    const settings = db.getSettings();
    const heroContent = settings.homepageContent || {
      heroTitle: 'Everything You Need For Living, All In One Place.',
      heroSubtitle: 'Find rooms, PGs, hostels, roommates, tiffin, laundry and everyday living services — all from one trusted platform.',
      heroBadgeText: 'Zero Brokerage Guaranteed',
      heroImage: '/src/assets/images/hero_roommitra_pg_1791254850665.jpg',
      primaryCtaText: 'Find Your Place',
      secondaryCtaText: 'List Your Property',
      statsConfig: {
        verifiedListings: '1,200+',
        activeUsers: '8,000+',
        citiesCovered: '15+',
        partnersCount: '50+',
        showStats: true,
      },
    };
    return res.json({ hero: heroContent });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve hero configuration.' });
  }
});

// GET /api/content/announcements
router.get('/announcements', (_req, res: Response) => {
  try {
    const announcements = db.getAnnouncements().filter(a => a.status === 'ACTIVE');
    return res.json({ announcements });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve announcements.' });
  }
});

export default router;
