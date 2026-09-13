import { faker } from '@faker-js/faker';
import type { Insertable } from 'kysely';
import type { DB } from '#types/db';

type NewAuthor = Insertable<DB['authors']>;

export function authorFactory(overrides: Partial<NewAuthor> = {}): NewAuthor {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    website: faker.internet.domainName(),
    phone: faker.phone.number(),
    bio: faker.person.bio(),
    nationality: faker.location.country(),
    ...overrides,
  };
}

export function authorsFactory(count: number, overrides: Partial<NewAuthor> = {}): NewAuthor[] {
  return Array.from({ length: count }, () => authorFactory(overrides));
}
