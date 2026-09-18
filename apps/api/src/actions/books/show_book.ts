import type { Request, Response } from 'express';
import { BaseAction } from '#actions/base_action';
import { Get } from '#config/decorators';
import { Book } from '#repositories/book_repository';

@Get('/books/:id')
export default class ShowBook extends BaseAction {
  async asController(req: Request<{ id: string }>, res: Response) {
    const book = await this.handle(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return book;
  }

  async handle(id: string) {
    return await Book.findWithAuthor(id);
  }
}
