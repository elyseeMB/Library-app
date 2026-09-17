import { faker } from '@faker-js/faker';
import type { Insertable } from 'kysely';
import type { DB } from '#types/db';

type NewAuthor = Insertable<DB['members']>;

export function memberFactory(overrides: Partial<NewAuthor> = {}): NewAuthor {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    ...overrides,
  };
}

export function membersFactory(count: number, overrides: Partial<NewAuthor> = {}): NewAuthor[] {
  return Array.from({ length: count }, () => memberFactory(overrides));
}
