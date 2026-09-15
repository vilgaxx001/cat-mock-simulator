import { QuestionGroup } from "../types";

// ============================================================================
// DILR SETS
// 6 independent sets, deliberately uneven in difficulty so set selection is a
// real decision (see estimated_time_sec below — they sum to ~50 minutes of
// "ideal" solving time against a 40-minute section, exactly like real CAT:
// you cannot do everything, so choosing which sets to skip is part of the
// test). Every table cell and every logic-puzzle solution here was verified
// computationally during authoring — see verify_dilr.py used while building
// this — not just worked out by hand.
// ============================================================================

export const DILR_GROUPS: QuestionGroup[] = [
  {
    group_id: "DILR-SET-1",
    section: "DILR",
    title: "Quarterly Revenue of Five Divisions",
    stimulus_text:
      "The table below shows the quarterly revenue (in ₹ crore) of five divisions — P, Q, R, S and T — of a company across four quarters of a financial year.",
    table: {
      headers: ["Division", "Q1", "Q2", "Q3", "Q4"],
      rows: [
        ["P", 120, 135, 150, 165],
        ["Q", 200, 180, 190, 210],
        ["R", 90, 95, 100, 105],
        ["S", 160, 170, 175, 180],
        ["T", 140, 130, 145, 150],
      ],
    },
    difficulty: "Easy",
    estimated_time_sec: 420,
  },
  {
    group_id: "DILR-SET-2",
    section: "DILR",
    title: "Circular Seating Arrangement",
    stimulus_text:
      "Six people — P, Q, R, S, T and U — sit around a circular table at six seats numbered 1 to 6 in clockwise order, all facing the centre. The following is known:\n" +
      "1. P sits in seat 1.\n" +
      "2. T sits immediately clockwise of P.\n" +
      "3. R sits immediately clockwise of T.\n" +
      "4. U sits directly opposite P.\n" +
      "5. S sits immediately counter-clockwise of P.\n" +
      "(Q occupies whichever seat remains.)",
    difficulty: "Moderate",
    estimated_time_sec: 480,
  },
  {
    group_id: "DILR-SET-3",
    section: "DILR",
    title: "Subject-wise Exam Scores",
    stimulus_text:
      "Five students — Aakash, Bhavna, Chirag, Divya and Esha — took a test in three subjects (Physics, Chemistry, Maths), each out of 50 marks. The table below shows their scores; one score per student is missing but their Total (out of 150) is given, so each missing score can be worked out. A student is said to have scored a Distinction if they scored at least 40 marks in at least two of the three subjects.",
    table: {
      headers: ["Student", "Physics", "Chemistry", "Maths", "Total"],
      rows: [
        ["Aakash", 38, "?", 40, 118],
        ["Bhavna", "?", 35, 30, 100],
        ["Chirag", 42, 40, "?", 122],
        ["Divya", 30, "?", 45, 110],
        ["Esha", "?", 38, 36, 109],
      ],
    },
    difficulty: "Moderate",
    estimated_time_sec: 480,
  },
  {
    group_id: "DILR-SET-4",
    section: "DILR",
    title: "Weekly Task Schedule",
    stimulus_text:
      "Five employees — J, K, L, M and N — are each assigned exactly one of five tasks (Design, Testing, Coding, Review, Deployment), one employee and one task per day, across five consecutive working days: Monday to Friday. The following is known:\n" +
      "1. J works on Monday.\n" +
      "2. Coding is done on the day immediately after J's day.\n" +
      "3. K's task is Review, and K does not work on Monday or Tuesday.\n" +
      "4. Testing is done on the day immediately before Deployment.\n" +
      "5. M's task is Deployment, and M works on Friday.\n" +
      "6. N's task is Testing.",
    difficulty: "Moderate-Hard",
    estimated_time_sec: 540,
  },
  {
    group_id: "DILR-SET-5",
    section: "DILR",
    title: "Factory Production & Defect Data",
    stimulus_text:
      "Four factories — W, X, Y and Z — each report Units Produced, Defect Rate (%), and Defective Units for January and February. Defective Units = Units Produced × Defect Rate / 100. In each row below, exactly one of the three figures is missing and must be calculated from the other two.",
    table: {
      headers: ["Factory", "Month", "Units Produced", "Defect Rate (%)", "Defective Units"],
      rows: [
        ["W", "Jan", 2000, 5, 100],
        ["X", "Jan", 2500, "?", 125],
        ["Y", "Jan", "?", 4, 80],
        ["Z", "Jan", 1800, 6, "?"],
        ["W", "Feb", 2200, "?", 88],
        ["X", "Feb", "?", 5, 100],
        ["Y", "Feb", 2100, 5, "?"],
        ["Z", "Feb", "?", 5, 90],
      ],
    },
    difficulty: "Hard",
    estimated_time_sec: 600,
  },
  {
    group_id: "DILR-SET-6",
    section: "DILR",
    title: "Round-Robin Tournament",
    stimulus_text:
      "Four teams — A, B, C and D — play a round-robin tournament: each pair plays exactly one match, so there are 6 matches in total. A win earns the winning team 3 points and the losing team 0; a draw earns both teams 1 point each. The results of all 6 matches are given below.",
    table: {
      headers: ["Match", "Result"],
      rows: [
        ["A vs B", "A won"],
        ["A vs C", "A won"],
        ["A vs D", "Draw"],
        ["B vs C", "B won"],
        ["B vs D", "D won"],
        ["C vs D", "Draw"],
      ],
    },
    difficulty: "Moderate-Hard",
    estimated_time_sec: 480,
  },
];
