import { faker } from '@faker-js/faker';
import type { Insertable } from 'kysely';
import type { DB } from '#types/db';

type NewAuthor = Insertable<DB['loans']>;

export function loanFactory(
  memberId: string,
  bookId: string,
  overrides: Partial<NewAuthor> = {},
): NewAuthor {
  return {
    member_id: memberId,
    book_id: bookId,
    due_date: faker.date.future(),
    ...overrides,
  };
}

export function loansFactory(
  memberId: string,
  bookId: string,
  count: number,
  overrides: Partial<NewAuthor> = {},
): NewAuthor[] {
  return Array.from({ length: count }, () => loanFactory(memberId, bookId, overrides));
}
