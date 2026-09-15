import { QuestionGroup } from "../types";

// ============================================================================
// VARC RC PASSAGES
// 4 original passages, deliberately uneven in difficulty and length so
// choosing which one to start with is a real decision — same principle as
// DILR's uneven sets. Each is self-contained: every question is answerable
// from the passage alone, no outside knowledge required. Every question's
// correct answer and each distractor's flaw was reasoned through explicitly
// during authoring (see the DILR/QA precedent of computational verification —
// argument structure isn't machine-checkable the way arithmetic is, so this
// specific reason, not just vaguely "off").
//
// group_id here plays the same role passage_id will reference on questions
// that DILR's set_id already plays for DI/LR sets — no new mechanism.
// ============================================================================

export const VARC_GROUPS: QuestionGroup[] = [
  {
    group_id: "VARC-PASSAGE-1",
    section: "VARC",
    title: "The Attention Economy",
    stimulus_text: `For most of the twentieth century, advertisers competed for a scarce resource: shelf space, airtime, print columns. The scarcity was structural — a newspaper had only so many pages, a television network only so many broadcast hours — and this constraint did the work of rationing attention for the audience. A reader who bought a newspaper was, in effect, choosing to read a fixed and finite set of things.

Digital platforms dissolved that constraint. An article, a video, or a social media post no longer competes for physical space; it competes only for the minutes and seconds of a person who could, at any moment, choose to look at something else entirely. This shift did not simply change how content is distributed; it changed what content is optimized to do. When shelf space was the scarce resource, publishers optimized for what would sell once chosen. When attention itself became the scarce resource, publishers began optimizing for what would be chosen at all, and then for what would prevent the audience from choosing to leave.

This is not, in itself, a story of manipulation by a few bad actors. It is closer to a structural consequence of what happens when a resource that was once rationed by physical constraints becomes, instead, rationed by psychological ones. Any platform that fails to hold attention will lose it to a competitor that does, regardless of the intentions of any individual designer. The incentive is built into the architecture of the market, not into any single company's ethics.

What follows from this is not that individual users are powerless, but that individual willpower is competing against an entire industry's accumulated, iterated expertise in capturing it. A single person deciding to "concentrate better" is attempting, alone, what thousands of engineers and designers are paid, continuously, to defeat. The asymmetry is the point: attention did not become scarce because people grew weaker at focusing, but because an entire economic structure now depends on their failing to.`,
    difficulty: "Easy-Moderate",
    estimated_time_sec: 500,
  },
  {
    group_id: "VARC-PASSAGE-2",
    section: "VARC",
    title: "The Concept of a Keystone Species",
    stimulus_text: `Ecologists distinguish between two kinds of importance a species can have within an ecosystem. The first is straightforward: a species is important in proportion to its abundance or biomass, the sheer quantity of it relative to everything else. The second is different, and considerably more interesting: a species can be disproportionately important not because there is a great deal of it, but because the stability of the entire system depends on its presence in a way that has little to do with its numbers. Ecologists call such a species a keystone species, borrowing the term from architecture, where a keystone is the wedge-shaped block at the top of an arch that holds the entire structure together, even though it is often no larger than any other block in the arch.

The sea otter is a frequently cited example. Sea otters are not numerous, and if measured purely by biomass, they are a minor presence along the coastlines they inhabit. Yet they prey on sea urchins, and sea urchins, left unchecked, graze kelp forests down to bare rock. Remove the otter, and the urchin population expands unchecked; remove the kelp forest along with it, and an entire community of fish, invertebrates, and birds that depended on the kelp for shelter and food loses its habitat. The otter's importance, in other words, is not captured by counting otters. It is captured only by asking what would happen to everything else if the otter were removed.

This distinction matters beyond ecology, because it reframes what "importance" means in any interconnected system. A component's significance is not always visible in its size, its frequency, or the resources allocated to it. It can instead be a function of the dependencies that run through it — dependencies that remain invisible under ordinary conditions and become obvious only in the counterfactual case of removal. This is precisely why keystone species are so often identified only after decline or local extinction has already begun: their significance is structural rather than observable, and structural properties tend to reveal themselves only through disruption.`,
    difficulty: "Moderate",
    estimated_time_sec: 560,
  },
  {
    group_id: "VARC-PASSAGE-3",
    section: "VARC",
    title: "Tacit Knowledge and the Limits of Instruction",
    stimulus_text: `There is a category of knowledge that resists being written down, not because no one has tried, but because its nature makes the attempt self-defeating. Consider the difference between knowing the rules of grammar and knowing how to speak fluently. A fluent speaker routinely produces sentences that are grammatically correct without being able to state the rule that makes them so; asked to explain, they often reach for a rule after the fact, one that may not even accurately describe what they actually do when they speak. The philosopher Michael Polanyi called this tacit knowledge: knowledge we possess and reliably act on, but cannot fully articulate, because the articulation is not merely difficult but of a different kind altogether from the knowing itself.

The temptation, particularly in fields that prize rigor, is to treat tacit knowledge as an early, immature stage of understanding — something that persists only until someone finally works out the underlying rule and writes it down. On this view, a skilled craftsman's intuition is simply an unformalized theory waiting for a sufficiently patient researcher to formalize it. But this view mistakes the relationship between rule and skill. A written rule can guide a novice toward competence, but competence itself, once achieved, routinely outruns any rule that was used to reach it. Expert chess players, for instance, do not calculate every legal continuation from first principles; they recognize patterns whose recognition cannot be fully reduced to the explicit heuristics found in any textbook, heuristics which were themselves derived, imperfectly, from watching people who already had the skill.

This has a consequence that is easy to miss: instruction can transmit the scaffolding that helps a learner acquire a skill, but it cannot transmit the skill directly, because the skill, once internalized, is not the same kind of thing as the instructions that pointed toward it. This is why apprenticeship — sustained proximity to someone who already possesses a skill — remains indispensable in fields from surgery to winemaking to advanced mathematics, even in an age when nearly every explicit rule anyone knows has already been written down somewhere. What cannot be written down is not a temporary gap in our documentation. It is a permanent feature of what skill actually is.`,
    difficulty: "Moderate-Hard",
    estimated_time_sec: 700,
  },
  {
    group_id: "VARC-PASSAGE-4",
    section: "VARC",
    title: "Invented Traditions and the Illusion of Continuity",
    stimulus_text: `Certain practices present themselves as ancient, continuous, and unbroken, when in fact they are relatively recent inventions dressed in the vocabulary of antiquity. This is not a claim that such practices are fraudulent in any simple sense, nor that everyone who participates in them is being deceived. It is instead an observation about how societies, particularly during periods of rapid change, often manufacture a sense of historical continuity precisely because the change itself has been so disorienting. The invention of tradition, in this sense, is not primarily about deceiving an audience; it is about supplying a society with the psychological reassurance of rootedness at the exact moment when its actual roots are being severed.

The distinction that matters here is between a tradition that has genuinely persisted with only minor modification, and a practice that is retrospectively assigned an ancient pedigree it did not actually possess, in order to lend it an authority that a recent innovation, honestly labeled as such, would not command. Many national ceremonies, items of formal dress, and civic rituals that appear timeless were, in fact, standardized and popularized within living memory of their supposed antiquity, often during precisely the decades when the older, genuinely organic customs they claim to continue were disappearing under the pressure of industrialization, mass politics, or the consolidation of new nation-states. The invented tradition frequently emerges, in other words, not despite the disappearance of older custom but because of it: it fills a vacancy.

This does not mean invented traditions are without social function, or that identifying a tradition as invented amounts to discrediting it. A practice can be a recent invention and still perform genuine cultural work — binding a community, marking transitions, encoding shared values — just as effectively as a practice with a longer, more organic pedigree. What the distinction does demand, however, is a certain honesty about the difference between continuity that actually occurred and continuity that has been retrospectively asserted. Conflating the two does not merely produce a historical inaccuracy; it obscures the specific historical conditions — the disruption, the anxiety, the deliberate manufacture — that gave rise to the tradition in the first place, and in doing so, it forecloses a more interesting question than whether the tradition is 'authentic': namely, what need it was invented to serve.`,
    difficulty: "Hard",
    estimated_time_sec: 660,
  },
];
