import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { handlerReadiness } from "./api/readiness.js";
import { Request, Response, NextFunction } from "express";

type Middleware = (req: Request, res: Response, next: NextFunction) => void;

const app = express();
const PORT = 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "..", "src/app");

console.log(publicDir);

app.use("/app", express.static(publicDir));

app.get("/healthz", handlerReadiness);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

const middlewareLogResponses: Middleware = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    const statusCode = res.statusCode;
    if (statusCode < 200 || statusCode >= 300){
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
    }
  });
  next();
};

app.use(middlewareLogResponses);