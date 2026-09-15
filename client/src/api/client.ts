import { AttemptView, MockDetail, MockHistoryPayload, MockSummary, ResultPayload, SaveAction } from "../types";

// In local dev, VITE_API_BASE_URL is unset and requests go to the relative
// `/api/...` path, which Vite's dev server proxies to the backend (see
// vite.config.ts). In production, the frontend (Vercel) and backend (Render)
// live on different domains, so VITE_API_BASE_URL must be set at build time
// to the deployed API's origin (e.g. https://your-api.onrender.com) — see
// .env.example and the README's deployment section.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    // fetch() itself rejected — the server is unreachable, offline, or blocked, not an API error.
    throw new ApiError("Could not reach the server. Check that it's running and your connection, then try again.", 0);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error ?? `Request failed (${res.status}). Please try again.`, res.status);
  }

  try {
    return (await res.json()) as T;
  } catch {
    // A 200 with a body that isn't valid JSON (e.g. a proxy/error page slipped through) —
    // treat it as a failure rather than let a raw parse error surface to the UI.
    throw new ApiError("The server returned an unexpected response. Please try again.", res.status);
  }
}

export const api = {
  listMocks: () => request<{ mocks: MockSummary[] }>("/mocks"),
  getMockDetail: (mockId: string) => request<MockDetail>(`/mocks/${mockId}`),
  createAttempt: (mockId: string) => request<{ attempt_id: string }>("/attempts", { method: "POST", body: JSON.stringify({ mock_id: mockId }) }),
  beginAttempt: (attemptId: string) => request<AttemptView>(`/attempts/${attemptId}/begin`, { method: "POST" }),
  getAttempt: (attemptId: string) => request<AttemptView>(`/attempts/${attemptId}`),
  visitQuestion: (attemptId: string, questionId: string) =>
    request<AttemptView>(`/attempts/${attemptId}/visit`, { method: "POST", body: JSON.stringify({ question_id: questionId }) }),
  saveResponse: (attemptId: string, questionId: string, answer: string | null, action: SaveAction) =>
    request<AttemptView>(`/attempts/${attemptId}/response`, {
      method: "POST",
      body: JSON.stringify({ question_id: questionId, answer, action }),
    }),
  getResult: (attemptId: string) => request<ResultPayload>(`/attempts/${attemptId}/result`),
  getHistory: () => request<MockHistoryPayload>("/history"),
};
