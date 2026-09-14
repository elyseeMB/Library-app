import type { Infer } from '@vinejs/vine/types';
import type { Request, Response } from 'express';
import { BaseAction } from '#actions/base_action';
import { Post } from '#config/decorators';
import { Book as BookRepository, type NewBook } from '#repositories/book_repository';
import { storeBookValidator } from '#validators/books_validator';

@Post('/book')
export default class StoreBook extends BaseAction {
  validator = storeBookValidator;

  async asController(_req: Request, _res: Response, data?: Infer<typeof storeBookValidator>) {
    return this.handle(data as NewBook);
  }

  async handle(args: NewBook) {
    return await BookRepository.create({ ...args });
  }
}
