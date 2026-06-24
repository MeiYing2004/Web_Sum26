import { PrismaClient } from './generated/client';
import { migrateUsersSchemaSql } from './migrate-users';

/** Run before `prisma db push` in Docker. */
async function main() {
  const prisma = new PrismaClient();
  try {
    await migrateUsersSchemaSql(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('[auth-service] Bootstrap migration failed:', err);
  process.exit(1);
});
