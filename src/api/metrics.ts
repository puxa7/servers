import { Request, Response } from "express";
import { config } from "../config.js";
import { BadRequestError, ForbiddenError } from "../errors.js"; 
import { createUser, deleteAllUsers } from "../db/queries/users.js"; 
import { createChirp } from "../db/queries/chirps.js";


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


export async function handlerCreateChirp(req: Request, res: Response) {
  const { body, userId } = req.body;

  if (!body || typeof body !== "string") {
    throw new BadRequestError("Body is required");
  }
  if (!userId || typeof userId !== "string") {
    throw new BadRequestError("UserId is required");
  }

  // 1. Walidacja długości (zastępuje stary validate_chirp)
  if (body.length > 140) {
    throw new BadRequestError("Chirp is too long");
  }

  // 2. Logika cenzury (przeniesiona ze starego handlera)
  const profaneWords = ['kerfuffle', 'sharbert', 'fornax'];
  const words = body.split(' ');
  const cleanedWords = words.map(word => {
    const wordLower = word.toLowerCase();
    if (profaneWords.includes(wordLower)) {
      return '****';
    }
    return word;
  });
  const cleanedBody = cleanedWords.join(' ');

  // 3. Zapis do bazy z OCZYSZCZONYM body
  const chirp = await createChirp({ body: cleanedBody, userId });

  res.status(201).json({
    id: chirp.id,
    body: chirp.body,
    userId: chirp.userId,
    createdAt: chirp.createdAt,
    updatedAt: chirp.updatedAt
  });
}
