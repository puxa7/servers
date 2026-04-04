import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { refreshTokens, NewRefreshToken } from "../schema.js";

// Zapisywanie nowego tokena
export async function createRefreshToken(tokenData: NewRefreshToken) {
  const [result] = await db
    .insert(refreshTokens)
    .values(tokenData)
    .returning();
  return result;
}

// Pobieranie tokena
export async function getRefreshToken(tokenVal: string) {
  const [result] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, tokenVal))
    .limit(1);
  return result;
}

// 'Usuwanie' (unieważnianie) tokena przez ustawienie revokedAt
export async function revokeRefreshToken(tokenVal: string) {
  const [result] = await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() }) // Ustawiamy obecną datę jako moment unieważnienia
    .where(eq(refreshTokens.token, tokenVal))
    .returning();
  return result;
}