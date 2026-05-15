import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "asset" ADD COLUMN IF NOT EXISTS "isRejected" boolean NOT NULL DEFAULT false`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE "asset" DROP COLUMN IF EXISTS "isRejected"`.execute(db);
}
