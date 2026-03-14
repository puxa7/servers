import { Request, Response } from "express";
import { configObject } from "../config.js";

export function handlerMetrics(_req: Request, res: Response) {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send(`Hits: ${configObject.fileserverHits}`);
}

export function handlerReset(_req: Request, res: Response) {
  configObject.fileserverHits = 0;
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("Hits reset");
}