import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { handlerReadiness } from "./api/readiness.js";
import { middlewareLogResponses, middlewareMetricsInc } from "./api/middleware.js"
import { handlerMetrics, handlerReset, handlerValidateChirp } from "./api/metrics.js";

const app = express();
const PORT = 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "..", "src/app");

console.log(publicDir);

app.use(middlewareLogResponses);
app.use(express.json());
app.use("/app", middlewareMetricsInc);   
app.use("/app", express.static(publicDir));


app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);
app.post("/api/validate_chirp", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await handlerValidateChirp(req, res);
  } catch (err) {
    next(err);
  }
});

// Error-handling middleware (must be last, after all routes and other middleware)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  res.status(500).json({
    error: "Something went wrong on our end"
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

