# sage-interpret — External Journal Interpretation Skill

## Purpose

This skill guides a Cowork session through the process of interpreting an external Stoic journal (not created on the SageReasoning website) to build the founder's starting MentorProfile. The journal is handwritten, photographed, and needs to be transcribed before interpretation.

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
- Approximately half already transcribed to text

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

### Phase 3: Interpretation

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
   - Parse each response as a `ChunkExtraction` JSON object
   - If JSON parsing fails, ask the model to retry

5. **Aggregate into a MentorProfile:**
   ```typescript
   const result = buildProfileFromExternalJournal(
     userId, displayName, journalName, extractions
   )
   ```

6. **Seed the profile** via `seedProfileFromIngestion()` from `profile-store.ts`.

7. **Embed the journal data** using `batchEmbed()` from `embedding-pipeline.ts` so it's searchable in semantic memory.

### Phase 4: Review

1. Present a summary of the interpretation to the user:
   - Which passions were detected (and how frequently)
   - Causal tendencies (where reasoning breaks in the sequence)
   - Value hierarchy observations (any classification gaps)
   - Virtue profile across the four domains
   - Oikeiosis map (circles of concern)
   - Overall proximity estimate and Senecan grade
2. Ask the user if anything seems off or needs adjustment.
3. Save the final profile to Supabase.

## Important Notes

- **Batch uploads:** The user will upload photos in batches (not all 100+ pages at once). Track which sections are complete and which still need pages.
- **Transcription quality:** Handwriting varies. Always present transcriptions for user review before interpretation. Never run interpretation on unreviewed transcriptions.
- **Section mapping:** The 12 sections map to the Stoic Brain via `EXTERNAL_SECTION_MAPPING` in `journal-interpreter.ts`. If the user has additional sections not in the mapping, use the generic fallback.
- **Incremental processing:** The user can start interpretation with some sections complete and add more later. The profile can be rebuilt as new sections are added.
- **Privacy:** Journal content is deeply personal. Never share, log, or display more of it than necessary for the transcription review step.

## File Locations

| File | Purpose |
|------|---------|
| `sage-mentor/journal-interpreter.ts` | Core interpreter module (section mapping, prompt building, aggregation) |
| `sage-mentor/journal-ingestion.ts` | Original ingestion pipeline (used for aggregation logic) |
| `sage-mentor/journal-data/transcribed/` | Saved transcriptions by section |
| `sage-mentor/journal-data/extractions/` | Raw LLM extraction results by section |
| `sage-mentor/llm-bridge.ts` | LLM API calls (use `callAnthropic()`) |
| `sage-mentor/profile-store.ts` | Profile persistence (use `seedProfileFromIngestion()`) |
| `sage-mentor/embedding-pipeline.ts` | Semantic memory (use `batchEmbed()`) |
