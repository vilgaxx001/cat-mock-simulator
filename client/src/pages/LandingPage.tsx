import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { MockSummary } from "../types";
import { LandingScreen } from "../components/LandingScreen";
import { ErrorState } from "../components/ErrorState";

/** Route: `/` — Landing Page + Mock Library combined, as the app has always
 * presented them (one screen listing every mock). The single entry point every
 * "Back to Dashboard" control in the app ultimately leads back to. */
export function LandingPage() {
  const navigate = useNavigate();
  const [mocks, setMocks] = useState<MockSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .listMocks()
      .then((r) => setMocks(r.mocks))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return <ErrorState message={error} primaryLabel="Try Again" onPrimary={() => window.location.reload()} />;
  }

  return <LandingScreen mocks={mocks} onSelect={(mockId) => navigate(`/mock/${mockId}`)} onViewHistory={() => navigate("/history")} loading={loading} />;
}
