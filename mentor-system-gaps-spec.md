{\rtf1\ansi\ansicpg1252\cocoartf2869
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;\red223\green223\blue223;\red16\green16\blue16;}
{\*\expandedcolortbl;;\cssrgb\c89804\c89804\c89804;\cssrgb\c7843\c7843\c7843;}
\paperw11900\paperh16840\margl1440\margr1440\vieww28380\viewh21860\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs28 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 ```markdown\
# Mentor System \'97 Gap Implementation Specification\
\
**Status:** Approved for build  \
**Date:** 2026-04  \
**Risk Classification:** ELEVATED \'97 new schema, user-facing features, LLM classification integration, dependency chain between Gap 1 and Gap 2  \
**Build sequence:** Gap 1 + Gap 2 (parallel scaffold) \uc0\u8594  Gap 3 \u8594  Gap 5  \
**Gap 4:** Founder-private scaffolding. Not a product feature. Not in this build sequence.\
\
---\
\
## CRITICAL DEPENDENCY NOTE\
\
Gap 2's classifier validation depends on live Gap 1 data. The quality signal \'97 "LLM classification confirms user's own diagnosis \uc0\u8805 70% of the time within 8 weeks" \'97 requires real journal entries to classify. Testing Gap 2 against synthetic or manually-entered data will not validate the diagnostic function.\
\
**Build instruction:** Scaffold Gap 1 and Gap 2 in parallel. Wire Gap 1 first. Gap 2 functional testing is blocked until Gap 1 is live and generating real entries.\
\
---\
\
## PRACTITIONER CONTEXT (Clinton \'97 reference for classifier calibration)\
\
**Senecan grade:** proficiens_medius (deliberate proximity)  \
**Primary passion:** philodoxia (epithumia) \'97 frequency 9/12 sections, intensity strong, pattern persistent  \
**Secondary passions:** agonia (phobos), penthos (lupe), oknos (phobos), aischyne (phobos)  \
**Primary causal breakdown:** synkatathesis \'97 assents to false impressions about reputation, respect, and self-worth  \
**Secondary breakdowns:** horme (anger impulse bypasses deliberation), phantasia (catastrophising)\
\
This profile informs classifier calibration and integration signal targets. The 70% confirmation rate and philodoxia intensity trend targets are calibrated against this profile.\
\
---\
\
## GAP 1 \'97 Real-Time Journal Feed\
\
**Build order:** First (parallel with Gap 2 scaffold)  \
**Priority:** High \'97 foundational. All other gaps depend on live data.\
\
**Problem solved:** Inconsistent self-awareness. Users reflect on events days later when the impression has faded and the false judgement is no longer visible. The structured feed captures the live causal sequence before rationalisation sets in.\
\
### Measurement Baselines\
\
**Frequency baseline:** \uc0\u8805 4 structured entries per week\
\
**Quality signal:** Each entry captures all 3 required fields:\
1. Impression \'97 what appeared to be happening\
2. Assent \'97 what judgement was made\
3. Action \'97 what was done\
\
Narrative reflection alone does not satisfy the quality signal. All three fields must be present.\
\
**Integration signal:** Within 4 weeks, at least one session where the user references a specific recent entry unprompted \'97 meaning the feed is shaping reasoning, not just archiving it.\
\
**What proves it changed:** User moves from retrospective journalling to same-day or next-day capture. The lag between event and record drops below 24 hours for \uc0\u8805 60% of entries within 6 weeks.\
\
### Required Features\
\
- Entry form with three required fields: impression (text), assent (text), action (text)\
- Timestamp on every entry \'97 lag calculation requires this\
- Chronological feed view \'97 scannable, not buried\
- Lag metric display \'97 average time between event and record, visible to user\
- Entry reference mechanism \'97 ability to link a session note to a specific journal entry (enables integration signal measurement)\
- No entry accepted without all three fields populated\
\
### Schema (proposed)\
\
```sql\
journal_entries (\
  id uuid primary key,\
  user_id uuid references auth.users,\
  impression text not null,\
  assent text not null,\
  action text not null,\
  event_timestamp timestamptz,        -- when the event occurred (user-entered)\
  created_at timestamptz default now(), -- when the entry was recorded\
  lag_hours numeric generated always as \
    (extract(epoch from (created_at - event_timestamp))/3600) stored\
)\
```\
\
### Done Criteria\
\
- Entry form live with three required fields\
- Timestamp captured on every entry\
- Feed view renders chronologically\
- Lag metric calculated and displayed\
- At least one entry successfully created and retrieved via API\
\
---\
\
## GAP 2 \'97 Passion Log + Classification\
\
**Build order:** Parallel scaffold with Gap 1 \'97 functional testing blocked until Gap 1 is live  \
**Priority:** Highest \'97 solves the most universal and acute pain. Validates the engine's core diagnostic function.\
\
**Problem solved:** Reactive versus proactive passion management. Users know Stoic theory but cannot reliably catch themselves before assent. The log creates the feedback loop that makes the synkatathesis gap visible and measurable.\
\
### Dependency Gate\
\
> Gap 2 functional testing \'97 specifically classifier validation \'97 does not begin until Gap 1 is wired and generating real entries. Scaffold the schema and endpoints in parallel. Do not run classifier accuracy tests against synthetic data.\
\
### Measurement Baselines\
\
**Frequency baseline:** \uc0\u8805 1 passion event logged per week across the first 4 weeks \'97 no improvement target yet, just honest measurement. Expect mostly post-assent catches initially.\
\
**Quality signal:** Each entry captures four required fields:\
1. Passion type (from Stoic taxonomy)\
2. Intensity rating (1\'965)\
3. Caught before or after assent (boolean)\
4. False judgement that drove it (text)\
\
LLM classification confirms user's own diagnosis \uc0\u8805 70% of the time within 8 weeks. Persistent mismatch is diagnostic data about blind spots, not failure.\
\
**Integration signal:** By week 8, philodoxia events specifically show a downward intensity trend even if frequency remains stable. Intensity reduction is the real progress marker for a dominant passion.\
\
**Operational signal:** Pre-assent catch rate, defined as the percentage of total passion events where the user caught themselves before assent.\
\
- *Metric:* Pre-assent catch rate (%) = pre-assent events \uc0\u247 total passion events logged \u00d7 100\
- *Baseline:* ~20%, estimated from the founder\'92s current practice (most catches are post-assent)\
- *Target trajectory:* \uc0\u8805 35% by week 12. A clear upward trend from week 4 onward is meaningful signal even if the absolute target is not yet reached.\
- *Measurement method:* Weekly aggregation from the passion log. Count entries where `caught_before_assent = true`, divide by total entries for that week, multiply by 100. Reported as a rolling weekly metric in the pre/post-assent catch rate view.\
\
> **Note:** This metric is the real proof Gap 2 is working. Classifier accuracy (\uc0\u8805 70% match with user\'92s own diagnosis) validates that the engine understands the user\'92s experience. The operational signal validates something more important: that the user is catching themselves earlier. A classifier that agrees with the user 90% of the time is worthless if the user never catches a passion before assent. Conversely, a modest classifier match rate with a rising pre-assent catch rate means the practice is working. Separate these two signals in all reporting.\
\
**What proves it changed:** A 12-week dataset showing direction of travel on pre-assent catch rate, moving from an estimated ~20% toward \uc0\u8805 35%. A clear upward trend from week 4 to week 12 is meaningful signal even if the target isn't yet reached.\
\
### Required Features\
\
- Entry form: passion type (dropdown from Stoic taxonomy), intensity (1\'965 scale), caught before/after assent (toggle), false judgement (text)\
- LLM classification endpoint: user submits description \uc0\u8594  engine returns passion type + confidence score\
- Comparison display: user's self-diagnosis vs engine classification, side by side\
- Mismatch handling: persistent mismatch flagged as diagnostic data, not error\
- Trend view: intensity over time per passion type\
- Pre/post-assent catch rate over time (12-week view)\
- Philodoxia-specific intensity trend (given dominant passion profile)\
\
### Passion Type Taxonomy (dropdown values)\
\
Epithumia family: philodoxia, orge, pothos, philedonia, philoplousia, eros  \
Phobos family: agonia, oknos, aischyne, deima, thambos, thorybos  \
Lupe family: penthos, phthonos, zelotypia, eleos, achos  \
Hedone family: kelesis, epichairekakia, terpsis\
\
### LLM Classification Endpoint\
\
```\
POST /api/mentor/passion-classify\
Input: \{ description: string, user_diagnosis: passion_type \}\
Output: \{ classified_type: passion_type, confidence: number, match: boolean, reasoning: string \}\
```\
\
- Use MODEL_FAST (haiku) \'97 classification task, not deep reasoning\
- Rate limit: apply RATE_LIMITS.scoring or equivalent\
- Cache identical inputs via cacheKey() + cacheGet()/cacheSet()\
- Validate input with validateTextLength() \'97 medium limit (5000 chars)\
\
### Schema (proposed)\
\
```sql\
passion_events (\
  id uuid primary key,\
  user_id uuid references auth.users,\
  passion_type text not null,          -- user's self-diagnosis\
  intensity int check (intensity between 1 and 5),\
  caught_before_assent boolean not null,\
  false_judgement text not null,\
  llm_classified_type text,            -- engine classification\
  llm_confidence numeric,\
  classification_match boolean,        -- user vs engine agreement\
  created_at timestamptz default now()\
)\
```\
\
### Done Criteria\
\
- Entry form live with four required fields\
- LLM classification endpoint live and returning structured response\
- Comparison display renders user vs engine diagnosis\
- Trend view renders intensity over time per passion type\
- Pre/post-assent catch rate calculated and displayed\
- Classification accuracy trackable across entries (match rate queryable)\
\
---\
\
## GAP 3 \'97 Premeditatio Scheduling\
\
**Build order:** Third \'97 after Gap 1 and Gap 2 are stable and generating data  \
**Priority:** High \'97 behavioural change is measurable and visible.\
\
**Problem solved:** Avoidance and catastrophising. Users understand premeditatio conceptually but do not practise it systematically. The scheduled prompt converts an occasional exercise into a structured habit, directly targeting agonia and oknos.\
\
### Measurement Baselines\
\
**Frequency baseline:** Weekly prompt delivered every Monday morning. Engagement: prompt opened and response recorded \uc0\u8805 3 of 4 weeks per month.\
\
**Quality signal:** Each response names:\
1. A specific anticipated event\
2. The false impression most likely to arise\
3. The correct judgement to hold in advance\
\
Generic responses ("I will be virtuous this week") do not count. The prompt must be tied to a concrete upcoming situation. Quality gate enforced.\
\
**Integration signal:** Within 8 weeks, at least one documented instance where a completed premeditatio preceded an action previously avoided. Cross-reference with Gap 2: do agonia and oknos events decrease in the week following a completed premeditatio?\
\
**What proves it changed:** Two documented before/after instances where the premeditatio directly addressed an avoidance behaviour and the behaviour changed. The signal is not the prompt being sent \'97 it is the behaviour changing.\
\
### Required Features\
\
- Scheduled Monday morning prompt (push notification or email \'97 mechanism TBD)\
- Response form: three required fields (anticipated event, false impression, correct judgement)\
- Quality gate: generic responses flagged, not accepted as complete\
- Cross-reference link: connect a premeditatio entry to a subsequent Gap 2 passion log entry\
- Before/after tracking: tag a behaviour as previously avoided, mark when it changes\
- Engagement metric: prompt opened + response recorded, tracked per week\
\
### Schema (proposed)\
\
```sql\
premeditatio_entries (\
  id uuid primary key,\
  user_id uuid references auth.users,\
  anticipated_event text not null,\
  false_impression text not null,\
  correct_judgement text not null,\
  is_generic boolean default false,     -- quality gate flag\
  linked_passion_event_id uuid references passion_events(id),\
  avoidance_behaviour_tag text,         -- optional: tag a previously avoided behaviour\
  behaviour_changed boolean,            -- mark when the behaviour changes\
  prompt_sent_at timestamptz,\
  created_at timestamptz default now()\
)\
```\
\
### Done Criteria\
\
- Weekly Monday prompt delivered (mechanism confirmed)\
- Response form live with three required fields\
- Quality gate flags generic responses\
- Cross-reference to passion log entry functional\
- Engagement metric tracked and queryable\
\
---\
\
## GAP 5 \'97 Oikeiosis Extension Tracking\
\
**Build order:** Fourth \'97 after Gaps 1, 2, and 3 are stable  \
**Priority:** Moderate \'97 important for long-term practitioner development.\
\
**Problem solved:** Narrow practice. Users plateau at household-level concern without a structure that prompts genuine extension. The quarterly reflection makes the expansion of the moral circle a measurable practice rather than an aspiration.\
\
### Measurement Baselines\
\
**Frequency baseline:** One structured reflection per quarter. Four reflections across 12 months establish the baseline trajectory.\
\
**Quality signal:** Each reflection identifies \uc0\u8805 2 specific actions taken (not intentions) that extended concern beyond the household circle. Must distinguish:\
- Genuine extension: acting for others' benefit with no reputational return\
- Philodoxia-contaminated service: acting to be seen as generous\
\
This distinction is not optional given the dominant passion profile.\
\
**Integration signal:** By quarter 4, community-stage actions have become habitual rather than deliberate \'97 no longer requiring the quarterly prompt to initiate. At least one humanity-stage action documented across the 12-month period.\
\
**What proves it changed:** Community stage moves from developing to strong within 4 quarters, evidenced by a pattern of actions rather than isolated instances. The quarterly prompt becomes confirmatory rather than generative.\
\
### Required Features\
\
- Quarterly prompt (scheduled, Sunday morning)\
- Reflection form: oikeiosis stage selector (self / household / community / humanity / cosmic), action description (text), reputational return question (yes/no/partial)\
- Philodoxia flag: entries where reputational return = yes are flagged for review\
- Stage progression view: track movement across the five circles over 4 quarters\
- Cross-reference with Gap 2: surface philodoxia events linked to community actions\
\
### Schema (proposed)\
\
```sql\
oikeiosis_reflections (\
  id uuid primary key,\
  user_id uuid references auth.users,\
  quarter int,                          -- 1\'964\
  year int,\
  stage text not null,                  -- self/household/community/humanity/cosmic\
  action_description text not null,\
  reputational_return text,             -- yes/no/partial\
  philodoxia_flagged boolean default false,\
  linked_passion_event_id uuid references passion_events(id),\
  created_at timestamptz default now()\
)\
```\
\
### Done Criteria\
\
- Quarterly prompt delivered on schedule\
- Reflection form live with required fields\
- Philodoxia flag applied automatically when reputational return = yes\
- Stage progression view renders across quarters\
- Cross-reference to passion log functional\
\
---\
\
## GAP 4 \'97 Project-Self Integration Report\
\
**Status:** NOT IN BUILD SEQUENCE  \
**Scope:** Founder-specific scaffolding. Not a product feature. Managed privately through the mentor relationship.\
\
---\
\
## VALIDATION MATRIX\
\
| Gap | Acute pain solved | Priority | Dependency |\
|-----|-------------------|----------|------------|\
| Gap 1 \'97 Real-Time Journal Feed | Inconsistent self-awareness. Live causal sequence captured before rationalisation. | High \'97 foundational | None |\
| Gap 2 \'97 Passion Log + Classification | Reactive vs proactive passion management. Synkatathesis gap visible and measurable. | **Highest** | Gap 1 data for classifier validation |\
| Gap 3 \'97 Premeditatio Scheduling | Avoidance and catastrophising. Converts occasional exercise into structured habit. | High | Gap 2 stable |\
| Gap 5 \'97 Oikeiosis Extension | Narrow practice. Moral circle expansion measurable. | Moderate | Gaps 1\'963 stable |\
| Gap 4 \'97 Project-Self Integration | Founder-specific integrity drift. | Not in build sequence | \'97 |\
\
---\
\
## ROLLBACK PLAN\
\
**If Gap 1 schema fails:** Journal entries table is additive \'97 no existing tables modified. Drop and recreate without affecting current system.  \
**If Gap 2 classifier fails:** Passion log entries still captured without classification. LLM field nullable \'97 entries degrade gracefully to manual-only mode.  \
**If Gap 2 testing reveals Gap 1 data quality is insufficient:** Pause Gap 2 classifier validation, diagnose Gap 1 entry quality, fix entry form before resuming.\
\
---\
\
## OPEN QUESTIONS FOR BUILDER\
\
1. **Prompt delivery mechanism for Gap 3:** Email (Supabase email), push notification, or in-app prompt on login? Confirm before building scheduler.\
2. **User-facing lag display for Gap 1:** Does the user enter the event timestamp manually, or is it inferred from created_at? Manual entry is more accurate but adds friction.\
3. **Classification confidence threshold for Gap 2:** What confidence score constitutes a meaningful match vs a low-confidence guess? Suggest \uc0\u8805 0.7 as initial threshold \'97 confirm.\
4. **RLS policies:** Confirm all new tables are user-scoped (user_id = auth.uid()) before any data is written.\
```\
}