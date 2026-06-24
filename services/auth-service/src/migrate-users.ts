import type { PrismaClient } from './generated/client';
import { normalizeRole, USER_ROLES, type UserRole } from '@bus/shared';

const ROLE_RANK: Record<UserRole, number> = {
  [USER_ROLES.CUSTOMER]: 0,
  [USER_ROLES.EMPLOYEE]: 1,
  [USER_ROLES.ADMIN]: 2,
};

const LEGACY_ACCOUNT_TABLES: Array<{ names: string[]; defaultRole: UserRole }> = [
  { names: ['customers', 'Customer'], defaultRole: USER_ROLES.CUSTOMER },
  { names: ['members', 'Member'], defaultRole: USER_ROLES.CUSTOMER },
  { names: ['accounts', 'Account'], defaultRole: USER_ROLES.CUSTOMER },
  { names: ['admins', 'Admin'], defaultRole: USER_ROLES.ADMIN },
  { names: ['staffs', 'staff', 'Staff'], defaultRole: USER_ROLES.EMPLOYEE },
  { names: ['employees', 'Employee'], defaultRole: USER_ROLES.EMPLOYEE },
];

/** SQL-only renames — safe before `prisma db push`. */
export async function migrateUsersSchemaSql(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updatedAt') THEN
        ALTER TABLE users DROP COLUMN "updatedAt";
      END IF;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'User')
         AND NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        ALTER TABLE "User" RENAME TO users;
      END IF;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'SavedPassenger')
         AND NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'saved_passengers') THEN
        ALTER TABLE "SavedPassenger" RENAME TO saved_passengers;
      END IF;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'passwordHash') THEN
        ALTER TABLE users RENAME COLUMN "passwordHash" TO password_hash;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'fullName') THEN
        ALTER TABLE users RENAME COLUMN "fullName" TO full_name;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'createdAt') THEN
        ALTER TABLE users RENAME COLUMN "createdAt" TO created_at;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updatedAt') THEN
        ALTER TABLE users RENAME COLUMN "updatedAt" TO updated_at;
      END IF;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'updatedAt')
         AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE users DROP COLUMN "updatedAt";
      ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'updatedAt') THEN
        ALTER TABLE users RENAME COLUMN "updatedAt" TO updated_at;
      END IF;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'updated_at'
      ) THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
      END IF;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_pkey') THEN
        ALTER TABLE users RENAME CONSTRAINT "User_pkey" TO users_pkey;
      END IF;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'User_email_key') THEN
        ALTER INDEX "User_email_key" RENAME TO users_email_key;
      END IF;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`ALTER TABLE users ALTER COLUMN role SET DEFAULT 'customer';`);
}

/** Role normalization + legacy data — run after `prisma db push`. */
export async function migrateUsersData(prisma: PrismaClient): Promise<void> {
  try {
    const users = await prisma.user.findMany({ select: { id: true, role: true } });
    for (const u of users) {
      const next = normalizeRole(u.role);
      if (u.role !== next) {
        await prisma.user.update({ where: { id: u.id }, data: { role: next } });
      }
    }
  } catch (err) {
    console.warn('[auth-service] Role migration skipped:', (err as Error).message);
  }

  await migrateLegacyAccountTables(prisma);
  await migrateLegacyUserDbPassengers(prisma);
}

export async function migrateUsersSchema(prisma: PrismaClient): Promise<void> {
  await migrateUsersSchemaSql(prisma);
  await migrateUsersData(prisma);
}

function pickHigherRole(a: UserRole, b: UserRole): UserRole {
  return ROLE_RANK[a] >= ROLE_RANK[b] ? a : b;
}

function readField(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const val = row[key];
    if (val != null && String(val).trim()) return String(val).trim();
  }
  return '';
}

async function migrateLegacyAccountTables(prisma: PrismaClient): Promise<void> {
  const urls = [process.env.DATABASE_URL, process.env.BUS_USER_DATABASE_URL].filter(
    (u, i, arr): u is string => !!u && arr.indexOf(u) === i
  );
  if (urls.length === 0) return;

  let pg: typeof import('pg') | null = null;
  try {
    pg = await import('pg');
  } catch {
    console.warn('[auth-service] pg not installed — skip legacy account table migration');
    return;
  }

  let total = 0;
  for (const url of urls) {
    const client = new pg.Client({ connectionString: url });
    try {
      await client.connect();
      for (const spec of LEGACY_ACCOUNT_TABLES) {
        for (const tableName of spec.names) {
          total += await migrateLegacyTable(client, prisma, tableName, spec.defaultRole);
        }
      }
    } catch (err) {
      console.warn('[auth-service] Legacy account migration skipped:', (err as Error).message);
    } finally {
      await client.end().catch(() => undefined);
    }
  }

  if (total > 0) {
    console.log(`[auth-service] Migrated ${total} legacy account rows into users`);
  }
}

async function migrateLegacyTable(
  client: import('pg').Client,
  prisma: PrismaClient,
  tableName: string,
  defaultRole: UserRole
): Promise<number> {
  const exists = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = $1
    ) AS exists`,
    [tableName]
  );
  if (!exists.rows[0]?.exists) return 0;

  const { rows } = await client.query<Record<string, unknown>>(`SELECT * FROM "${tableName}"`);
  if (rows.length === 0) return 0;

  let count = 0;
  for (const row of rows) {
    const email = readField(row, ['email', 'Email']).toLowerCase();
    if (!email) continue;

    const passwordHash = readField(row, ['password_hash', 'passwordHash', 'password', 'Password']);
    if (!passwordHash) continue;

    const fullName =
      readField(row, ['full_name', 'fullName', 'FullName', 'name', 'Name']) || email.split('@')[0];
    const rowRole = readField(row, ['role', 'Role']);
    const role = pickHigherRole(defaultRole, normalizeRole(rowRole || defaultRole));
    const id = readField(row, ['id', 'Id']) || undefined;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      await prisma.user.update({
        where: { email },
        data: { role: pickHigherRole(normalizeRole(existing.role), role) },
      });
    } else {
      await prisma.user.create({
        data: {
          ...(id ? { id } : {}),
          email,
          passwordHash,
          fullName,
          role,
        },
      });
    }
    count++;
  }

  if (count > 0) {
    console.log(`[auth-service] Merged ${count} rows from legacy table "${tableName}"`);
  }
  return count;
}

async function migrateLegacyUserDbPassengers(prisma: PrismaClient): Promise<void> {
  const legacyUrl = process.env.BUS_USER_DATABASE_URL;
  if (!legacyUrl) return;

  let pg: typeof import('pg') | null = null;
  try {
    pg = await import('pg');
  } catch {
    console.warn('[auth-service] pg not installed — skip bus_user SavedPassenger migration');
    return;
  }

  const client = new pg.Client({ connectionString: legacyUrl });
  try {
    await client.connect();
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'SavedPassenger'
      ) AS exists
    `);
    if (!tableCheck.rows[0]?.exists) return;

    const { rows } = await client.query<{
      id: string;
      userId: string;
      fullName: string;
      phone: string;
      email: string;
      idNumber: string | null;
    }>(`SELECT id, "userId", "fullName", phone, email, "idNumber" FROM "SavedPassenger"`);

    for (const row of rows) {
      const userExists = await prisma.user.findUnique({ where: { id: row.userId } });
      if (!userExists) continue;
      await prisma.savedPassenger.upsert({
        where: { id: row.id },
        create: {
          id: row.id,
          userId: row.userId,
          fullName: row.fullName,
          phone: row.phone,
          email: row.email,
          idNumber: row.idNumber,
        },
        update: {
          fullName: row.fullName,
          phone: row.phone,
          email: row.email,
          idNumber: row.idNumber,
        },
      });
    }
    if (rows.length > 0) {
      console.log(`[auth-service] Migrated ${rows.length} saved_passengers from bus_user`);
    }
  } catch (err) {
    console.warn('[auth-service] Legacy bus_user migration skipped:', (err as Error).message);
  } finally {
    await client.end().catch(() => undefined);
  }
}
