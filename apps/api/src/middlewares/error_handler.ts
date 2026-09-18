import { ValidationError } from '@vinejs/vine';
import type { NextFunction, Request, Response } from 'express';
import { pinoConfig } from '#config/logger';

/**
 * Middleware d'erreur global : convertit les erreurs connues en réponses JSON.
 *
 * - `ValidationError` (VineJS) → `422` avec le détail des champs
 * - JSON malformé (`SyntaxError` de `express.json`) → `400`
 * - tout le reste → `500` (loggé via pino)
 */
export function errorHandler(error: unknown, _req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof ValidationError) {
    return res.status(422).json({ message: 'Validation failed', errors: error.messages });
  }

  if (
    error instanceof SyntaxError &&
    (error as SyntaxError & { type?: string }).type === 'entity.parse.failed'
  ) {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }

  pinoConfig.error({ error });
  return res.status(500).json({ message: 'Internal server error' });
}
