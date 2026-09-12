import { faker } from '@faker-js/faker';
import type { Insertable } from 'kysely';
import type { DB } from '#types/db';

type NewBook = Insertable<DB['books']>;

export function makeBook(overrides: Partial<NewBook> = {}): NewBook {
  return {
    title: faker.book.title(),
    author: faker.person.fullName(),
    isbn: faker.string.numeric({ length: 13 }),
    ...overrides,
  };
}

export function makeBooks(count: number, overrides: Partial<NewBook> = {}): NewBook[] {
  return Array.from({ length: count }, () => makeBook(overrides));
}
