import '#config/env';
import cors from 'cors';
import express, { type Express } from 'express';
import { initHotReload, logger as pinoHttpLogger } from '#config/bootstrap';
import { pinoConfig as pinoLogger } from '#config/logger';
import { errorHandler } from '#middlewares/error_handler';

await initHotReload(import.meta.filename);

const app: Express = express();
app.use(pinoHttpLogger);
app.use(cors());
app.use(express.json());

/**
 * Enregistre les routes de l'application [contrainte `hot-hook`]
 */
const { registerRoutes } = await import('./routes.ts');
await registerRoutes(app);

app.use(errorHandler);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => pinoLogger.info(`Server on http://localhost:${PORT}`));
