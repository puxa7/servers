import express from "express";
import path from "path";
import { fileURLToPath } from "url";
//import { Request, Response } from "express";

const app = express();
const PORT = 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "..", "src/app");

app.use("/app", express.static(publicDir));

app.get("/healthz", (_req, res)=> {
  res.set('Content-Type', 'text/plain');
  res.send('OK');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
