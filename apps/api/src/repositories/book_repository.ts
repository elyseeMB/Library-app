import type { Insertable, Selectable, Updateable } from 'kysely';
import { BaseRepository } from '#repositories/base_repository';
import type { DB } from '#types/db';

export type Book = Selectable<DB['books']>;
export type NewBook = Insertable<DB['books']>;
export type BookUpdate = Updateable<DB['books']>;

export class BookRepository extends BaseRepository<'books'> {
  async store(data: NewBook) {
    return this.db.transaction().execute(async (trx) => {
      return this.create(data, trx);
    });
  }
}

export const Book = new BookRepository('books');
