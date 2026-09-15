# CAT 2026 Mock Simulator

A CAT-style full-length mock exam platform with a real exam engine, a percentile-estimation and analytics
system, cross-mock progress tracking, and an instant, exportable result report — built as a genuine
client/server codebase you run and own, not a wrapper around a form builder.

> **Screenshots:** not included in this repository yet — add a few from your own local run under
> `docs/screenshots/` and link them here (landing screen, an exam question, and the result page make the
> best first impression).

---

## Table of contents

- [Features](#features)
- [Quick start](#quick-start)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)
- [Roadmap](#roadmap)

---

## Features

**Exam engine**
- VARC (24Q), DILR (22Q), QA (22Q) — individually testable pilots plus one integrated 68-question,
  120-minute mock, all sharing one exam engine (no per-section duplication).
- Real section locking: sections only advance on timer expiry, never early, matching the real exam.
- Server-authoritative, timestamp-based timer — survives refresh, reconnect, and detects expiry on the very
  next request even if the client was closed.
- Generic `QuestionGroup` architecture powers both DILR's data sets (tables, charts) and VARC's RC passages
  through the same mechanism.
- Full question palette (five real CAT states), Save & Next / Mark for Review / Clear Response, answer-change
  tracking.

**Scoring & analytics**
- Centralized scoring engine — one function, config-driven marking, called everywhere a score is needed.
- Estimated CAT-style percentile (overall + per-section), clearly labeled as an estimate, with a documented,
  replaceable calibration model.
- Topic, subtopic, and difficulty-level performance breakdowns; time analysis (slow/fast questions, time
  leaks by DILR set or VARC passage); evidence-based insights and a one-sentence verdict — nothing generic,
  every claim traceable to a number from the actual attempt.

**Mock history**
- Every completed attempt is tracked (recomputed on demand from the same attempt records, no duplicate
  storage): score/percentile trends, latest-vs-previous improvement detection, a transparent consistency
  score, recurring weak/strong topics across your last 5 mocks, personal bests, and a minimal streak counter.

**Instant result + export**
- Scoring and analytics run the moment the exam ends — no extra loading screen.
- One-sentence, section-by-section verdict; MCQ vs TITA right/wrong breakdown; exam-clock time used/remaining.
- One-click, professional PDF export, generated entirely client-side and lazy-loaded so it never slows down
  every other screen.

---

## Quick start

Requires Node.js 18+.

```bash
npm run install:all   # installs server/ and client/ dependencies
npm run dev            # runs both together — server on :4000, client on :5173
```

Open **http://localhost:5173**. Four mocks are available out of the box: three single-section pilots (QA,
DILR, VARC) and the full 68-question, 3-section mock.

(`npm run install:all` / `npm run dev` are root convenience scripts. You can equally `cd server && npm
install && npm run dev` and `cd client && npm install && npm run dev` in two terminals.)

---

## Architecture

```
server/
  src/types/            the entire data model — Question, QuestionGroup, ExamConfig, Attempt, ScoreSummary,
                         AnalyticsResult, MockHistoryPayload — shared conceptually with the client
  src/config/            exam configuration (section counts, durations, marking scheme) per mock — nothing
                         else hard-codes these numbers
  src/data/              question banks + QuestionGroup definitions (DILR sets, VARC passages) +
                         mock definitions
  src/repository/        content repository (static question/config data) + attempt repository (file-based
                         persistence) + an in-memory result cache for submitted (immutable) attempts
  src/engine/            timerEngine, examEngine, scoringEngine — pure, framework-free, and the only place
                         each concern is implemented
  src/analytics/         percentile model, difficulty calibration, topic/time/section analysis, insight and
                         verdict generation, MCQ/TITA breakdown, and analytics/history/ for cross-mock
                         trends — entirely additive, never touches the exam/scoring engine
  src/routes/            thin Express routes that delegate to the engine/analytics layers
client/
  src/App.tsx             orchestrates the full exam lifecycle: landing → instructions → exam → section
                         transitions → result, including the client-side section-boundary detection that
                         makes multi-section transitions feel deliberate rather than silent
  src/components/         exam UI (Timer, QuestionPalette, QuestionView, SetStimulus, Controls,
                         ExamHeader, SectionTransitionScreen), plus ErrorState/LoadingState shared across
                         every screen
  src/components/analytics/  result-page building blocks (percentile hero, section cards, charts, verdict,
                         priority areas)
  src/components/history/    the Mock History screen and its trend charts/panels
  src/utils/pdfExport.ts     client-side PDF report generation (lazy-loaded)
```

**Persistence**: attempts are stored as JSON files under `server/data-store/`, not a SQL database — simple,
transparent, and zero native-binary install risk for a single-user tool. The repository's `get`/`save`/`list`
interface is exactly what a SQLite- or Postgres-backed implementation would expose too, so swapping the
storage layer later touches only `attemptRepository.ts`.

**Percentile methodology**: raw score is adjusted by a difficulty-calibration factor (this mock's actual
Easy/Moderate/Hard mix vs. a baseline), then mapped to a percentile via a normal-distribution approximation
whose mean/SD are explicitly commented as a rough approximation, not sourced official CAT data. Every
constant lives in one object in `percentileModel.ts` for easy replacement later.

---

## Project structure

```
cat-mock-simulator/
  package.json            root convenience scripts (install:all, dev, build, typecheck)
  render.yaml              Render blueprint for the backend
  server/
    .env.example
    src/...
  client/
    .env.example
    vercel.json
    src/...
```

---

## Configuration

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `PORT` | server | `4000` | Port the API listens on. Render sets this automatically. |
| `CORS_ORIGIN` | server | unset (allows any origin) | Comma-separated list of allowed origins in production. |
| `VITE_API_BASE_URL` | client (build-time) | unset (uses relative `/api`) | The deployed backend's origin, when frontend and backend are on different domains. |

Copy `.env.example` to `.env` in each of `server/` and `client/` and fill in values for production; local
development needs neither.

---

## Deployment

Target: **Vercel** (frontend) + **Render** (backend). No cloud database migration — attempts still persist
as local JSON files, matching the current architecture.

### Backend (Render)

1. Push this repo to GitHub/GitLab.
2. In Render, "New +" → "Blueprint", point it at the repo — `render.yaml` at the root configures the service
   (root dir `server/`, build `npm install && npm run build`, start `npm start`, health check `/api/health`).
   Or configure a Web Service manually with those same settings if you'd rather not use the blueprint.
3. Note the deployed URL (e.g. `https://cat-mock-simulator-api.onrender.com`).
4. **Important — ephemeral filesystem**: Render's free/standard plans do not persist disk writes across
   restarts or redeploys. `server/data-store/` (your attempt history) will reset unless you attach a
   [persistent disk](https://render.com/docs/disks) (available on paid plans) mounted at `server/data-store`.
   This is a known, documented limitation of the current file-based storage approach — not a bug, and not
   something this phase was scoped to fix (no cloud database migration yet, per the brief).

### Frontend (Vercel)

1. Import the repo into Vercel, set the project root to `client/`.
2. Vercel auto-detects Vite (via `client/vercel.json`); build command `npm run build`, output `dist`.
3. Set the environment variable `VITE_API_BASE_URL` to your Render backend's URL from step 3 above (no
   trailing slash).
4. Deploy. Once you have the Vercel URL, go back to Render and set `CORS_ORIGIN` to that exact origin, then
   redeploy the backend so it only accepts requests from your real frontend.

### Verifying the split deployment

```bash
curl https://your-api.onrender.com/api/health          # {"ok":true}
curl -H "Origin: https://your-frontend.vercel.app" -I https://your-api.onrender.com/api/health
# should include Access-Control-Allow-Origin matching your frontend
```

---

## Known limitations

- **No visual QA** — every UI change in this project has been verified by code-level audit (contrast ratios
  computed mathematically, responsive breakpoints reviewed, button/spacing consistency checked file-by-file)
  rather than by looking at a rendered browser, since this environment has no headless browser available.
  Worth a careful look once you run it yourself.
- **Ephemeral hosting storage** — see the Deployment section above. Attempt history will not survive a
  Render redeploy without a persistent disk.
- **Percentile is an estimate** — clearly labeled everywhere it appears, calibrated with documented
  assumptions rather than verified historical CAT data (which isn't publicly available in a form that could
  be safely reproduced here).
- **Client bundle**: the main chunk is ~560KB after code-splitting the PDF export and Mock History screen
  (down from ~1MB before this phase) — acceptable for personal use, with `jspdf`'s unused `html2canvas`/
  `dompurify` transitive dependencies as the main remaining weight, isolated into their own on-demand chunk.
- **Early section submission is disabled everywhere** (`allow_early_section_submit: false` in every config),
  matching real CAT — so "Time Remaining" on the result page is always 0 by design, not a bug.

## Roadmap

Deliberately not built, in rough priority order for a hypothetical next phase:
- Mock Builder (custom section/topic/difficulty mixes)
- A real database backend, to remove the ephemeral-storage deployment caveat
- Multi-user authentication
- Leaderboards / cloud sync across devices
- Expanded question banks (more mocks, more passages/sets per section)
