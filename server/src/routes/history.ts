import { Router } from "express";
import { buildMockHistory } from "../analytics/history";

export const historyRouter = Router();

historyRouter.get("/", (_req, res) => {
  res.json(buildMockHistory());
});
