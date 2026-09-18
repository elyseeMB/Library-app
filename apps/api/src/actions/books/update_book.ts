import type { Infer } from '@vinejs/vine/types';
import type { Request, Response } from 'express';
import { BaseAction } from '#actions/base_action';
import { Put } from '#config/decorators';
import { isForeignKeyViolation } from '#helpers/database';
import { Book, type BookUpdate } from '#repositories/book_repository';
import { updateBookValidator } from '#validators/books_validator';

@Put('/books/:id')
export default class UpdateBook extends BaseAction {
  validator = updateBookValidator;

  async asController(
    req: Request<{ id: string }>,
    res: Response,
    data?: Infer<typeof updateBookValidator>,
  ) {
    try {
      const book = await this.handle(req.params.id, data as BookUpdate);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      return book;
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return res.status(409).json({ message: 'Referenced author does not exist' });
      }
      throw error;
    }
  }

  async handle(id: string, data: BookUpdate) {
    return await Book.update(id, data);
  }
}
