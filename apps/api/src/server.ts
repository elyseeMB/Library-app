import '#config/env';
import express, { type Express } from 'express';
import { initHotReload, logger as pinoHttpLogger } from '#config/bootstrap';
import { pinoConfig as pinoLogger } from '#config/logger';

await initHotReload(import.meta.filename);

const app: Express = express();
app.use(pinoHttpLogger);

/**
 * Enregistre les routes de l'application [contrainte `hot-hook`]
 */
const { registerRoutes } = await import('./routes.ts');
await registerRoutes(app);

app.listen(3000, () => pinoLogger.info('Server on http://localhost:3000'));
