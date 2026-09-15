import { PriorityArea, SectionPerformance } from "../types";

// ============================================================================
// VERDICT GENERATOR
// One short sentence per section, built directly from that section's
// classification (already computed by percentileModel's threshold logic —
// no separate judgment made here), plus a closing sentence naming the
// weakest section as the priority. No generic filler; if a section has no
// data, it's simply not mentioned rather than padded with a placeholder.
// ============================================================================

const SECTION_CLAUSES: Record<SectionPerformance["classification"], (section: string) => string> = {
  Excellent: (s) => `Excellent ${s}.`,
  Good: (s) => `Good ${s} performance.`,
  Average: (s) => `${s} was average — room to grow.`,
  "Needs Improvement": (s) => `${s} needs the most work.`,
};

export function buildVerdict(sections: SectionPerformance[], priorityAreas: PriorityArea[]): string {
  if (sections.length === 0) return "Not enough attempted questions to generate a verdict.";

  const order = ["VARC", "DILR", "QA"];
  const ordered = [...sections].sort((a, b) => order.indexOf(a.section) - order.indexOf(b.section));

  const clauses = ordered.map((s) => SECTION_CLAUSES[s.classification](s.section));

  const weakest = [...sections].sort((a, b) => a.percentile.estimate - b.percentile.estimate)[0];
  let closing = "";
  if (sections.length > 1) {
    const topPriority = priorityAreas[0];
    closing = topPriority
      ? ` ${weakest.section} — specifically ${topPriority.topic} — is your biggest opportunity before the next mock.`
      : ` ${weakest.section} is your biggest opportunity before the next mock.`;
  }

  return clauses.join(" ") + closing;
}
