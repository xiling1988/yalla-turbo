import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'src/common/database/prisma/schema.prisma',
  migrations: {
    path: 'src/common/database/prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
