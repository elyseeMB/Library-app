import type { IRouter, RequestHandler } from 'express';
import type { BaseAction } from '#actions/base_action';
import { logger } from '#config/logger';
import { ROUTE_META } from './decorators.ts';

type ActionLoader = () => Promise<{ default: typeof BaseAction }>;

export async function loadRoute(
  router: IRouter,
  loader: ActionLoader,
  middlewares: RequestHandler[] = [],
) {
  try {
    const { default: action } = await loader();
    const meta = ROUTE_META.get(action);
    if (!meta) {
      throw new Error(`${action.name} has no route metadata`);
    }
    //@ts-expect-error dynamic method access
    router[meta.method](meta.path, ...middlewares, action.handleController());
  } catch (error) {
    logger.error({ error });
  }
}
