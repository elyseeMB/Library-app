import type { Express, IRouter, RequestHandler } from 'express'
import { Router } from 'express'
import type { BaseAction } from '#actions/base_action'
import { logger } from '#config/logger'
import { ROUTE_META } from './decorators.ts'

type ActionLoader = () => Promise<{ default: typeof BaseAction }>

async function loadRoute(
  router: IRouter,
  loader: ActionLoader,
  middlewares: RequestHandler[] = [],
) {
  try {
    const { default: mod } = await loader()
    const { method, path } = mod[ROUTE_META]
    //@ts-expect-error dynamic method access
    router[method](path, ...middlewares, mod.handleController())
  } catch (error) {
    logger.error({ error })
  }
}

class RouteBuilder {
  private readonly router: IRouter
  private readonly pending: Promise<void>[] = []

  constructor(router: IRouter = Router()) {
    this.router = router
  }

  route(loader: ActionLoader, middlewares: RequestHandler[] = []): this {
    this.pending.push(loadRoute(this.router, loader, middlewares))
    return this
  }

  group(
    prefix: string,
    build: (r: RouteBuilder) => void,
    middlewares: RequestHandler[] = [],
  ): this {
    const sub = new RouteBuilder()
    if (middlewares.length) {
      sub.router.use(...middlewares)
    }
    build(sub)
    this.pending.push(
      sub.ready().then(() => {
        this.router.use(prefix, sub.router)
      }),
    )
    return this
  }

  mount(prefix: string, builder: RouteBuilder): this {
    this.pending.push(
      builder.ready().then(() => {
        this.router.use(prefix, builder.getRouter())
      }),
    )
    return this
  }

  getRouter(): IRouter {
    return this.router
  }

  async ready() {
    await Promise.all(this.pending)
  }

  async boot(app: Express) {
    await this.ready()
    app.use(this.router)
  }
}

export function routes(build: (r: RouteBuilder) => void): RouteBuilder {
  const r = new RouteBuilder()
  build(r)
  return r
}
