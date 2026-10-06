import express, { Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth.ts';

const router = express.Router();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// POST /api/upload
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { dataUrl, fileName } = req.body;

    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ error: 'Image data URL is required.' });
    }

    // MIME type check
    const match = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid file format. Only base64 encoded images are accepted.' });
    }

    const mimeType = match[1].toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return res.status(400).json({ 
        error: `Unsupported file type: ${mimeType}. Only JPG, PNG, and WebP images are permitted.` 
      });
    }

    // Size check
    const base64Data = dataUrl.replace(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/, '');
    const approximateSizeBytes = (base64Data.length * 3) / 4;

    if (approximateSizeBytes > MAX_SIZE_BYTES) {
      return res.status(400).json({ error: 'File size exceeds maximum permitted limit of 5MB.' });
    }

    // In production, this uploads to S3 or persistent storage; for dev preview, return valid sanitized dataUrl
    return res.json({
      url: dataUrl,
      fileName: fileName ? String(fileName).replace(/[^a-zA-Z0-9._-]/g, '_') : 'uploaded_image.jpg',
      size: approximateSizeBytes,
      message: 'Image uploaded and validated successfully.',
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process file upload.' });
  }
});

export default router;
