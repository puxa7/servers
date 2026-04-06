import type { Request, Response } from "express";

import { createUser } from "../db/queries/users.js";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { NewUser } from "src/db/schema.js";
import { hashPassword, getBearerToken, validateJWT } from "../auth.js";
import { updateUsers } from "../db/queries/users.js";
import { config } from "../config.js";

export type UserResponse = Omit<NewUser, "hashedPassword">;

export async function handlerUsersCreate(req: Request, res: Response) {
  type parameters = {
    email: string;
    password: string;
  };
  const params: parameters = req.body;

  if (!params.password || !params.email) {
    throw new BadRequestError("Missing required fields");
  }

  const hashedPassword = await hashPassword(params.password);

  const user = await createUser({
    email: params.email,
    hashedPassword,
  } satisfies NewUser);

  if (!user) {
    throw new Error("Could not create user");
  }

  respondWithJSON(res, 201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isChirpyRed: user.isChirpyRed,
  } satisfies UserResponse);
}

export async function handlerUsersUpdate(req: Request, res: Response) {
  // 1. Pobierz i zweryfikuj token (Autoryzacja)
  const token = getBearerToken(req);
  const userId = validateJWT(token, config.jwt.secret);

  type parameters = {
    email: string;
    password: string;
  };
  const params: parameters = req.body;

  if (!params.password || !params.email) {
    throw new BadRequestError("Missing required fields");
  }

  // 2. Zahashuj nowe hasło
  const hashedPassword = await hashPassword(params.password);

  // 3. Zaktualizuj użytkownika w bazie (tylko dla ID z tokena!)
  const user = await updateUsers(userId, {
    email: params.email,
    hashedPassword,
  });

  if (!user) {
    throw new Error("Could not update user");
  }

  // 4. Zwróć dane (bez hasła)
  respondWithJSON(res, 200, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isChirpyRed: user.isChirpyRed, 
  });
}