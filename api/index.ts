import type { VercelRequest, VercelResponse } from '@vercel/node';
import { appPromise } from '../server.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await appPromise;

  return new Promise<void>((resolve) => {
    res.on('finish', () => resolve());
    res.on('close', () => resolve());
    app(req, res, () => {
      if (!res.headersSent) {
        res.statusCode = 404;
        res.end('Not Found');
      }
      resolve();
    });
  });
}
