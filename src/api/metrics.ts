import { Request, Response } from "express";
import { configObject } from "../config.js";

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
    res.status(400).json({ error: "Chirp is too long" });
    return;
  }
  
  res.status(200).json({ valid: true });
}