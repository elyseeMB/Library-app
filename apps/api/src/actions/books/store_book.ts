import type { Infer } from '@vinejs/vine/types';
import type { Request, Response } from 'express';
import { BaseAction } from '#actions/base_action';
import { Post } from '#config/decorators';
import { isForeignKeyViolation } from '#helpers/database';
import { Book as BookRepository, type NewBook } from '#repositories/book_repository';
import { storeBookValidator } from '#validators/books_validator';

@Post('/books')
export default class StoreBook extends BaseAction {
  validator = storeBookValidator;

  async asController(_: Request, res: Response, data?: Infer<typeof storeBookValidator>) {
    try {
      return await this.handle(data as NewBook);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return res.status(409).json({ message: 'Referenced author does not exist' });
      }
      throw error;
    }
  }

  async handle(args: NewBook) {
    return await BookRepository.store(args);
  }
}
