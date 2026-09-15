import { Question } from "../types";

// ============================================================================
// VARC QUESTION BANK — 24 questions
// 19 RC (Passage 1: 5, Passage 2: 5, Passage 3: 5, Passage 4: 4) + 5 VA
// (2 Para Summary, 2 Odd Sentence Out, 1 Para Jumble).
//
// Every RC question was checked against the passage text by hand during
// authoring: the correct option is the one the passage actually supports,
// and every distractor has a specific, stated reason it's wrong (too broad,
// too narrow, reverses the claim, imports an idea the passage doesn't make,
// etc.) rather than being arbitrarily "off". The Para Jumble's ordering was
// additionally checked computationally — encoding each sentence's backward
// references as a precedence graph confirmed exactly one valid sequence
// (see verify_jumble.py used during authoring).
//
// Ideal solving time across all 4 passages plus VA is ~47 minutes against a
// 40-minute section — deliberately, same principle as DILR: you cannot read
// and answer everything, so choosing which passage to skip is part of the
// test.
// ============================================================================

export const VARC_QUESTIONS: Question[] = [
  // ============ PASSAGE 1: The Attention Economy (Easy-Moderate) ============
  {
    question_id: "VARC-001",
    section: "VARC",
    topic: "RC",
    subtopic: "Main Idea",
    question_type: "MCQ",
    difficulty: "Easy-Moderate",
    question_text: "Which of the following best captures the central argument of the passage?",
    options: [
      "Digital platforms are deliberately designed by unethical companies to manipulate users into wasting time.",
      "As physical constraints on media disappeared, attention itself became the scarce resource that markets compete for, making attention-capture a structural rather than individual phenomenon.",
      "Individuals can overcome attention-capture by exercising greater willpower and discipline.",
      "Advertising has always been about capturing scarce resources, and digital media is no different from print or television in this respect.",
    ],
    correct_answer: "1",
    explanation:
      "The passage explicitly rejects the 'few bad actors' framing (option A) and argues the opposite of C (individual willpower is outmatched). D misses the actual shift the passage describes — from physical to psychological scarcity. B matches the passage's core claim.",
    marks: 3,
    negative_marks: -1,
    estimated_time_sec: 80,
    passage_id: "VARC-PASSAGE-1",
  },
  {
    question_id: "VARC-002",
    section: "VARC",
    topic: "RC",
    subtopic: "Inference",
    question_type: "MCQ",
    difficulty: "Moderate",
    question_text:
      "It can be inferred from the passage that a television network in the mid-twentieth century, compared to a modern digital platform, faced:",
    options: [
      "Greater competition for viewers' attention, since it had more channels to compete against.",
      "A different kind of constraint — content was rationed by fixed schedule slots rather than by the need to continuously hold attention against unlimited alternatives.",
      "Similar pressure to modern platforms, since all media forms have always tried to hold audience attention as long as possible.",
      "No real constraint at all, since television was a passive medium requiring no viewer choice.",
    ],
    correct_answer: "1",
    explanation:
      "The passage's central contrast is between structural scarcity (fixed broadcast slots rationing attention) and psychological scarcity (unlimited alternatives). Option B captures this; A reverses the claim, C ignores the contrast the passage builds its argument on, and D overstates — the passage never claims television had 'no constraint'.",
    marks: 3,
    negative_marks: -1,
    estimated_time_sec: 100,
    passage_id: "VARC-PASSAGE-1",
  },
  {
    question_id: "VARC-003",
    section: "VARC",
    topic: "RC",
    subtopic: "Purpose",
    question_type: "MCQ",
    difficulty: "Moderate",
    question_text: "Why does the author mention 'thousands of engineers and designers' in the final paragraph?",
    options: [
      "To criticize the technology industry for employing too many people to build addictive products.",
      "To argue that individual users have no real agency in how they use digital platforms.",
      "To illustrate the scale of coordinated, iterative effort that individual willpower is up against, explaining why personal discipline alone is an inadequate response.",
      "To suggest that digital platforms should employ fewer engineers to reduce their persuasive power.",
    ],
    correct_answer: "2",
    explanation:
      "The passage explicitly denies that users are 'powerless' (ruling out B) and makes no policy recommendation about hiring (ruling out D) or an ethical accusation (ruling out A, which the passage disclaims earlier). C matches the stated purpose: illustrating an asymmetry of scale.",
    marks: 3,
    negative_marks: -1,
    estimated_time_sec: 90,
    passage_id: "VARC-PASSAGE-1",
  },
  {
    question_id: "VARC-004",
    section: "VARC",
    topic: "RC",
    subtopic: "Specific Information",
    question_type: "MCQ",
    difficulty: "Easy-Moderate",
    question_text: "According to the passage, what was the primary function served by the scarcity of shelf space and airtime in traditional media?",
    options: [
      "It kept production costs low for publishers and broadcasters.",
      "It guaranteed a minimum level of content quality.",
      "It effectively rationed the audience's attention on the media's behalf, since only a fixed amount of content could be presented.",
      "It allowed advertisers to charge higher prices for premium slots.",
    ],
    correct_answer: "2",
    explanation:
      "The passage states this directly: 'this constraint did the work of rationing attention for the audience.' The other options introduce ideas — cost, quality, pricing — that the passage never raises.",
    marks: 3,
    negative_marks: -1,
    estimated_time_sec: 80,
    passage_id: "VARC-PASSAGE-1",
  },
  {
    question_id: "VARC-005",
    section: "VARC",
    topic: "RC",
    subtopic: "Tone",
    question_type: "MCQ",
    difficulty: "Moderate",
    question_text: "The author's tone in describing the shift to the attention economy is best described as:",
    options: [
      "Alarmist and accusatory, blaming technology companies for deliberate harm.",
      "Dismissive, treating the phenomenon as trivial and not worth serious concern.",
      "Analytical and structural, explaining the phenomenon as an emergent market outcome rather than a matter of individual blame.",
      "Nostalgic, longing for a return to traditional print and broadcast media.",
    ],
    correct_answer: "2",
    explanation:
      "The passage repeatedly frames the shift as structural ('a structural consequence', 'built into the architecture of the market, not into any single company's ethics') rather than assigning blame, ruling out A. It clearly treats the topic seriously, ruling out B, and never expresses longing for older media, ruling out D.",
    marks: 3,
    negative_marks: -1,
    estimated_time_sec: 90,
    passage_id: "VARC-PASSAGE-1",
  },

  // ============ PASSAGE 2: The Concept of a Keystone Species (Moderate) ============
  {
    question_id: "VARC-006",
    section: "VARC",
    topic: "RC",
    subtopic: "Main Idea",
    question_type: "MCQ",
    difficulty: "Moderate",
    question_text: "The central point of the passage is that:",
    options: [
      "Sea otters are the most important species in coastal marine ecosystems.",
      "A species' ecological importance can depend on structural relationships within a system rather than on its abundance, and such importance often becomes visible only once the species is removed.",
      "Ecologists should focus their conservation efforts primarily on keystone species rather than abundant ones.",
      "Architecture and ecology share many structural similarities that ecologists have borrowed extensively.",
    ],
    correct_answer: "1",
    explanation:
      "The otter is only an illustrative example, not the passage's main point (ruling out A). The passage makes no policy recommendation (ruling out C) and uses the architectural term only as an explanatory analogy, not a claim about disciplinary overlap (ruling out D). B matches the passage's actual thesis.",
    marks: 3,
    negative_marks: -1,
    estimated_time_sec: 90,
    passage_id: "VARC-PASSAGE-2",
  },
  {
    question_id: "VARC-007",
    section: "VARC",
    topic: "RC",
    subtopic: "Inference",
    question_type: "MCQ",
    difficulty: "Moderate-Hard",
    question_text:
      "It can be inferred from the passage that if sea urchin numbers were controlled by some means other than otter predation, the ecological importance of the otter, as the passage defines it, would:",
    options: [
      "Remain exactly the same, since otters would still be present in the ecosystem.",
      "Decrease, since the keystone effect depends on the otter's predation being the mechanism that prevents kelp destruction.",
      "Increase, because the otter would then face less competition for the same food source.",
      "Become impossible to determine, since ecologists cannot measure importance without biomass data.",
    ],
    correct_answer: "1",
    explanation:
      "The passage defines importance by asking 'what would happen to everything else if the otter were removed.' If another mechanism already controlled urchins, removing the otter would no longer risk the kelp-collapse cascade, so its structural importance via that specific pathway would diminish. A ignores the passage's own definition of importance; C introduces an idea (competition) never discussed; D contradicts the passage's entire argument that importance can be assessed without biomass.",
    marks: 3,
    negative_marks: -1,
    estimated_time_sec: 130,
    passage_id: "VARC-PASSAGE-2",
  },
  {
    question_id: "VARC-008",
    section: "VARC",
    topic: "RC",
    subtopic: "Purpose",
    question_type: "MCQ",
    difficulty: "Moderate",
    question_text: "Why does the author introduce the architectural meaning of 'keystone' in the first paragraph?",
    options: [
      "To provide historical background on the etymology of ecological terminology for its own sake.",
      "To use a concrete, structurally analogous image — a small block whose removal collapses a much larger structure — to make an abstract ecological concept intuitively graspable.",
      "To argue that ecosystems are literally constructed the same way as buildings.",
      "To criticize ecologists for borrowing terminology from unrelated fields.",
    ],
    correct_answer: "1",
    explanation:
      "The analogy is explanatory, not a literal claim about construction (ruling out C), and the author's tone is neutral/informative rather than critical (ruling out D). A undersells the functional purpose the analogy serves in the argument. B correctly identifies the analogy's role.",
    marks: 3,
    negative_marks: -1,
    estimated_time_sec: 90,
    passage_id: "VARC-PASSAGE-2",
  },
  {
    question_id: "VARC-009",
    section: "VARC",
    topic: "RC",
    subtopic: "Specific Information",
    question_type: "MCQ",
    difficulty: "Moderate",
    question_text: "Based on the passage, which of the following would NOT be consistent with a species being classified as a keystone species?",
    options: [
      "The species has low overall biomass relative to other species in its ecosystem.",
      "The species' removal triggers a cascade of changes affecting many other organisms.",
      "The species' importance is proportional to how abundant it is within the ecosystem.",
      "The species' significance becomes apparent mainly after its decline has already begun.",
    ],
    correct_answer: "2",
    explanation:
      "A, B and D are all directly stated or implied properties of keystone species in the passage. C directly contradicts the passage's central distinction between abundance-based importance and structural importance — a keystone species is defined precisely by importance NOT being proportional to abundance.",
    marks: 3,
    negative_marks: -1,
    estimated_time_sec: 110,
    passage_id: "VARC-PASSAGE-2",
  },
  {
    question_id: "VARC-010",
    section: "VARC",
    topic: "RC",
    subtopic: "Logical Relationship",
    question_type: "MCQ",
    difficulty: "Moderate",
    question_text: "The passage's closing paragraph suggests that the concept of a keystone species is significant primarily because it:",
    options: [
      "Proves that all ecosystems have exactly one keystone species.",
      "Offers a broader way of thinking about importance in any interconnected system, not just ecological ones.",
      "Shows that architecture and biology are historically connected disciplines.",
      "Demonstrates that small components are always more important than large ones in any system.",
    ],
    correct_answer: "1",
    explanation:
      "The closing paragraph states directly that 'this distinction matters beyond ecology... in any interconnected system,' matching B. A and D both overgeneralize claims the passage never makes, and C misreads a terminological borrowing as a historical/disciplinary claim.",
    marks: 3,
    negative_marks: -1,
    estimated_time_sec: 100,
    passage_id: "VARC-PASSAGE-2",
  },

  // ============ PASSAGE 3: Tacit Knowledge and the Limits of Instruction (Moderate-Hard) ============
  {
    question_id: "VARC-011",
    section: "VARC",
    topic: "RC",
    subtopic: "Main Idea",
    question_type: "MCQ",
    difficulty: "Moderate-Hard",
    question_text: "The central argument of the passage is that:",
    options: [
      "Tacit knowledge is an outdated concept that modern documentation techniques will eventually eliminate.",
      "Skilled performance often depends on a kind of knowledge that cannot be fully captured by explicit rules, and this gap is a permanent feature of skill rather than a temporary lack of documentation.",
      "Written rules are useless for learning any skill and should be abandoned in favor of pure apprenticeship.",
      "Expert chess players do not use any rules or heuristics when they play.",
    ],
    correct_answer: "1",
    explanation:
      "The passage explicitly closes by calling the gap 'a permanent feature of what skill actually is,' directly contradicting A. It also states rules 'can guide a novice toward competence,' ruling out C's extremity. D distorts the chess example — the passage says recognition 'cannot be fully reduced' to heuristics, not that none are used. B matches the actual thesis.",
    marks: 3,
    negative_marks: -1,
    estimated_time_sec: 110,
    passage_id: "VARC-PASSAGE-3",
  },
  {
    question_id: "VARC-012",
    section: "VARC",
    topic: "RC",
    subtopic: "Inference",
    question_type: "MCQ",
    difficulty: "Moderate-Hard",
    question_text: "Based on the passage, the author would most likely agree that a comprehensive written manual on surgical technique would:",
    options: [
      "Be sufficient on its own to produce a competent surgeon.",
      "Be useless and should not be written at all.",
      "Help a learner develop initial competence but would not, by itself, transmit the full skill that an experienced surgeon possesses.",
      "Eventually be replaced by a more detailed manual that fully captures the tacit knowledge involved.",
    ],
    correct_answer: "2",
    explanation:
      "The passage argues instruction 'can transmit the scaffolding' but 'cannot transmit the skill directly' — matching C exactly, and ruling out both extremes (A and B) as well as D, which contradicts the passage's claim that the gap is permanent, not a documentation problem awaiting a fix.",
    marks: 3,
    negative_marks: -1,
    estimated_time_sec: 120,
    passage_id: "VARC-PASSAGE-3",
  },
  {
    question_id: "VARC-013",
    section: "VARC",
    topic: "RC",
    subtopic: "Author's Viewpoint",
    question_type: "MCQ",
    difficulty: "Moderate",
    question_text: "How does the author regard the view that tacit knowledge is merely an 'unformalized theory waiting... to be formalized'?",
    options: [
      "The author agrees with this view and provides supporting evidence for it.",
      "The author is neutral and presents it as one of several equally valid perspectives.",
      "The author regards this view as a mistaken oversimplification, and argues against it using the example of expert chess players.",
      "The author considers this view to be true only in fields outside of chess and surgery.",
    ],
    correct_answer: "2",
    explanation:
      "The passage states plainly, 'this view mistakes the relationship between rule and skill,' immediately followed by the chess counter-example — directly matching C and ruling out A's claim of agreement and B's claim of neutrality. D invents a distinction the passage never makes.",
    marks: 3,
    negative_marks: -1,
    estimated_time_sec: 100,
    passage_id: "VARC-PASSAGE-3",
  },
  {
    question_id: "VARC-014",
    section: "VARC",
    topic: "RC",
    subtopic: "Specific Information",
    question_type: "MCQ",
    difficulty: "Moderate",
    question_text: "According to the passage, why do fluent speakers often fail to correctly state the grammatical rules underlying their own speech?",
    options: [
      "Because they never learned grammar formally in school.",
      "Because grammatical rules, as commonly taught, are inherently inconsistent and contradictory.",
      "Because the knowledge that allows fluent speech is tacit — a different kind of knowing than explicit rule-based articulation — so any rule offered after the fact may not even describe what they actually do.",
      "Because most fluent speakers are simply not intelligent enough to formulate abstract rules.",
    ],
    correct_answer: "2",
    explanation:
      "The passage attributes this directly to the nature of tacit knowledge, not schooling, rule quality, or intelligence — none of which it mentions. C is the only option grounded in what the passage actually says.",
    marks: 3,
    negative_marks: -1,
    estimated_time_sec: 100,
    passage_id: "VARC-PASSAGE-3",
  },
  {
    question_id: "VARC-015",
    section: "VARC",
    topic: "RC",
    subtopic: "Application",
    question_type: "MCQ",
    difficulty: "Hard",
    question_text: "Which of the following scenarios best illustrates the passage's central concept, as applied to a new field?",
    options: [
      "A master violin maker who can identify, by touch alone, a subtle flaw in a piece of wood that no written specification currently describes or measures.",
      "A student who memorizes a textbook chapter and reproduces it accurately on an exam.",
      "An engineer who follows a detailed, step-by-step manual to assemble a machine for the first time.",
      "A company that documents all of its internal processes in a comprehensive employee handbook.",
    ],
    correct_answer: "0",
    explanation:
      "B, C, and D all describe explicit, rule-based knowledge transfer — the opposite of the passage's concept. A describes a perceptual skill that exceeds any current explicit articulation, directly paralleling the passage's chess and speech examples.",
    marks: 3,
    negative_marks: -1,
    estimated_time_sec: 130,
    passage_id: "VARC-PASSAGE-3",
  },

  // ============ PASSAGE 4: Invented Traditions and the Illusion of Continuity (Hard) ============
  {
    question_id: "VARC-016",
    section: "VARC",
    topic: "RC",
    subtopic: "Main Idea",
    question_type: "MCQ",
    difficulty: "Hard",
    question_text: "The central argument of the passage is best summarized as:",
    options: [
      "Traditions that are proven to be recently invented should be abandoned because they are fraudulent.",
      "Many traditions perceived as ancient are actually recent constructions that emerged to provide a sense of continuity during periods of disruption, and recognizing this distinction reveals the specific historical needs the tradition served, without necessarily discrediting it.",
      "All national ceremonies and civic rituals are invented traditions with no genuine historical basis.",
      "Societies undergoing rapid change should actively invent new traditions to reassure their populations.",
    ],
    correct_answer: "1",
    explanation:
      "The passage explicitly rejects the 'fraudulent' framing (ruling out A) and never makes the prescriptive claim in D. It says 'many' national ceremonies were invented, not 'all' (ruling out C, which overgeneralizes scope). B captures the passage's actual, more nuanced thesis.",
    marks: 3,
    negative_marks: -1,
    estimated_time_sec: 120,
    passage_id: "VARC-PASSAGE-4",
  },
  {
    question_id: "VARC-017",
    section: "VARC",
    topic: "RC",
    subtopic: "Inference",
    question_type: "MCQ",
    difficulty: "Hard",
    question_text: "Based on the passage, the author would most likely argue that an invented tradition's usefulness to a community is:",
    options: [
      "Necessarily fraudulent and therefore illegitimate.",
      "Independent of whether its claimed antiquity is historically accurate.",
      "Entirely dependent on convincing people that it is genuinely ancient.",
      "Always weaker than that of a genuinely ancient, organically continuous tradition.",
    ],
    correct_answer: "1",
    explanation:
      "The passage states a recent invention can perform genuine cultural work 'just as effectively' as an organically ancient one — directly supporting B and ruling out C and D, both of which the passage's own comparison contradicts.",
    marks: 3,
    negative_marks: -1,
    estimated_time_sec: 130,
    passage_id: "VARC-PASSAGE-4",
  },
  {
    question_id: "VARC-018",
    section: "VARC",
    topic: "RC",
    subtopic: "Logical Relationship",
    question_type: "MCQ",
    difficulty: "Hard",
    question_text: "What is the function of the phrase 'it fills a vacancy' in the second paragraph?",
    options: [
      "It suggests that invented traditions are typically introduced by government committees to fill administrative gaps.",
      "It captures the idea that invented traditions often emerge specifically to replace organic customs that were disappearing, rather than emerging in the presence of a stable, unbroken continuity.",
      "It implies that invented traditions are inherently incomplete compared to genuine ones.",
      "It refers to a specific historical event mentioned earlier in the passage.",
    ],
    correct_answer: "1",
    explanation:
      "No such committee or specific event is mentioned anywhere (ruling out A and D), and 'vacancy' describes a historical gap being filled, not a quality of the tradition itself (ruling out C). B is the only reading consistent with the surrounding sentence about disappearing older customs.",
    marks: 3,
    negative_marks: -1,
    estimated_time_sec: 120,
    passage_id: "VARC-PASSAGE-4",
  },
  {
    question_id: "VARC-019",
    section: "VARC",
    topic: "RC",
    subtopic: "Application",
    question_type: "MCQ",
    difficulty: "Hard",
    question_text: "Which of the following, if true, would most directly support the passage's central distinction between genuine continuity and invented tradition?",
    options: [
      "A ceremony believed by most citizens to date back many centuries is found, through historical records, to have first been formally standardized only a hundred years ago, during a period of significant national upheaval.",
      "A ceremony that has documented, continuous practice stretching back many centuries with only minor modifications is found to be exactly as old as popularly believed.",
      "A recently designed corporate logo is marketed as modern and innovative, with no claims of historical continuity.",
      "A historian discovers that a particular tradition has remained completely unchanged for over a thousand years.",
    ],
    correct_answer: "0",
    explanation:
      "B and D both describe genuine continuity, not the invented-tradition phenomenon the passage is centrally concerned with. C makes no claim of ancient pedigree at all, so it doesn't engage the distinction. A is a direct real-world instance of the exact pattern the passage describes.",
    marks: 3,
    negative_marks: -1,
    estimated_time_sec: 140,
    passage_id: "VARC-PASSAGE-4",
  },

  // ============ VERBAL ABILITY (5 questions, no passage grouping) ============
  {
    question_id: "VARC-020",
    section: "VARC",
    topic: "Para Summary",
    subtopic: "Central Argument Summary",
    question_type: "MCQ",
    difficulty: "Moderate",
    question_text:
      "Economists have long debated whether foreign aid helps or hinders the development of recipient nations. Critics argue that aid can entrench corrupt governments by supplying revenue that does not depend on taxing citizens, thereby weakening the political accountability that typically arises when governments must answer to taxpayers. Defenders counter that, in the absence of aid, the alternative for many of the poorest nations is not self-sufficient development but simply a slower and more painful version of the same poverty, absent the infrastructure and health interventions aid can fund in the interim. Both sides agree that the effectiveness of aid depends heavily on the specific institutional context into which it is delivered, rather than on any general property of aid itself.\n\nWhich of the following best captures the paragraph's central point?",
    options: [
      "Foreign aid should be abolished because it entrenches corrupt governments.",
      "The debate over foreign aid's effectiveness remains unresolved because both critics and defenders acknowledge that its impact depends on the institutional context in which it is delivered, not on some fixed property of aid itself.",
      "Poor nations would develop just as quickly without any foreign aid at all.",
      "Government corruption is the single greatest obstacle to development in poor nations.",
    ],
    correct_answer: "1",
    explanation:
      "A reflects only the critics' side, presented as a one-sided conclusion the paragraph never reaches. C contradicts the defenders' explicit point that the alternative is 'a slower and more painful version' of poverty, not equal development. D overstates a claim made only by critics as if it were the paragraph's verdict. B is the only option that captures both sides and their point of agreement.",
    marks: 3,
    negative_marks: -1,
    estimated_time_sec: 100,
  },
  {
    question_id: "VARC-021",
    section: "VARC",
    topic: "Para Summary",
    subtopic: "Central Argument Summary",
    question_type: "MCQ",
    difficulty: "Moderate",
    question_text:
      "The rise of remote work has complicated a distinction that most labor economists once took for granted: the line between where a person lives and where a person works. For over a century, wages in a given profession were substantially explained by the cost of living in the city where the job was located, since employers competed for talent within a local labor pool and employees, in turn, needed enough income to afford housing in that same city. When a software engineer in a low-cost city can perform the same job, at the same output, for a company headquartered in an expensive one, the old logic linking wages to local cost of living begins to break down, forcing employers to decide whether they are paying for a location or for a skill.\n\nThe paragraph is primarily concerned with:",
    options: [
      "Arguing that remote work has made software engineers more productive than before.",
      "Explaining how remote work is destabilizing the historical link between an employee's wage and the cost of living in the city where the employer is based.",
      "Predicting that all companies will eventually stop paying employees based on skill.",
      "Describing the advantages remote work offers to employees living in low-cost cities.",
    ],
    correct_answer: "1",
    explanation:
      "Equal output is a stated premise, not the paragraph's point, ruling out A. C inverts the actual tension the paragraph describes (location vs. skill), overstating it into a prediction never made. D is too narrow, focusing on one party's advantage rather than the systemic shift being explained. B matches the paragraph's actual focus.",
    marks: 3,
    negative_marks: -1,
    estimated_time_sec: 100,
  },
  {
    question_id: "VARC-022",
    section: "VARC",
    topic: "Odd Sentence Out",
    subtopic: "Coherence",
    question_type: "MCQ",
    difficulty: "Moderate",
    question_text:
      "Five sentences are given below. Four of them, when read together (in some order), form a coherent paragraph. One sentence does not belong. Identify the sentence that breaks the paragraph's logical flow.\n\n" +
      "1. Coral reefs occupy less than one percent of the ocean floor, yet they support an estimated quarter of all known marine species.\n" +
      "2. This disproportion is possible because reefs provide something rare in the open ocean: complex, three-dimensional physical structure that creates countless microhabitats within a small area.\n" +
      "3. Overfishing remains one of the most significant direct threats to coral reef ecosystems worldwide.\n" +
      "4. A fish that would have nowhere to hide in open water can find shelter in the crevices of a reef, and a predator that would need to search widely elsewhere can instead patrol a concentrated, productive hunting ground.\n" +
      "5. It is this structural complexity, more than any other single factor, that explains why reefs punch so far above their weight in terms of biodiversity.",
    options: ["Sentence 1", "Sentence 3", "Sentence 4", "Sentence 5"],
    correct_answer: "1",
    explanation:
      "Sentences 1, 2, 4 and 5 form a tight causal chain: a striking claim (1) — the mechanism behind it (2) — a concrete illustration of the mechanism (4) — a restatement tying it together (5). Sentence 3, about overfishing as a threat, is a genuinely different topic — conservation risk, not the explanation for biodiversity — and doesn't fit this chain at all.",
    marks: 3,
    negative_marks: -1,
    estimated_time_sec: 110,
  },
  {
    question_id: "VARC-023",
    section: "VARC",
    topic: "Odd Sentence Out",
    subtopic: "Coherence",
    question_type: "MCQ",
    difficulty: "Moderate-Hard",
    question_text:
      "Five sentences are given below. Four of them, when read together (in some order), form a coherent paragraph. One sentence does not belong. Identify the sentence that breaks the paragraph's logical flow.\n\n" +
      "1. Vaccines work by training the immune system to recognize a pathogen before an actual infection occurs, using a harmless component or weakened version of the pathogen as a stand-in for the real threat.\n" +
      "2. When the body later encounters the actual pathogen, it can mount a faster and stronger response than it would have without prior exposure, often preventing illness altogether or substantially reducing its severity.\n" +
      "3. The first successful vaccine, developed in the late eighteenth century, relied on the observation that exposure to a related but milder disease could confer protection against a more dangerous one.\n" +
      "4. This principle — that a prepared immune system responds more effectively than an unprepared one — underlies not just vaccination but the general biological logic of immune memory itself.\n" +
      "5. Public trust in vaccination programs has fluctuated considerably over the past two decades due to a range of social and political factors.",
    options: ["Sentence 2", "Sentence 3", "Sentence 4", "Sentence 5"],
    correct_answer: "3",
    explanation:
      "Sentences 1, 2, 4 form the core mechanistic explanation, and sentence 3 — though historical — still illustrates the same underlying principle with a concrete example, keeping it on-topic. Sentence 5 shifts entirely to the sociology of public trust, a genuinely different subject unrelated to the immunological mechanism the rest of the paragraph explains.",
    marks: 3,
    negative_marks: -1,
    estimated_time_sec: 130,
  },
  {
    question_id: "VARC-024",
    section: "VARC",
    topic: "Para Jumble",
    subtopic: "Logical Sequencing",
    question_type: "TITA",
    difficulty: "Moderate-Hard",
    question_text:
      "The five sentences below, when arranged in the correct order, form a coherent paragraph. Enter the correct order as a 5-digit number using the sentence labels (for example, 12345).\n\n" +
      "1. For decades, the medical consensus held that stomach ulcers were caused primarily by stress and excess stomach acid, a theory that shaped standard treatment for generations of patients.\n" +
      "2. Faced with this entrenched skepticism, one of the two researchers, Marshall, eventually chose a more drastic form of persuasion: he deliberately drank a solution containing the bacterium and subsequently developed the symptoms of gastritis.\n" +
      "3. Two researchers, however, identified a specific bacterium living in the stomach lining of ulcer patients and proposed that this organism, not stress or acid alone, was the true underlying cause.\n" +
      "4. This dramatic act of self-experimentation, combined with years of accumulating clinical evidence, eventually persuaded the medical establishment, and the bacterium's role in ulcer disease is now considered standard medical fact.\n" +
      "5. Their claim was met with considerable resistance, since it contradicted decades of accepted medical wisdom and existing treatment protocols built around acid suppression.",
    correct_answer: "13524",
    explanation:
      "Sentence 1 establishes the old consensus with no backward reference, so it opens the paragraph. Sentence 3's 'however' requires that prior claim, so it follows. Sentence 5's 'their claim' refers to the two researchers just introduced in 3, so it follows 3. Sentence 2's 'this entrenched skepticism' refers to the resistance described in 5, so it follows 5. Sentence 4's 'this dramatic act of self-experimentation' refers to sentence 2's action, so it closes the paragraph. Order: 1-3-5-2-4.",
    marks: 3,
    negative_marks: 0,
    estimated_time_sec: 150,
  },
];
