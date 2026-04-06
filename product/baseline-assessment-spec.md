# SageReasoning Baseline Stoic Assessment — Specification

## Design Principles

- **4 core questions** — one per cardinal virtue, asked to every user
- **1 conditional question** — only triggered when score falls near a tier boundary
- **Total: 4–5 questions** to produce a reliable baseline Stoic profile
- Each answer provides a primary virtue score (0–100) and secondary signals for other virtues
- Fixed decision tree — all users follow the same structure
- Scoring uses the same virtue weights as the main scoring engine

## Scoring Formula

```
total = (wisdom * 0.30) + (justice * 0.25) + (courage * 0.25) + (temperance * 0.20)
```

## Tier Mapping

| Tier | Range | Label |
|------|-------|-------|
| Sage | 95–100 | Sage (Sophos) |
| Progressing | 70–94 | Progressing (Prokoptos) |
| Aware | 40–69 | Aware |
| Misaligned | 15–39 | Misaligned |
| Contrary | 0–14 | Contrary to Nature |

---

## Q1 — Wisdom (30% weight)

**Tests:** Dichotomy of control, correct judgement of good/bad/indifferent

> When something goes wrong that you cannot change — a job loss, a health setback, a betrayal — where does your attention go first?

| Option | Text | Wisdom | Justice | Courage | Temperance |
|--------|------|--------|---------|---------|------------|
| A | To what I can still control: my response, my next step, my character | 90 | — | 70 | 75 |
| B | To understanding why it happened, then shifting to what I can do | 75 | — | 60 | 65 |
| C | To the feelings it creates — frustration, worry — before eventually moving forward | 45 | — | 38 | 38 |
| D | To wishing it hadn't happened and replaying what could have been different | 20 | — | 20 | 20 |

**Stoic rationale:** Epictetus, Enchiridion 1 — the fundamental test of wisdom is whether you direct attention to what is in your control (prohairesis) or what is not.

---

## Q2 — Justice (25% weight)

**Tests:** Social duty, fairness, concern for the common good

> A decision you're about to make will benefit you significantly, but will disadvantage someone else who isn't aware of it. What do you do?

| Option | Text | Justice | Wisdom | Courage | Temperance |
|--------|------|---------|--------|---------|------------|
| A | I wouldn't proceed unless I could make it fair — their interests matter as much as mine | 90 | 75 | 65 | 70 |
| B | I'd tell them about the disadvantage and let them decide | 78 | 68 | 58 | 58 |
| C | I'd go ahead but try to minimise the impact on them | 50 | 42 | — | — |
| D | Their situation is their responsibility — I focus on my own interests | 20 | 25 | — | — |

**Stoic rationale:** Cicero, De Officiis 3.2 — justice requires that we never benefit ourselves at the expense of another. Oikeiosis (natural affiliation) extends our concern to all rational beings.

---

## Q3 — Courage (25% weight)

**Tests:** Acting rightly despite cost, endurance, freedom from fear of externals

> You know the right thing to do, but doing it would cost you something you value — money, comfort, a relationship, or your reputation. What typically happens?

| Option | Text | Courage | Wisdom | Justice | Temperance |
|--------|------|---------|--------|---------|------------|
| A | I do what's right — the external cost doesn't change what's virtuous | 90 | 80 | 70 | 75 |
| B | I do what's right, but it takes real effort to push through the resistance | 70 | 62 | 58 | 58 |
| C | I usually find a middle ground that feels safer | 45 | 42 | 42 | — |
| D | I tend to protect what I have and wait for a better moment | 20 | 25 | 25 | — |

**Stoic rationale:** Epictetus, Discourses 1.2 — courage is not recklessness but the rational confidence that virtue alone is truly good, so external losses cannot constitute genuine harm.

---

## Q4 — Temperance (20% weight)

**Tests:** Self-control, measured action, freedom from passion (pathê)

> When a strong emotion arises — anger at an insult, craving for something, anxiety about a loss — how do you typically respond?

| Option | Text | Temperance | Wisdom | Courage | Justice |
|--------|------|------------|--------|---------|---------|
| A | I notice the feeling, examine whether it reflects reality, and choose my response deliberately | 90 | 80 | 70 | — |
| B | I feel it strongly but usually manage to act reasonably after a pause | 70 | 58 | 55 | — |
| C | I often react first and reflect later | 40 | 32 | — | — |
| D | My emotions usually drive my actions — I act on what I feel in the moment | 15 | 15 | — | — |

**Stoic rationale:** Marcus Aurelius, Meditations 8.7 — the discipline of assent. A Stoic examines every impression (phantasia) before giving assent, rather than being swept by passion.

---

## Q5 — Conditional Refinement (branching)

**Trigger condition:** The weighted total from Q1–Q4 falls within ±5 points of a tier boundary (i.e. score is 35–44 or 65–74).

### Branch A: Near Aware/Progressing boundary (score 65–74)

> When you succeed at something difficult, what is your first internal response?

| Option | Text | Adjustment |
|--------|------|------------|
| A | Quiet satisfaction — the effort was its own reward | +8 |
| B | Genuine pride, but I keep perspective and move on | +3 |
| C | Strong excitement — I want to celebrate and be recognised for it | −3 |

**Tests:** Whether the user is motivated by virtue itself (progressing) or by external validation (aware).

### Branch B: Near Misaligned/Aware boundary (score 35–44)

> Do you believe being a good person matters more than being a successful one?

| Option | Text | Adjustment |
|--------|------|------------|
| A | Yes — my character is the one thing truly in my control | +8 |
| B | Ideally yes, but success matters too — they aren't mutually exclusive | +3 |
| C | Success first — you can't help anyone from a weak position | −5 |

**Tests:** Whether the user has latent Stoic intuitions (aware) or genuinely prioritises externals (misaligned).

### No Q5 needed: Scores outside boundary zones (0–34, 45–64, 75–100)

These scores map cleanly to their tier without additional refinement.

---

## Scoring Algorithm

### Step 1: Collect primary virtue scores

For each question, take the primary virtue score from the selected answer:
- Q1 answer → `wisdom_score`
- Q2 answer → `justice_score`
- Q3 answer → `courage_score`
- Q4 answer → `temperance_score`

### Step 2: Apply secondary signal adjustment

Each answer also provides secondary virtue signals (see tables above). Where a secondary signal exists, blend it with the primary score for that virtue at a 70/30 ratio:

```
final_virtue = (primary_score * 0.70) + (avg_secondary_signals * 0.30)
```

Example: If Q1 answer = A (Wisdom 90), the secondary courage signal is 70 and the secondary temperance signal is 75. These feed into the final courage and temperance scores as 30% weight alongside their primary scores from Q3 and Q4.

### Step 3: Compute weighted total

```
total = (wisdom * 0.30) + (justice * 0.25) + (courage * 0.25) + (temperance * 0.20)
```

### Step 4: Check boundary condition

If total is in range [35, 44] → ask Q5 Branch B, apply adjustment to total.
If total is in range [65, 74] → ask Q5 Branch A, apply adjustment to total.
Otherwise → skip Q5.

### Step 5: Map to tier and report

Output:
- Total baseline score (0–100)
- Individual virtue scores (Wisdom, Justice, Courage, Temperance)
- Alignment tier (Sage / Progressing / Aware / Misaligned / Contrary)
- Strongest virtue (highest individual score)
- Growth area (lowest individual score)
- Brief Stoic interpretation of results

---

## Output Example

```json
{
  "baseline_score": 72,
  "virtue_scores": {
    "wisdom": 78,
    "justice": 70,
    "courage": 65,
    "temperance": 72
  },
  "alignment_tier": "progressing",
  "strongest_virtue": "wisdom",
  "growth_area": "courage",
  "interpretation": "You demonstrate strong discernment about what is truly in your control and generally act with fairness toward others. Your growth edge is courage — the willingness to act on what you know is right even when the external cost is high. A Stoic practitioner at your level benefits most from deliberately choosing the harder right action in low-stakes situations to build the habit."
}
```

---

## Implementation Notes

- **Question order is fixed** — Q1→Q2→Q3→Q4→(Q5 if triggered). No reordering.
- **All users see the same 4 core questions.** Only Q5 varies by path.
- **Self-report bias:** Users tend to answer aspirationally. The questions are designed to ask "what typically happens" (behavioural) rather than "what would you do" (hypothetical) to reduce this.
- **No "correct" answers are signposted.** Option text avoids Stoic jargon so users respond authentically rather than guessing the "right" answer.
- **Re-assessment:** Recommend users retake after 30 days of using the scoring tool to track progression.
