import { Request, Response, NextFunction } from "express";
import { configObject } from "../config.js";

type Middleware = (req: Request, res: Response, next: NextFunction) => void;

export const middlewareLogResponses: Middleware = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    const statusCode = res.statusCode;
    if (statusCode < 200 || statusCode >= 300){
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
    }
  });
  next();
};

export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
  console.log("Nowy handler middleware");
  configObject.fileserverHits += 1;
  next();
}