import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('authors')
    .addColumn('email', 'varchar', (col) => col.notNull().unique())
    .addColumn('phone', 'varchar')
    .addColumn('bio', 'text')
    .addColumn('website', 'varchar')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('authors')
    .dropColumn('website')
    .dropColumn('bio')
    .dropColumn('phone')
    .dropColumn('email')
    .execute();
}
