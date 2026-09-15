import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ResultPayload } from "../types";

const ACCENT: [number, number, number] = [52, 82, 199]; // matches --accent
const ACCENT_LIGHT: [number, number, number] = [238, 241, 252]; // matches --accent-light
const INK: [number, number, number] = [20, 24, 31];
const MUTED: [number, number, number] = [91, 100, 114];
const LINE: [number, number, number] = [226, 229, 234];

const MARGIN = 44;
const SECTION_GAP = 26;

export function exportResultToPdf(result: ResultPayload, mockName: string, dateIso: string) {
  const { score, analytics } = result;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - MARGIN * 2;
  let y = 0;

  // ---- Masthead ----
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, pageWidth, 8, "F");
  y = 34;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text("CAT MOCK SIMULATOR", MARGIN, y);
  doc.text("RESULT REPORT", pageWidth - MARGIN, y, { align: "right" });
  y += 26;

  doc.setFontSize(20);
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.text(mockName, MARGIN, y);
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text(new Date(dateIso).toLocaleString(), MARGIN, y);
  y += 20;

  doc.setDrawColor(...LINE);
  doc.line(MARGIN, y, pageWidth - MARGIN, y);
  y += 30;

  // ---- Overall score + percentile ----
  const col2 = MARGIN + contentWidth / 2;
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text("OVERALL SCORE", MARGIN, y);
  doc.text("ESTIMATED PERCENTILE", col2, y);
  y += 30;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...INK);
  doc.text(`${score.overall_raw_score}`, MARGIN, y);
  doc.setTextColor(...ACCENT);
  doc.text(`${analytics.overall_percentile.estimate}`, col2, y);
  y += 15;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(
    `Range ${analytics.overall_percentile.range[0]}\u2013${analytics.overall_percentile.range[1]} \u00b7 ${analytics.overall_percentile.confidence} confidence (estimate, not official)`,
    col2,
    y
  );
  y += SECTION_GAP;

  // ---- Verdict ----
  doc.setFillColor(...ACCENT_LIGHT);
  const verdictLines = doc.splitTextToSize(analytics.verdict, contentWidth - 24);
  const verdictHeight = verdictLines.length * 13 + 22;
  doc.roundedRect(MARGIN, y, contentWidth, verdictHeight, 4, 4, "F");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text(verdictLines, MARGIN + 12, y + 20);
  y += verdictHeight + SECTION_GAP;

  // ---- Right / wrong summary ----
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Correct", "Incorrect", "Unattempted", "Accuracy", "Attempt Rate"]],
    body: [[String(score.total_correct), String(score.total_incorrect), String(score.total_unattempted), `${score.overall_accuracy_pct}%`, `${score.overall_attempt_rate_pct}%`]],
    theme: "plain",
    headStyles: { textColor: MUTED, fontSize: 8.5, fontStyle: "normal", cellPadding: { bottom: 4 } },
    bodyStyles: { textColor: INK, fontSize: 13, fontStyle: "bold", cellPadding: { top: 0, bottom: 8 } },
    styles: { cellPadding: 6 },
  });
  y = getFinalY(doc) + SECTION_GAP;

  // ---- Section breakdown ----
  y = sectionTitle(doc, "Section Breakdown", y);
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Section", "Score", "Attempts", "Correct", "Wrong", "Accuracy", "Est. Percentile"]],
    body: score.sections.map((s) => {
      const p = analytics.sections.find((sec) => sec.section === s.section);
      return [
        s.section,
        `${s.raw_score} / ${p?.max_possible_score ?? ""}`,
        String(s.attempts),
        String(s.correct),
        String(s.incorrect),
        `${s.accuracy_pct}%`,
        p ? `${p.percentile.estimate}` : "\u2014",
      ];
    }),
    theme: "striped",
    headStyles: { fillColor: ACCENT, fontSize: 8.5 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [247, 248, 250] },
  });
  y = getFinalY(doc) + SECTION_GAP;

  // ---- MCQ / TITA breakdown ----
  y = ensureSpace(doc, y, 90);
  y = sectionTitle(doc, "MCQ / TITA Breakdown", y);
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Type", "Correct", "Incorrect", "Unattempted"]],
    body: [
      ["MCQ", String(analytics.type_breakdown.mcq.correct), String(analytics.type_breakdown.mcq.incorrect), String(analytics.type_breakdown.mcq.unattempted)],
      ["TITA", String(analytics.type_breakdown.tita.correct), String(analytics.type_breakdown.tita.incorrect), String(analytics.type_breakdown.tita.unattempted)],
    ],
    theme: "striped",
    headStyles: { fillColor: ACCENT, fontSize: 8.5 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [247, 248, 250] },
  });
  y = getFinalY(doc) + SECTION_GAP;

  // ---- Topic summary ----
  const attemptedTopics = analytics.topic_stats.filter((t) => t.attempts > 0);
  if (attemptedTopics.length > 0) {
    y = ensureSpace(doc, y, 120);
    y = sectionTitle(doc, "Topic Summary", y);
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      head: [["Section", "Topic", "Attempts", "Correct", "Accuracy", "Avg Time"]],
      body: attemptedTopics.map((t) => [
        t.section,
        t.topic,
        String(t.attempts),
        String(t.correct),
        `${t.accuracy_pct}%`,
        `${Math.floor(t.avg_time_sec / 60)}m ${t.avg_time_sec % 60}s`,
      ]),
      theme: "striped",
      headStyles: { fillColor: ACCENT, fontSize: 8.5 },
      bodyStyles: { fontSize: 8.5 },
      alternateRowStyles: { fillColor: [247, 248, 250] },
    });
    y = getFinalY(doc) + SECTION_GAP;
  }

  // ---- Strong / weak areas ----
  y = ensureSpace(doc, y, 100);
  const eligible = analytics.topic_stats.filter((t) => t.attempts >= 2);
  const strong = [...eligible].sort((a, b) => b.accuracy_pct - a.accuracy_pct).slice(0, 3);
  const weak = [...eligible].sort((a, b) => a.accuracy_pct - b.accuracy_pct).slice(0, 3);
  const col2b = MARGIN + contentWidth / 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text("Strong Areas", MARGIN, y);
  doc.text("Weak Areas", col2b, y);
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  const strongLines = strong.length > 0 ? strong.map((t) => `${t.section} \u00b7 ${t.topic} \u2014 ${t.accuracy_pct}%`) : ["None yet"];
  const weakLines = weak.length > 0 ? weak.map((t) => `${t.section} \u00b7 ${t.topic} \u2014 ${t.accuracy_pct}%`) : ["None yet"];
  strongLines.forEach((line, i) => doc.text(line, MARGIN, y + i * 14));
  weakLines.forEach((line, i) => doc.text(line, col2b, y + i * 14));

  stampFooters(doc);

  const safeName = mockName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`${safeName}-result-${dateIso.slice(0, 10)}.pdf`);
}

function sectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.setTextColor(...INK);
  doc.text(title, MARGIN, y);
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(1.5);
  const titleWidth = doc.getTextWidth(title);
  doc.line(MARGIN, y + 4, MARGIN + titleWidth, y + 4);
  doc.setLineWidth(0.5);
  doc.setFont("helvetica", "normal");
  return y + 16;
}

function getFinalY(doc: jsPDF): number {
  // @ts-expect-error jspdf-autotable augments doc with lastAutoTable at runtime
  return doc.lastAutoTable.finalY as number;
}

/** Starts a fresh page if there isn't roughly `needed` points of room left. */
function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - 60) {
    doc.addPage();
    return 50;
  }
  return y;
}

/** A consistent footer — page number and the percentile disclaimer — on every page. */
function stampFooters(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...LINE);
    doc.line(MARGIN, pageHeight - 40, pageWidth - MARGIN, pageHeight - 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text("Estimated percentile is a statistical approximation, not an official CAT percentile.", MARGIN, pageHeight - 26);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - MARGIN, pageHeight - 26, { align: "right" });
  }
}
