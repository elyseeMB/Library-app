import type { Insertable, Selectable, Updateable } from 'kysely';
import { BaseRepository } from '#repositories/base_repository';
import type { DB } from '#types/db';

export type Author = Selectable<DB['authors']>;
export type NewAuthor = Insertable<DB['authors']>;
export type AuthorUpdate = Updateable<DB['authors']>;

export class AuthorRepository extends BaseRepository<'authors'> {
  async store(data: NewAuthor) {
    return this.create(data);
  }
}

export const Author = new AuthorRepository('authors');
