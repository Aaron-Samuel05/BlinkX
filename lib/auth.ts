import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import { db, schema } from "./db";
import { randomToken, sha256 } from "./crypto";

export const SESSION_COOKIE = "bx_admin";
const SESSION_DAYS = 30;

export async function createSession(adminId: string) {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);
  await db.insert(schema.sessions).values({ tokenHash: sha256(token), adminId, expiresAt });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(schema.sessions).where(eq(schema.sessions.tokenHash, sha256(token)));
  jar.delete(SESSION_COOKIE);
}

/** The signed-in admin for this request, or null. Deduplicated per request. */
export const getAdmin = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [row] = await db
    .select({ id: schema.admins.id, email: schema.admins.email, name: schema.admins.name })
    .from(schema.sessions)
    .innerJoin(schema.admins, eq(schema.admins.id, schema.sessions.adminId))
    .where(and(eq(schema.sessions.tokenHash, sha256(token)), gt(schema.sessions.expiresAt, new Date())))
    .limit(1);
  return row ?? null;
});

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
