import '#config/env';
import { defineConfig } from 'kysely-ctl';
import { db } from '#config/database';

export default defineConfig({
  kysely: db,
  migrations: {
    migrationFolder: 'src/database/migrations',
  },
  seeds: {
    seedFolder: 'src/database/seeds',
  },
});
