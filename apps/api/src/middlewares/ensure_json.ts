import type { NextFunction, Request, Response } from 'express';

const METHODS_WITH_BODY = ['POST', 'PUT', 'PATCH'];

/**
 * Vérifie que les requêtes portant un body utilisent bien `Content-Type: application/json`.
 *
 * Les méthodes sans body (GET, DELETE...) sont ignorées. Répond `415 Unsupported Media Type` sinon.
 */
export function ensureJson(req: Request, res: Response, next: NextFunction) {
  if (!METHODS_WITH_BODY.includes(req.method)) {
    return next();
  }

  if (!req.is('application/json')) {
    return res.status(415).json({ message: 'Unsupported Media Type: expected application/json' });
  }
  return next();
}
