# sage-interpret — External Journal Interpretation Skill

## Purpose

This skill guides a Cowork session through the process of interpreting an external Stoic journal (not created on the SageReasoning website) to build the founder's starting MentorProfile, populate the Mentor Ledger (including aims, commitments, realisations, questions, tensions, and intentions), and capture one-off import enrichments (self-authored maxims, emotional anchors, growth evidence, and unfinished threads).

**This is a one-off import opportunity.** The journal captures 55+ days of real-time reflection. The temporal arc, emotional freshness, and longitudinal patterns cannot be reconstructed after import. The skill maximises extraction on the first pass.

## When to Use

- The user wants to upload handwritten journal pages for transcription
- The user has a pre-transcribed journal to interpret against the Stoic Brain
- The user wants to build or rebuild their MentorProfile from an external journal
- The user mentions "journal upload", "transcribe my journal", or "build my profile"

## Journal Details

**Clinton's External Journal:**
- Over 100 handwritten pages, photographed
- 12 themed sections (not the SageReasoning 7-phase structure)
- Format: Printed Stoic statement → question(s) → handwritten answers
- Contains the practitioner's stated aims, goals, and identity-level aspirations embedded in the entries

**The 12 Sections:**
1. Live in the Present
2. Embrace Difficulty
3. Practice Acceptance
4. A Virtuous Life
5. Master Your Thoughts
6. Master Your Feelings
7. Live in Gratitude
8. Accept Your Fate
9. Choose Serenity
10. Cultivate Wisdom
11. Be Content
12. Be Responsible for Others

## Workflow

### Phase 1: Transcription (for handwritten pages)

1. **Ask which section** the uploaded photos belong to.
2. **Ask the page range** (e.g., pages 1-5 of "Live in the Present").
3. For each uploaded photo:
   a. Use Claude's vision to read the handwritten text.
   b. Separate the **printed prompt/question** from the **handwritten response**.
   c. Mark illegible words with `[illegible]` and uncertain words with `[?]`.
   d. Present the transcription to the user for review.
4. **User edits** any transcription errors.
5. Save the corrected transcription to a JSON file at:
   ```
   sage-mentor/journal-data/transcribed/{section-name-slug}.json
   ```
   Format:
   ```json
   {
     "section": "Live in the Present",
     "entries": [
       {
         "page": 1,
         "prompt": "The printed teaching or question text",
         "response": "The user's handwritten answer transcribed here"
       }
     ]
   }
   ```

### Phase 2: Importing Pre-Transcribed Text

If the user has already typed up sections:
1. Accept the text (pasted, uploaded as .txt/.docx, or provided as a file).
2. Parse it to identify the section name, prompts, and responses.
3. Save in the same JSON format as Phase 1.

### Phase 3: Interpretation (Layer 1 — Baseline Extraction)

Once all sections are transcribed (or enough to start):

1. **Load the interpreter module:**
   ```typescript
   import {
     buildJournalFromSections,
     prepareInterpretation,
     buildProfileFromExternalJournal,
   } from './sage-mentor/journal-interpreter'
   ```

2. **Build the journal object** from all saved section files:
   ```typescript
   const journal = buildJournalFromSections(
     "Clinton's Stoic Journal",
     sections,
     totalPages
   )
   ```

3. **Prepare interpretation prompts:**
   ```typescript
   const { chunks, prompts } = prepareInterpretation(journal)
   ```

4. **Run each prompt** through the LLM (Sonnet model — deep extraction):
   - Use `callAnthropic()` from `sage-mentor/llm-bridge.ts`
   - Each prompt includes THREE extraction addenda:
     a. The layer-specific extraction (passion map, causal tendencies, etc.)
     b. The **Mentor Ledger extraction** (`LEDGER_EXTRACTION_ADDENDUM`) — captures aims, commitments, realisations, questions, tensions, and intentions with engagement intensity scores
     c. The **Import Enrichment extraction** (`IMPORT_ENRICHMENT_ADDENDUM`) — captures self-authored maxims, emotional anchors, growth evidence, and unfinished threads
   - Parse each response as a JSON object containing `layer_extraction`, `ledger_entries`, and `import_enrichment`
   - If JSON parsing fails, ask the model to retry

5. **Aggregate into a MentorProfile:**
   ```typescript
   const result = buildProfileFromExternalJournal(
     userId, displayName, journalName, extractions
   )
   ```

6. **Aggregate the Mentor Ledger:**
   ```typescript
   import { aggregateLedgerExtractions } from './sage-mentor/mentor-ledger'
   const ledger = aggregateLedgerExtractions(userId, journalName, sectionExtractions)
   ```

7. **Collect Import Enrichments** (maxims, emotional anchors, growth evidence, unfinished threads) into an `ImportEnrichment` object. Save to:
   ```
   sage-mentor/journal-data/import-enrichment.json
   ```

8. **Seed the profile** via `seedProfileFromIngestion()` from `profile-store.ts`.

9. **Embed the journal data** using `batchEmbed()` from `embedding-pipeline.ts` so it's searchable in semantic memory.

### Phase 4: Review

1. Present a summary of the interpretation to the user:
   - Which passions were detected (and how frequently)
   - Causal tendencies (where reasoning breaks in the sequence)
   - Value hierarchy observations (any classification gaps)
   - Virtue profile across the four domains
   - Oikeiosis map (circles of concern)
   - Overall proximity estimate and Senecan grade
2. Present the **Mentor Ledger summary**:
   - How many entries were extracted by kind (aims, commitments, realisations, questions, tensions, intentions)
   - The top 5 highest sage-path-weight entries
   - Any persistent tensions (appear across multiple sections)
   - Any aims that were identified
3. Present the **Import Enrichments**:
   - Self-authored maxims (the practitioner's own formulations — "your words, not Seneca's")
   - Emotional anchors (vivid experiences the mentor can reference later)
   - Growth evidence (pairs of entries showing developmental change between early and late journal)
   - Unfinished threads (topics started but never resolved — the mentor should return to these)
4. Ask the user if anything seems off or needs adjustment.
5. Save the final profile, ledger, and enrichments.

### Phase 5: Post-Import Activation

After the import is reviewed and saved:

1. **Set up scheduled reflections.** The resurfacing engine (`selectForScheduledReflection()` from `mentor-ledger.ts`) and the reflection generator (`prepareMorningReflection()` from `reflection-generator.ts`) are now ready to produce daily stoic-style reflections drawn from the Mentor Ledger and Import Enrichments.

2. **Contextual resurfacing is ready.** When the user invokes sage-consult during a working session, the system will automatically query the Mentor Ledger for entries whose passions, virtues, or causal stages match the current session context and generate a brief "From Your Journal" reflection.

3. **Inform the user** what's now active:
   - "Your journal has been interpreted. The mentor now carries [N] insights from your journal, including [N] aims, [N] realisations, and [N] tensions."
   - "When you invoke sage-consult during a session, the mentor will surface relevant journal entries."
   - "You can set up a daily morning reflection that draws from your journal insights."

## Important Notes

- **One-off enrichment extraction:** The Import Enrichment addendum (`IMPORT_ENRICHMENT_ADDENDUM`) should ONLY run during the initial import. It captures temporal-arc-dependent data (growth evidence, developmental patterns) that cannot be reconstructed from a re-interpretation. Save the results permanently.
- **Batch uploads:** The user will upload photos in batches (not all 100+ pages at once). Track which sections are complete and which still need pages.
- **Transcription quality:** Handwriting varies. Always present transcriptions for user review before interpretation. Never run interpretation on unreviewed transcriptions.
- **Section mapping:** The 12 sections map to the Stoic Brain via `EXTERNAL_SECTION_MAPPING` in `journal-interpreter.ts`. If the user has additional sections not in the mapping, use the generic fallback.
- **Incremental processing:** The user can start interpretation with some sections complete and add more later. The profile can be rebuilt as new sections are added. However, the Import Enrichment extraction should ideally run on the complete journal to capture cross-section patterns (growth evidence, contradictions, unfinished threads).
- **Privacy:** Journal content is deeply personal. Never share, log, or display more of it than necessary for the transcription review step. Import Enrichments contain condensed personal data and receive R17 intimate data protections.
- **Engagement intensity scoring:** Each ledger entry includes an engagement_intensity score (0.0-1.0) indicating how genuinely the practitioner was engaging when they wrote it. This score drives the resurfacing engine — high-engagement entries (genuine wrestling, breakthrough moments) are surfaced more frequently than perfunctory ones.
- **Sage-path weighting:** Each ledger entry includes a sage_path_weight score combining developmental priority, engagement intensity, and entry kind. This determines which insights are prioritised for reinforcement over time. Entries connected to persisting passions or the weakest virtue domain receive bonus weighting.

## Extraction Categories

### Mentor Ledger (6 kinds)

| Kind | What It Captures | Accountability |
|------|-----------------|----------------|
| **Aim** | Identity-level aspirations, life goals, stated purpose | Woven into framing, not checked for follow-through |
| **Commitment** | Specific actions with target timeframes | Mentor checks follow-through |
| **Realisation** | Moments of self-knowledge worth preserving | Surfaced when context recurs |
| **Question** | Unanswered questions the practitioner posed to themselves | Returned to when practitioner has more experience |
| **Tension** | Acknowledged gaps between knowledge and disposition | Named honestly, tracked over time |
| **Intention** | Practice directions softer than commitments | Mentor tracks progress over time |

### Import Enrichments (4 kinds — one-off only)

| Kind | What It Captures | How the Mentor Uses It |
|------|-----------------|----------------------|
| **Maxim** | Practitioner's own formulations of principles | Quoted back: "You once wrote..." |
| **Emotional Anchor** | Vivid experiences that serve as reference points | Referenced: "Remember when you described..." |
| **Growth Evidence** | Early vs. late entries showing developmental change | Proof of capacity: "You've done this before" |
| **Unfinished Thread** | Topics started but never resolved | Returned to when timing is right |

## File Locations

| File | Purpose |
|------|---------|
| `sage-mentor/journal-interpreter.ts` | Core interpreter module (section mapping, prompt building, aggregation) |
| `sage-mentor/journal-ingestion.ts` | Original ingestion pipeline (used for aggregation logic) |
| `sage-mentor/mentor-ledger.ts` | Ledger types, extraction addendum, aggregation, resurfacing engine, import enrichments |
| `sage-mentor/reflection-generator.ts` | Reflection prompt builders, morning/contextual/weekly generators |
| `sage-mentor/journal-data/transcribed/` | Saved transcriptions by section |
| `sage-mentor/journal-data/extractions/` | Raw LLM extraction results by section |
| `sage-mentor/journal-data/import-enrichment.json` | One-off import enrichments (maxims, anchors, growth, threads) |
| `sage-mentor/llm-bridge.ts` | LLM API calls (use `callAnthropic()`) |
| `sage-mentor/profile-store.ts` | Profile persistence (use `seedProfileFromIngestion()`) |
| `sage-mentor/embedding-pipeline.ts` | Semantic memory (use `batchEmbed()`) |
