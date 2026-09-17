import type { IRouter, RequestHandler } from 'express';
import type { BaseAction } from '#actions/base_action';
import { pinoConfig } from '#config/logger';
import { ROUTE_META } from './decorators.ts';

type ActionLoader = () => Promise<{ default: typeof BaseAction }>;

/**
 * Charge une action de façon paresseuse (lazy load) et l'enregistre sur le router Express, en utilisant les métadonnées de route (`method`, `path`) définies via le décorateur (ex: `@Post('/book')`) sur la classe d'action.
 *
 * L'import est différé via `loader` pour rester compatible avec `hot-hook` : ça permet au module de l'action d'être rechargé à chaud (hot reload) sans devoir relancer tout le serveur
 *
 * @param router - instance `IRouter` d'Express sur laquelle enregistrer la route
 * @param loader - fonction d'import dynamique (`() => import('#actions/store_book')`) de l'action à charger
 * @param middlewares - middlewares Express optionnels à exécuter avant `handleController`
 */
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
    // Équivaut au pattern classique : app.post("/books", ...middlewares, (req, res, next) => {})
    router[meta.method](meta.path, ...middlewares, action.handleController());
  } catch (error) {
    pinoConfig.error({ error });
  }
}
