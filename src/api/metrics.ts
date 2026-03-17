import { Request, Response } from "express";
import { configObject } from "../config.js";
import { BadRequestError } from "../errors.js";

export function handlerMetrics(_req: Request, res: Response) {
  res.set("Content-Type", "text/html; charset=utf-8");
  res.send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${configObject.fileserverHits} times!</p>
  </body>
</html>`);
}

export function handlerReset(_req: Request, res: Response) {
  configObject.fileserverHits = 0;
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("Hits reset");
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