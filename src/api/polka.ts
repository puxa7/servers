import type { Request, Response } from "express";
import { upgradeToChirpyRed } from "../db/queries/users.js";
import { respondWithJSON } from "./json.js";
import { getAPIKey } from "../auth.js"; 
import { config } from "../config.js"; 
import { UserNotAuthenticatedError } from "./errors.js"; 

export async function handlerPolkaWebhooks(req: Request, res: Response) {

      const apiKey = getAPIKey(req);
  if (apiKey !== config.api.polkaApiKey) {
     throw new UserNotAuthenticatedError("Invalid API key");
  }
  
  type WebhookBody = {
    event: string;
    data: {
      userId: string;
    };
  };

  

  const body: WebhookBody = req.body;

  // 1. Obsługujemy tylko zdarzenie user.upgraded
  if (body.event !== "user.upgraded") {
    return res.status(204).send();
  }

  // 2. Aktualizacja użytkownika w bazie
  const user = await upgradeToChirpyRed(body.data.userId);

  // 3. Jeśli nie znaleziono użytkownika -> 404
  if (!user) {
    return res.status(404).send();
  }

  // 4. Sukces -> 204
  res.status(204).send();
}