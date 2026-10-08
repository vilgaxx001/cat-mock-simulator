import { useNavigate } from "react-router-dom";
import { ErrorState } from "../components/ErrorState";

/** Catch-all route (`*`) — any URL that isn't a known route. Never a blank
 * screen: there is always a way back to the dashboard. */
export function NotFoundRoute() {
  const navigate = useNavigate();
  return (
    <ErrorState
      title="Page not found"
      message="That page doesn't exist — it may have been moved or the link is incorrect."
      primaryLabel="Back to Dashboard"
      onPrimary={() => navigate("/")}
    />
  );
}
