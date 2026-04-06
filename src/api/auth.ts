import type { Request, Response } from "express";
import { getUserByEmail } from "../db/queries/users.js";
import { createRefreshToken, getRefreshToken, revokeRefreshToken } from "../db/queries/refresh_tokens.js";
import { checkPasswordHash, makeJWT, makeRefreshToken, getBearerToken } from "../auth.js";
import { respondWithJSON } from "./json.js";
import { UserNotAuthenticatedError } from "./errors.js";
import { config } from "../config.js";
import type { UserResponse } from "./users.js";

type LoginResponse = UserResponse & {
  token: string;
  refreshToken: string; 
};

export async function handlerLogin(req: Request, res: Response) {
  type parameters = {
    password: string;
    email: string;
  };
  const params: parameters = req.body;

  const user = await getUserByEmail(params.email);
  if (!user || !(await checkPasswordHash(params.password, user.hashedPassword))) {
    throw new UserNotAuthenticatedError("incorrect email or password");
  }

 const accessToken = makeJWT(user.id, config.jwt.defaultDuration, config.jwt.secret);

  const refreshTokenStr = makeRefreshToken();
  const expiresIn60Days = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

  await createRefreshToken({
    token: refreshTokenStr,
    userId: user.id,
    expiresAt: expiresIn60Days,
  });

  respondWithJSON(res, 200, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isChirpyRed: user.isChirpyRed,
    token: accessToken,
    refreshToken: refreshTokenStr,
  });
}

export async function handlerRefresh(req: Request, res: Response) {

  const tokenString = getBearerToken(req);

  const dbToken = await getRefreshToken(tokenString);

  if (!dbToken) {
    throw new UserNotAuthenticatedError("Invalid refresh token");
  }
  
  if (dbToken.revokedAt !== null) {
    throw new UserNotAuthenticatedError("Refresh token has been revoked");
  }

  if (dbToken.expiresAt < new Date()) {
    throw new UserNotAuthenticatedError("Refresh token has expired");
  }

  const newAccessToken = makeJWT(dbToken.userId, config.jwt.defaultDuration, config.jwt.secret);

  respondWithJSON(res, 200, {
    token: newAccessToken
  });
}

export async function handlerRevoke(req: Request, res: Response) {

  const tokenString = getBearerToken(req);

  await revokeRefreshToken(tokenString);

  res.status(204).send();
}