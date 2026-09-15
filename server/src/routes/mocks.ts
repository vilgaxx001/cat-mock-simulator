import { Router } from "express";
import { getConfig, getMock, listMocks } from "../repository/contentRepository";
import { GENERAL_INSTRUCTIONS } from "../content/instructions";

export const mocksRouter = Router();

mocksRouter.get("/", (_req, res) => {
  const mocks = listMocks().map((m) => ({
    mock_id: m.mock_id,
    name: m.name,
    description: m.description,
    difficulty: m.difficulty,
    question_counts: {
      VARC: m.question_ids.VARC.length,
      DILR: m.question_ids.DILR.length,
      QA: m.question_ids.QA.length,
    },
  }));
  res.json({ mocks });
});

mocksRouter.get("/:mockId", (req, res) => {
  const mock = getMock(req.params.mockId);
  if (!mock) return res.status(404).json({ error: "Mock not found" });
  const config = getConfig(mock.config_id);
  if (!config) return res.status(500).json({ error: "Mock references an unknown config" });

  res.json({
    mock: {
      mock_id: mock.mock_id,
      name: mock.name,
      description: mock.description,
      difficulty: mock.difficulty,
    },
    config,
    instructions: GENERAL_INSTRUCTIONS,
  });
});
