import { realpathSync } from 'node:fs';
import { hot } from 'hot-hook';
import { pinoHttp } from 'pino-http';
import { pinoConfig } from '#config/logger';

/**
 * Initialise `hot-hook` (hot reload) pour l'application.
 */
export async function initHotReload(entryFile: string) {
  await hot.init({
    root: realpathSync.native(entryFile),
  });
}

/**
 * Branche le middleware `pino-http` (utilisant le logger pino existant) pour logger les requêtes
 */
export const logger = pinoHttp({
  logger: pinoConfig,
  quietReqLogger: true,
  quietResLogger: true,
  customSuccessMessage: (req, res, responseTime) => {
    return `${req.method} ${req.url} ${res.statusCode} - ${responseTime}ms`;
  },
});
