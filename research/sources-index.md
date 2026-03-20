# SageReasoning — Stoic Source Texts Index

**Status:** P1 Research in progress
**Last updated:** March 2026
**Purpose:** Catalogues all primary stoic sources used to build the Stoic Brain data files.

---

## How to Use This Index

Each entry lists:
- The work and author
- Why it matters to the Stoic Brain
- Key passages relevant to virtues, indifferents, and scoring
- Best modern translation to use (freely available or low-cost)
- Status of extraction into data files

---

## PRIMARY SOURCES (Original Stoic Authors)

### 1. Marcus Aurelius — *Meditations* (Ta Eis Heauton)
**Date:** ~170-180 CE
**Format:** Personal journal — 12 books of private reflections
**Stoic School:** Late Stoa
**Why it matters:** The most personal, directly applicable stoic text. Written as daily self-reminders for virtuous action. Extremely practical for the scoring system — Marcus consistently applies the 4 virtues to real situations.
**Key themes:** Impermanence, duty, social obligation, dealing with difficult people, memento mori, the ruling faculty (hegemonikon), preferred indifferents
**Best free translation:** Gregory Hays (Modern Library, 2002) — clearest modern English. George Long (1862) — public domain, available via Project Gutenberg
**Extraction status:** Core passages extracted into virtues.json ✓

**Key passages for Stoic Brain:**
- Book 2.1 — Morning reflection on difficult people
- Book 4.3 — On the shortness of time and fame
- Book 5.8 — On what is in our power
- Book 6.2 — On endurance and courage
- Book 8.7 — The discipline of action (kathêkon)
- Book 9.23 — On justice and service to others
- Book 11.9 — On magnanimity

---

### 2. Epictetus — *Discourses* (Diatribai) + *Enchiridion* (Manual)
**Date:** ~108 CE (recorded by student Arrian)
**Format:** Lecture transcriptions (Discourses, 4 books) + condensed handbook (Enchiridion, 53 chapters)
**Stoic School:** Late Stoa
**Why it matters:** The most systematic practical framework. The dichotomy of control (what is "up to us" vs "not up to us") is the foundation of the entire scoring system — any action must be assessed against whether the agent acted within their prohairesis.
**Key themes:** Dichotomy of control (prohairesis), freedom, social duty, desire and aversion, the three disciplines (desire, action, judgement)
**Best free translation:** Robin Hard (Oxford World's Classics, 2014) — comprehensive. P.E. Matheson (1916) — public domain on Project Gutenberg
**Extraction status:** Core framework extracted into schema.json ✓, virtues.json ✓

**Key passages for Stoic Brain:**
- Enchiridion 1 — The foundational dichotomy of control
- Enchiridion 8 — On not demanding externals behave as you wish
- Discourses 1.1 — On what is in our power
- Discourses 1.2 — How to maintain character under pressure
- Discourses 2.1 — On freedom of choice
- Discourses 2.22 — On friendship
- Discourses 3.12 — On self-control and training
- Discourses 3.20 — On endurance
- Discourses 4.1 — On freedom

---

### 3. Seneca — *Letters to Lucilius* (Epistulae Morales)
**Date:** ~65 CE
**Format:** 124 philosophical letters
**Stoic School:** Late Stoa
**Why it matters:** The most accessible and rhetorically rich source. Excellent for the scoring reasoning field — Seneca gives vivid examples of how to evaluate specific life situations against stoic principles. His treatment of wealth, death, time, and friendship is unmatched.
**Key themes:** Time, friendship, death, wealth, progress in virtue (prokoptos), self-examination
**Best free translation:** Richard Mott Gummere (Loeb Classical Library, 1917-1925) — public domain. Robin Campbell (Penguin Classics, 1969) — excellent modern prose
**Extraction status:** Key quotes integrated into virtues.json ✓ and indifferents.json ✓

**Key letters for Stoic Brain:**
- Letter 1 — On saving time
- Letter 16 — On philosophy as a guide to life
- Letter 41 — On the god within
- Letter 47 — On treating slaves with respect (justice)
- Letter 77 — On taking one's own life (courage, indifferents)
- Letter 85 — On courage and virtue as the only good
- Letter 87 — On indifferents and wealth
- Letter 92 — On a happy life
- Letter 104 — On self-examination

---

### 4. Seneca — *On the Shortness of Life* (De Brevitate Vitae)
**Date:** ~49 CE
**Format:** Essay
**Why it matters:** Core treatment of how wisdom relates to time — key for the daily action-scoring use case. Shows how virtue requires active engagement, not passive reflection.
**Extraction status:** Pending — scheduled for P3 data extraction

---

### 5. Seneca — *On the Happy Life* (De Vita Beata)
**Date:** ~58 CE
**Format:** Essay
**Why it matters:** Defines flourishing (eudaimonia) in stoic terms — essential for the "flourishing score" concept.
**Extraction status:** Pending — scheduled for P3 data extraction

---

## SECONDARY SOURCES (Reporting Stoic Doctrine)

### 6. Diogenes Laertius — *Lives of the Eminent Philosophers*, Book 7
**Date:** ~3rd century CE
**Format:** Doxographical compendium
**Why it matters:** The most systematic ancient summary of early Stoic doctrine (Zeno, Cleanthes, Chrysippus). Book 7 is the primary reference for the formal classification of virtues, sub-virtues, indifferents, and the sage ideal. Used as the structural backbone of virtues.json and indifferents.json.
**Key sections:** 7.84-131 (Stoic ethics), 7.92-99 (virtues and passions), 7.101-107 (indifferents)
**Best translation:** R.D. Hicks (Loeb Classical Library, 1925) — public domain
**Extraction status:** Core doctrine extracted into virtues.json ✓ and indifferents.json ✓

---

### 7. Cicero — *De Finibus Bonorum et Malorum* (On Ends), Book 3
**Date:** 45 BCE
**Format:** Philosophical dialogue
**Why it matters:** Contains the most complete surviving account of early Stoic ethics, presented by the character Cato. Essential for formally defining the four virtues and their relationship. Also the best source on the theory of appropriate action (kathêkon).
**Key sections:** Book 3.16-76
**Best translation:** H. Rackham (Loeb Classical Library, 1914) — public domain
**Extraction status:** Core virtue definitions extracted ✓

---

### 8. Cicero — *De Officiis* (On Duties)
**Date:** 44 BCE
**Format:** Treatise in 3 books
**Why it matters:** Best surviving treatment of kathêkon (appropriate/fitting action) — directly relevant to the action-scoring engine. Discusses how to adjudicate conflicts between virtues and between virtue and apparent self-interest.
**Key sections:** Book 1 (on the four virtues), Book 3 (on conflicts of duty)
**Best translation:** Walter Miller (Loeb, 1913) — public domain
**Extraction status:** Pending — high priority for scoring-rules.json

---

### 9. Stobaeus — *Anthology* (Eclogae)
**Date:** ~5th century CE
**Format:** Anthology of philosophical excerpts
**Why it matters:** Preserves key fragments of Chrysippus and other early Stoics not available elsewhere. The most important source for early Stoic psychology (passions, impulses) and the theory of value.
**Key sections:** Eclogae 2.57-116 (Stoic ethics)
**Extraction status:** Pending — advanced research phase

---

## MODERN SCHOLARSHIP (Reference Only)

| Author | Work | Relevance |
|--------|------|-----------|
| Brad Inwood | *Ethics and Human Action in Early Stoicism* (1985) | Best academic treatment of impulse theory and action |
| A.A. Long & D.N. Sedley | *The Hellenistic Philosophers* (1987) | Primary fragments + translations, Vol 1 ch. 57-67 |
| Julia Annas | *The Morality of Happiness* (1993) | Virtue and eudaimonia across schools |
| Tad Brennan | *The Stoic Life* (2005) | Clearest modern explanation of indifferents + scoring theory |
| John Sellars | *Stoicism* (2006) | Accessible academic introduction |
| Massimo Pigliucci | *How to Be a Stoic* (2017) | Modern application framework |

---

## Next Steps

- [ ] Extract Cicero *De Officiis* Book 1 & 3 into scoring-rules.json (P5)
- [ ] Extract Seneca *On the Happy Life* into stoic-brain.json eudaimonia section (P3)
- [ ] Create meditations-marcus-aurelius.md — passage-level reference file
- [ ] Create discourses-epictetus.md — passage-level reference file
- [ ] Create letters-seneca.md — passage-level reference file
