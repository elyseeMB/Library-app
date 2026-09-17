import type { NextFunction, Request, Response } from 'express';

/**
 * Le contrat que la classe mère doit respecter
 *
 * `handle` c'est pour les traitements métiers, connexion à la db...
 * `asController` c'est le wrapper autour d'un RequestHandler qui retourne directement du json
 * `validator` une propriété qui valide directement les données
 */
export interface BaseActionnable {
  handle?(...args: any[]): any;
  asController?(
    req: Request,
    res: Response,
    data?: unknown,
    ...args: any[]
  ): Response | Promise<Response | unknown> | unknown;
  validator?: {
    validate: (input: unknown) => any;
  };
}

/**
 * Représente le type du constructor d'une classe (objet appelable avec new)
 */
interface StaticAction<T extends BaseAction> {
  new (...args: any[]): T;
}

/**
 * Un helper favorisant le travail par fonctionnalité métie (pattern "Action").
 *
 * Chaque classe fille encapsule en un seul endroit toute la logique d'un cas d'usage : a validation des données, le traitement métier (`handle`) et le rendu HTTP (`asController`).
 *
 * @example
 * export default class StoreBook extends BaseAction {
 *   validator = storeBookValidator;
 *
 *   async asController(_req: Request, _res: Response, data?: Infer<typeof storeBookValidator>) {
 *     return this.handle(data as NewBook);
 *   }
 *
 *   async handle(args: NewBook) {
 *     return await BookRepository.create({ ...args });
 *   }
 * }
 */
export abstract class BaseAction implements BaseActionnable {
  handle?(...args: any[]): any;
  asController?(req: Request, res: Response, data?: unknown, ...args: any[]): Promise<any> | any;
  validator?: { validate: (input: unknown) => any };

  static async run<T extends { handle: (...args: any[]) => any }>(
    this: new (
      ...args: any[]
    ) => T,
    ...args: Parameters<T['handle']>
  ): Promise<ReturnType<T['handle']>> {
    const action = new this();

    if (typeof action.handle !== 'function') {
      throw new Error(`${this.name} does not implement 'handle'`);
    }
    return action.handle(...args);
  }

  /**
   * La version statique de `handleController` permet d'instancier la classe courante (cible) pour ensuite appeler sa méthode d'instance `handleController`
   *
   * Ceci est utilisé pour la liaison (binding) dans le routage
   *
   * Le callback retourné est asynchrone car `handleController` (méthode d'instance) attend la validation des données (`validator.validate`) avec VineJS, ainsi que l'exécution du traitement métier (`asController` → `handle`), tous deux potentiellement asynchrones (DB, API, etc.)
   *
   * @param this la classe (constructeur) qui hérite de `BaseAction` (ex: `StoreBook`) sur laquelle la méthode est appelée, typée via `StaticAction<T>`
   * @returns un `RequestHandler` Express asynchrone : `(req, res, next) => Promise<void>`
   */
  static handleController<T extends BaseAction>(this: StaticAction<T>) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const action = new this();
      await action.handleController(req, res, next);
    };
  }

  /**
   * Représente un handler Express classique (`RequestHandler`) qui exécute la logique métier d'une action. La particularité ici est que `asController` n'a pas besoin d'envoyer la  réponse lui-même via `res.json()` : s'il retourne une valeur, `handleController` s'en charge automatiquement (sauf si les headers ont déjà été envoyés `res.headersSent`)
   *
   * La validation des données est aussi effectuée ici, avant d'appeler `asController`, si un `validator` est défini sur l'action
   *
   * @param req - objet `Request` d'Express
   * @param res - objet `Response` d'Express
   * @param next - fonction `NextFunction` d'Express
   */
  async handleController(req: Request, res: Response, next: NextFunction) {
    try {
      if (typeof this.asController !== 'function') {
        throw new Error(`${this.constructor.name} does not implement 'asController'`);
      }

      let data: unknown;
      if (this.validator) {
        data = await this.validator.validate(req.body);
      }

      const result = await this.asController(req, res, data);
      if (result !== undefined && !res.headersSent) {
        res.json(result);
      }
    } catch (error) {
      next(error);
    }
  }
}
