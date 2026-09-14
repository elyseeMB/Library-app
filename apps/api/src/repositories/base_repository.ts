import type { Insertable, Kysely, Selectable, Updateable } from 'kysely';
import { db as defaultDb } from '#config/database';
import type { DB } from '#types/db';

/**
 * Repository générique fournissant les opérations CRUD de base (find, create, update, delete, softDelete) pour n'importe quelle table définie dans `DB`.
 *
 * Chaque repository concret (ex: `BookRepository`) étend cette classe en fixant `TB`
 * sur le nom de sa table, héritant ainsi de toutes ces opérations sans les réécrire.
 *
 * @typeParam TB - le nom de la table (clé de `DB`) sur laquelle ce repository opère
 */
export class BaseRepository<TB extends keyof DB> {
  constructor(
    protected table: TB,
    protected db: Kysely<DB> = defaultDb,
  ) {}

  async find(id: string, db: Kysely<DB> = this.db): Promise<Selectable<DB[TB]> | undefined> {
    const { table, ref } = db.dynamic;
    return db
      .selectFrom(table(this.table).as('t'))
      .selectAll()
      .where(ref('id'), '=', id)
      .executeTakeFirst() as Promise<Selectable<DB[TB]> | undefined>;
  }

  async create(data: Insertable<DB[TB]>, db: Kysely<DB> = this.db): Promise<Selectable<DB[TB]>> {
    return db.insertInto(this.table).values(data).returningAll().executeTakeFirstOrThrow();
  }

  async update(
    id: string,
    data: Updateable<DB[TB]>,
    db: Kysely<DB> = this.db,
  ): Promise<Selectable<DB[TB]>> {
    const { table, ref } = db.dynamic;
    return db
      .updateTable(table(this.table).as('t'))
      .set(data as any)
      .where(ref('id'), '=', id)
      .returningAll()
      .executeTakeFirstOrThrow() as Promise<Selectable<DB[TB]>>;
  }

  async delete(id: string, db: Kysely<DB> = this.db): Promise<void> {
    const { table, ref } = db.dynamic;
    await db.deleteFrom(table(this.table).as('t')).where(ref('id'), '=', id).execute();
  }

  async softDelete(id: string, db: Kysely<DB> = this.db): Promise<void> {
    const { table, ref } = db.dynamic;
    await db
      .updateTable(table(this.table).as('t'))
      .set({ deleted_at: new Date() } as any)
      .where(ref('id'), '=', id)
      .execute();
  }
}
