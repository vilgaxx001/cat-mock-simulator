import fs from "fs";
import path from "path";
import { Attempt } from "../types";

// ============================================================================
// ATTEMPT REPOSITORY
// PILOT CHOICE: attempts persist as one JSON file per attempt on disk, plus a
// small index file, rather than a real SQL database. For a single-user
// personal-prep tool this is simple, transparent, and has zero native-binary
// / install risk. The interface below (get/save/list/delete) is exactly what
// a SQLite- or Postgres-backed implementation would expose too — swapping
// the implementation later touches only this file, not routes or engine
// code. If you later add multi-user auth, this is the file to replace.
// ============================================================================

// Resolves to `server/data-store` in both dev (__dirname = server/src/repository)
// and production (__dirname = server/dist/repository), since both sit two levels
// below server/. DATA_DIR can override this to point at a mounted persistent
// disk in hosted environments (e.g. a Render disk at /var/data), where the
// default application directory is ephemeral and wiped on every redeploy.
const DATA_DIR = process.env.DATA_DIR ?? path.join(__dirname, "..", "..", "data-store");
const ATTEMPTS_DIR = path.join(DATA_DIR, "attempts");
const INDEX_FILE = path.join(DATA_DIR, "attempt-index.json");

function ensureDirs() {
  if (!fs.existsSync(ATTEMPTS_DIR)) fs.mkdirSync(ATTEMPTS_DIR, { recursive: true });
  if (!fs.existsSync(INDEX_FILE)) fs.writeFileSync(INDEX_FILE, "[]", "utf-8");
}

interface IndexEntry {
  attempt_id: string;
  mock_id: string;
  status: Attempt["status"];
  created_at: string;
  submitted_at: string | null;
}

function readIndex(): IndexEntry[] {
  ensureDirs();
  return JSON.parse(fs.readFileSync(INDEX_FILE, "utf-8"));
}

function writeIndex(entries: IndexEntry[]) {
  fs.writeFileSync(INDEX_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

function attemptPath(attemptId: string): string {
  return path.join(ATTEMPTS_DIR, `${attemptId}.json`);
}

export function saveAttempt(attempt: Attempt): void {
  ensureDirs();
  fs.writeFileSync(attemptPath(attempt.attempt_id), JSON.stringify(attempt, null, 2), "utf-8");

  const index = readIndex();
  const existingIdx = index.findIndex((e) => e.attempt_id === attempt.attempt_id);
  const entry: IndexEntry = {
    attempt_id: attempt.attempt_id,
    mock_id: attempt.mock_id,
    status: attempt.status,
    created_at: attempt.created_at,
    submitted_at: attempt.submitted_at,
  };
  if (existingIdx >= 0) index[existingIdx] = entry;
  else index.push(entry);
  writeIndex(index);
}

export function getAttempt(attemptId: string): Attempt | undefined {
  ensureDirs();
  const p = attemptPath(attemptId);
  if (!fs.existsSync(p)) return undefined;
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

export function listAttempts(): IndexEntry[] {
  return readIndex().sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function deleteAttempt(attemptId: string): void {
  ensureDirs();
  const p = attemptPath(attemptId);
  if (fs.existsSync(p)) fs.unlinkSync(p);
  writeIndex(readIndex().filter((e) => e.attempt_id !== attemptId));
}
