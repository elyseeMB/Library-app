import type { Request, Response } from 'express';
import { BaseAction } from '#actions/base_action';
import { Get } from '#config/decorators';
import { Book, type GetPaginatedParams } from '#repositories/book_repository';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

@Get('/books')
export default class GetPaginatedBook extends BaseAction {
  async asController(req: Request, _res: Response) {
    const page = this.toPositiveInt(req.query.page, DEFAULT_PAGE);
    const limit = Math.min(this.toPositiveInt(req.query.limit, DEFAULT_LIMIT), MAX_LIMIT);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;

    return this.handle({ page, limit, search });
  }

  async handle(params: GetPaginatedParams) {
    return await Book.getPaginated(params);
  }

  private toPositiveInt(value: unknown, fallback: number): number {
    const n = Number(value);
    return Number.isSafeInteger(n) && n >= 1 ? n : fallback;
  }
}
