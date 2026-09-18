import type { Request, Response } from 'express';
import { BaseAction } from '#actions/base_action';
import { Delete } from '#config/decorators';
import { isForeignKeyViolation } from '#helpers/database';
import { Book } from '#repositories/book_repository';

@Delete('/books/:id')
export default class DestroyBook extends BaseAction {
  async asController(req: Request<{ id: string }>, res: Response) {
    try {
      const book = await this.handle(req.params.id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      return book;
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return res.status(409).json({ message: 'Book has active loans' });
      }
      throw error;
    }
  }

  async handle(id: string) {
    return await Book.delete(id);
  }
}
