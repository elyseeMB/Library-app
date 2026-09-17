import { faker } from '@faker-js/faker';
import type { Insertable } from 'kysely';
import { BookStatus, BooksStatusText } from '#enums/books_status';
import type { DB } from '#types/db';

type NewBook = Insertable<DB['books']>;

export function bookFactory(authorId: string, overrides: Partial<NewBook> = {}): NewBook {
  return {
    title: faker.book.title(),
    publication_year: faker.number.int({
      min: 1900,
      max: new Date().getFullYear(),
    }),
    author_id: authorId,
    status: BooksStatusText[BookStatus.Available],
    ...overrides,
  };
}

export function booksFactory(
  authorId: string,
  count: number,
  overrides: Partial<NewBook> = {},
): NewBook[] {
  return Array.from({ length: count }, () => bookFactory(authorId, overrides));
}
