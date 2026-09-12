import { BaseAction } from '#actions/base_action';
import { Book, type NewBook } from '../../repositories/book_repository.ts';
import { Get } from '#config/decorators';
import type { Request, Response } from 'express';
import z from 'zod';

@Get('/book')
export default class StorePost extends BaseAction {
  validator = z.object({
    title: z.string().min(1),
    author: z.string().min(1),
    isbn: z.string().optional(),
  });

  async asController(_req: Request, _res: Response, data?: unknown) {
    return this.handle(data as NewBook);
  }

  async handle(args: NewBook) {
    return await Book.create({ ...args });
  }
}
