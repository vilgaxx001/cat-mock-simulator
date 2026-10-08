import { Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingState } from "../components/LoadingState";

// Lazy-loaded: history pulls in recharts and a handful of history-only
// components that most sessions (still mid-exam, or just viewing a result)
// never touch — no reason to ship that code until this route is visited.
const MockHistoryScreen = lazy(() => import("../components/history/MockHistoryScreen").then((m) => ({ default: m.MockHistoryScreen })));

/** Route: `/history` — thin route wrapper so MockHistoryScreen's existing
 * `onBack` prop (unchanged) now returns to the Landing/Dashboard route. */
export function HistoryPage() {
  const navigate = useNavigate();
  return (
    <Suspense fallback={<LoadingState label="Loading history…" />}>
      <MockHistoryScreen onBack={() => navigate("/")} />
    </Suspense>
  );
}
