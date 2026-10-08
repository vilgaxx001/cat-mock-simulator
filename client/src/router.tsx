import { createBrowserRouter } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { HistoryPage } from "./pages/HistoryPage";
import { MockRunner } from "./pages/MockRunner";
import { NotFoundRoute } from "./pages/NotFoundRoute";

/**
 * The application's single routing table (createBrowserRouter — a "data router",
 * required for useBlocker, which MockRunner uses to guard against leaving a live
 * exam). This is the app's only router: no screen is ever shown from in-memory
 * state alone, so the URL always matches what's on screen and browser back/forward
 * and refresh all behave correctly.
 *
 *   /                           Landing Page + Mock Library
 *   /history                    Mock History
 *   /mock/:mockId                Mock Details / Instructions (pre-attempt)
 *   /attempt/:attemptId          Live exam for that attempt
 *   /attempt/:attemptId/result   Result dashboard for a submitted attempt
 *   *                            404 / not-found, always with a way back
 */
export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/history", element: <HistoryPage /> },
  { path: "/mock/:mockId", element: <MockRunner /> },
  { path: "/attempt/:attemptId", element: <MockRunner /> },
  { path: "/attempt/:attemptId/result", element: <MockRunner /> },
  { path: "*", element: <NotFoundRoute /> },
]);
