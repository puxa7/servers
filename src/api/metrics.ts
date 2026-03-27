import { Request, Response } from "express";
import { config } from "../config.js";
import { BadRequestError, ForbiddenError } from "../errors.js"; 
import { createUser, deleteAllUsers } from "../db/queries/users.js"; 


export function handlerMetrics(_req: Request, res: Response) {
  res.set("Content-Type", "text/html; charset=utf-8");
  res.send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.fileserverHits} times!</p>
  </body>
</html>`);
}

export async function handlerReset(_req: Request, res: Response) {
  // Sprawdzenie platformy
  if (config.platform !== "dev") {
    throw new ForbiddenError("Reset is only allowed in dev platform");
  }

  config.fileserverHits = 0;
  await deleteAllUsers(); // Usuwanie użytkowników z bazy
  
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("Hits reset and database cleared");
}

export async function handlerCreateUser(req: Request, res: Response) {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    throw new BadRequestError("Email is required");
  }

  const user = await createUser({ email });

  if (!user) {
    // Jeśli onConflictDoNothing zadziałało i user już istniał
    res.status(409).json({ error: "User already exists" });
    return;
  }

  res.status(201).json({
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  });
}

export async function handlerValidateChirp(req: Request, res: Response) {
  const body = req.body?.body;
  
  if (!body || typeof body !== "string") {
    res.status(400).json({ error: "Body is required" });
    return;
  }
  
  if (body.length > 140) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }
  
  const profaneWords = ['kerfuffle', 'sharbert', 'fornax'];
  const words = body.split(' ');
  const cleanedWords = words.map(word => {
    const wordLower = word.toLowerCase();
    // Only replace if word contains ONLY letters (no punctuation)
    if (/^[a-z]+$/i.test(word) && profaneWords.includes(wordLower)) {
      return '****';
    }
    return word;
  });
  const cleanedBody = cleanedWords.join(' ');
  
  res.status(200).json({ cleanedBody });
}