import type { Insertable, Selectable, Updateable } from 'kysely';
import type { DB } from '../types/db.ts';
import BaseModel from './base_model.ts';

export type Book = Selectable<DB['books']>;
export type NewBook = Insertable<DB['books']>;
export type BookUpdate = Updateable<DB['books']>;

export class BookModel extends BaseModel<'books'> {
  async store(data: NewBook) {
    return this.db.transaction().execute(async (trx) => {
      return this.create(data, trx);
    });
  }
}

export const Book = new BookModel('books');
