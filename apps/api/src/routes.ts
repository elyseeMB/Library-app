import type { Express } from 'express';
import { Router } from 'express';
import { loadRoute } from '#config/routing';

export async function registerRoutes(app: Express) {
  const api = Router();

  await loadRoute(api, () => import('#actions/books/store_book'));
  app.use('/api/v1', api);
}
