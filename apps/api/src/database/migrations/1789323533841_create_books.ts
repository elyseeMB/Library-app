import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('books')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('title', 'varchar', (col) => col.notNull())
    .addColumn('author_id', 'uuid', (col) => col.notNull().references('authors.id'))
    .addColumn('publication_year', 'integer', (col) => col.notNull())
    .addColumn('status', 'varchar', (col) => col.notNull().defaultTo('available'))
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('books').execute();
}
