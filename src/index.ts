import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { handlerReadiness } from "./api/readiness.js";
import { middlewareLogResponses, middlewareMetricsInc } from "./api/middleware.js"
import { handlerMetrics, handlerReset } from "./api/metrics.js";

const app = express();
const PORT = 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "..", "src/app");

console.log(publicDir);

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc);   
app.use("/app", express.static(publicDir));

app.get("/healthz", handlerReadiness);
app.get("/metrics", handlerMetrics);
app.get("/reset", handlerReset);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

