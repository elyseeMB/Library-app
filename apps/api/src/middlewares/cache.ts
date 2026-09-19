import type { NextFunction, Request, RequestHandler, Response } from 'express';

export function httpCache(seconds: number): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET') {
      res.set('Cache-Control', `public, max-age=${seconds}`);
    }
    next();
  };
}
