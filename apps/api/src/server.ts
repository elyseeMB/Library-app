import { realpathSync } from 'node:fs'
import express, { type Express } from 'express'
import { hot } from 'hot-hook'
import { pinoHttp } from 'pino-http'
import { logger } from '#config/logger'

await hot.init({
  root: realpathSync.native(import.meta.filename),
})

const app: Express = express()

app.use(
  pinoHttp({
    logger,
    customSuccessMessage: (req, res, responseTime) => {
      return `${req.method} ${req.url} ${res.statusCode} - ${responseTime}ms`
    },
    serializers: {
      req: () => undefined,
      res: () => undefined,
    },
  }),
)

const { registerRoutes } = await import('./routes.ts')
await registerRoutes().boot(app)

app.listen(3000, () => logger.info('Server on http://localhost:3000'))
