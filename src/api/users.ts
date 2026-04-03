import type { Request, Response } from "express";
import { createUser, getUserByEmail } from "../db/queries/users.js";
import { BadRequestError, UserNotAuthenticatedError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { checkPasswordHash, hashPassword } from "../auth.js";
import { users } from "../db/schema.js";

type User = typeof users.$inferSelect;
type UserResponse = Omit<User, "hashed_password">;

export async function handlerUsersCreate(req: Request, res: Response) {

  type parameters = {
    password: string;
    email: string;
  };

  const params: parameters = req.body;

  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required fields");
  }

  const hashedPassword = await hashPassword(params.password);

  const user = await createUser({
    email: params.email,
    hashed_password: hashedPassword
  });

  if (!user) {
    throw new Error("Could not create user");
  }

  respondWithJSON(res, 201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}

export async function handlerUsersLogin(req: Request, res: Response) {
  type parameters = {
    password: string;
    email: string;
  };

  const params: parameters = req.body;

  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required fields");
  }

  const user = await getUserByEmail(params.email);

  if (!user) {
    throw new UserNotAuthenticatedError("Incorrect email or password");
  }

  const isPasswordCorrect = await checkPasswordHash(params.password, user.hashed_password);

  if (!isPasswordCorrect) {
    throw new UserNotAuthenticatedError("Incorrect email or password");
  }

  const response: UserResponse = {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  respondWithJSON(res, 200, response);

}

