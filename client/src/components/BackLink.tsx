import { Link } from "react-router-dom";

interface BackLinkProps {
  to: string;
  label: string;
}

/** A small, consistently-positioned "back" affordance for every screen outside
 * the active exam — Instructions, Result, History, 404. Deliberately not shown
 * during an active exam: leaving mid-exam goes through the blocked-navigation
 * confirmation instead (see LeaveExamModal, wired into ExamHeader's exit button
 * and into browser back/forward via useBlocker), not a plain link. */
export function BackLink({ to, label }: BackLinkProps) {
  return (
    <Link
      to={to}
      className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
    >
      <span aria-hidden="true">←</span>
      {label}
    </Link>
  );
}
