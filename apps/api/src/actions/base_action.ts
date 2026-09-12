import type { NextFunction, Request, Response } from 'express';

import { type HttpMethod, ROUTE_META } from '#config/decorators';

export interface BaseActionnable {
  handle?(...args: any[]): any;
  asController?(
    req: Request,
    res: Response,
    data?: unknown,
    ...args: any[]
  ): Response | Promise<Response | unknown> | unknown;
  validator?: {
    parse: (input: unknown) => any;
  };
}

interface StaticAction<T extends BaseAction> {
  new (...args: any[]): T;
}

export abstract class BaseAction implements BaseActionnable {
  static [ROUTE_META]: {
    method: (typeof HttpMethod)[number];
    path: string;
  };

  handle?(...args: any[]): any;
  asController?(req: Request, res: Response, data?: unknown, ...args: any[]): Promise<any> | any;
  validator?: {
    parse: (input: unknown) => any;
  };

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

  static handleController<T extends BaseAction>(this: StaticAction<T>) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const action = new this();
      await action.handleController(req, res, next);
    };
  }

  async handleController(req: Request, res: Response, next: NextFunction) {
    try {
      if (typeof this.asController !== 'function') {
        throw new Error(`${this.constructor.name} does not implement 'asController'`);
      }

      let data: unknown;
      if (this.validator) {
        data = this.validator.parse(req.body);
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
