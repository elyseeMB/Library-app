import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('loans')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('member_id', 'uuid', (col) => col.notNull().references('members.id'))
    .addColumn('book_id', 'uuid', (col) => col.notNull().references('books.id'))
    .addColumn('borrowed_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('due_date', 'timestamp', (col) => col.notNull())
    .addColumn('returned_at', 'timestamp')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('loans').execute();
}
