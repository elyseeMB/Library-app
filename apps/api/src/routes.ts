import type { Express } from 'express';
import { Router } from 'express';
import { loadRoute } from '#config/routing';
import { httpCache } from '#middlewares/cache';
import { ensureJson } from '#middlewares/ensure_json';

export async function registerRoutes(app: Express) {
  const api = Router();

  /** Authors */
  await loadRoute(api, () => import('#actions/authors/get_author'), [httpCache(60)]);
  await loadRoute(api, () => import('#actions/authors/show_author'), [httpCache(60)]);
  await loadRoute(api, () => import('#actions/authors/store_author'), [ensureJson]);
  await loadRoute(api, () => import('#actions/authors/update_author'), [ensureJson]);
  await loadRoute(api, () => import('#actions/authors/destroy_author'));

  /** Books */
  await loadRoute(api, () => import('#actions/books/list_books'), [httpCache(30)]);
  await loadRoute(api, () => import('#actions/books/show_book'), [httpCache(30)]);
  await loadRoute(api, () => import('#actions/books/store_book'), [ensureJson]);
  await loadRoute(api, () => import('#actions/books/update_book'), [ensureJson]);
  await loadRoute(api, () => import('#actions/books/destroy_book'));

  /** Members */
  await loadRoute(api, () => import('#actions/members/list_member'), [httpCache(30)]);
  await loadRoute(api, () => import('#actions/members/show_member'), [httpCache(30)]);
  await loadRoute(api, () => import('#actions/members/store_member'), [ensureJson]);
  await loadRoute(api, () => import('#actions/members/update_member'), [ensureJson]);
  await loadRoute(api, () => import('#actions/members/destroy_member'));
  await loadRoute(api, () => import('#actions/members/get_member_loans'));

  /** Stats */
  await loadRoute(api, () => import('#actions/stats/get_stat'), [httpCache(60)]);

  /** Loans */
  await loadRoute(api, () => import('#actions/loans/list_loan'));
  await loadRoute(api, () => import('#actions/loans/store_loan'), [ensureJson]);
  await loadRoute(api, () => import('#actions/loans/return_loan'));

  app.use('/api/v1', api);
}
