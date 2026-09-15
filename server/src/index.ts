import express from "express";
import cors from "cors";
import { mocksRouter } from "./routes/mocks";
import { attemptsRouter } from "./routes/attempts";
import { historyRouter } from "./routes/history";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

// In production, restrict to the deployed frontend's origin via CORS_ORIGIN
// (comma-separated if there's more than one, e.g. a preview + production
// domain). Falls back to allowing any origin for local development, where
// there's nothing sensitive to protect and the dev server's port can vary.
const corsOrigins = process.env.CORS_ORIGIN?.split(",").map((s) => s.trim());
app.use(cors({ origin: corsOrigins && corsOrigins.length > 0 ? corsOrigins : true }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/mocks", mocksRouter);
app.use("/api/attempts", attemptsRouter);
app.use("/api/history", historyRouter);

// Anything under /api that didn't match a route above — a clean JSON 404
// instead of Express's default HTML error page.
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // A malformed JSON body (bad syntax) is a client mistake, not a server
  // failure — surface it as 400, not a generic 500.
  if (err?.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return res.status(400).json({ error: "Request body is not valid JSON" });
  }
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`CAT mock simulator API listening on http://localhost:${PORT}`);
});
