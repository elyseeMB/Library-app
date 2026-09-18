import type { Request } from 'express';
import { BaseAction } from '#actions/base_action';
import { Get } from '#config/decorators';
import { Book, type BookWithAuthor } from '#repositories/book_repository';

@Get('/books')
export default class ListBooks extends BaseAction {
  async asController(req: Request) {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
    return await this.handle({ search });
  }

  async handle(params: { search?: string }): Promise<BookWithAuthor[]> {
    return await Book.list(params);
  }
}
