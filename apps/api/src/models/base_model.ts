import type { Insertable, Kysely, Selectable, Updateable } from 'kysely';

import { db as defaultDb } from '../config/database.ts';

import type { DB } from '../types/db.ts';

export default class BaseModel<TB extends keyof DB> {
  constructor(
    protected table: TB,
    protected db: Kysely<DB> = defaultDb,
  ) {}

  async find(id: number, db: Kysely<DB> = this.db): Promise<Selectable<DB[TB]> | undefined> {
    return (
      db
        .selectFrom(this.table)
        .selectAll()
        // biome-ignore lint/suspicious/noTsIgnore: Kysely generic table union
        // @ts-ignore Kysely generic table union
        .where(db.dynamic.ref('id') as any, '=', id)
        .executeTakeFirst()
    );
  }

  async create(data: Insertable<DB[TB]>, db: Kysely<DB> = this.db): Promise<Selectable<DB[TB]>> {
    return db.insertInto(this.table).values(data).returningAll().executeTakeFirstOrThrow();
  }

  async update(
    id: number,
    data: Updateable<DB[TB]>,
    db: Kysely<DB> = this.db,
  ): Promise<Selectable<DB[TB]>> {
    return (
      db
        .updateTable(this.table)
        // biome-ignore lint/suspicious/noTsIgnore: Kysely generic table union
        // @ts-ignore Kysely generic table union
        .set(data)
        .where(db.dynamic.ref('id') as any, '=', id)
        .returningAll()
        .executeTakeFirstOrThrow()
    );
  }

  async delete(id: number, db: Kysely<DB> = this.db): Promise<void> {
    await db
      .deleteFrom(this.table)
      // biome-ignore lint/suspicious/noTsIgnore: Kysely generic table union
      // @ts-ignore Kysely generic table union
      .where(db.dynamic.ref('id') as any, '=', id)
      .execute();
  }

  async softDelete(id: number, db: Kysely<DB> = this.db): Promise<void> {
    await db
      .updateTable(this.table)
      // biome-ignore lint/suspicious/noTsIgnore: Kysely generic table union
      // @ts-ignore Kysely generic table union
      .set({ deleted_at: new Date() })
      .where(db.dynamic.ref('id') as any, '=', id)
      .execute();
  }
}
