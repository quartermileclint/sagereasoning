const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType,
        BorderStyle, WidthType, ShadingType, VerticalAlign, HeadingLevel, PageBreak } = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
const borders = { top: border, bottom: border, left: border, right: border };
const headerShading = { fill: "4472C4", type: ShadingType.CLEAR };
const headerTextRun = { bold: true, color: "FFFFFF", font: "Arial", size: 22 };

function createHeaderCell(text) {
  return new TableCell({
    borders,
    shading: headerShading,
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, ...headerTextRun })]
    })]
  });
}

function createCell(text, options = {}) {
  const { bold = false, align = AlignmentType.LEFT, width = null } = options;
  const cellConfig = {
    borders,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text, bold, font: "Arial", size: 20 })]
    })]
  };
  if (width) cellConfig.width = { size: width, type: WidthType.DXA };
  return new TableCell(cellConfig);
}

function createTable(columnWidths, headerRow, dataRows) {
  const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
  const rows = [
    new TableRow({
      children: headerRow.map((text, idx) => createHeaderCell(text))
    })
  ];

  dataRows.forEach(row => {
    rows.push(new TableRow({
      children: row.map((text, idx) => createCell(text, { width: columnWidths[idx] }))
    }));
  });

  return new Table({
    width: { size: tableWidth, type: WidthType.DXA },
    columnWidths,
    rows
  });
}

// Key Decisions table data
const keyDecisions = [
  ["1", "sage-reason is a universal reasoning engine, not standalone tools", "Core triad (Control Filter + Passion Diagnosis + Oikeiosis) covers 67% of skill needs", "Mar 2026"],
  ["2", "Three-tier architecture: Engine → Skills → Wrappers", "Tier 1 infrastructure, Tier 2 marketplace skills, Tier 3 open-source wrappers", "Mar 2026"],
  ["3", "Qualitative proximity scale, not numeric 0-100 (R6c)", "V3 data mandates qualitative levels: reflexive → habitual → deliberate → principled → sage-like", "Mar 2026"],
  ["4", "Skills are context templates over sage-reason, not independent engines", "Reduces dev effort from ~6hrs to ~2hrs per skill", "Mar 2026"],
  ["5", "Response envelope on all endpoints", "Standardised metadata: latency, cost, composability, usage triggers", "Mar 2026"],
  ["6", "Free tier = full output, paid tier = volume (R5)", "No capability gating — distinction is 100 calls/month free vs paid volume", "Mar 2026"],
  ["7", "Unified /api/execute router for agents", "Single entry point, agents don't need to know individual endpoints", "Mar 2026"],
  ["8", "Skill registry as single source of truth", "Centralized catalogue drives /api/skills, /api/execute, and OpenAPI spec", "Mar 2026"],
  ["9", "Engine-level customers: 8 compliant, 2 shelved", "Hiring (R2) and Therapy (R1) shelved; conditional mitigations on Education and Compliance", "Mar 2026"],
  ["10", "R13 — Embedding Platform Obligations added", "Platforms embedding sage-reason must comply with R1, R2, R3, R9", "Apr 2026"],
  ["11", "LICENSE updated for engine-level competing service definition", "Covers API services returning structured Stoic reasoning evaluation", "Apr 2026"],
  ["12", "Policy documents (Terms, Privacy) updated for engine + embedding", "New Terms §10 (Embedding Platforms), Privacy table rows for engine/embedding data", "Apr 2026"],
  ["13", "Stop before MCP live registration until Stripe established", "Commercial infrastructure needed before public listing", "Apr 2026"]
];

// Phase 1 table data
const phase1 = [
  ["1.1", "Stoic Brain data files (JSON)", "40", "CRITICAL", "✅ DONE"],
  ["1.2", "V3 controlled glossary (67 terms)", "8", "HIGH", "✅ DONE"],
  ["1.3", "manifest.md rules R1-R12", "4", "CRITICAL", "✅ DONE"],
  ["1.4", "LICENSE (proprietary licence)", "2", "HIGH", "✅ DONE"],
  ["1.5", "AGENTS.md (agent-facing docs)", "4", "HIGH", "✅ DONE"],
  ["1.6", "Website foundation (Next.js, Tailwind, Supabase auth)", "16", "CRITICAL", "✅ DONE"],
  ["1.7", "Lawyer review — Terms, Privacy, R13 embedding, LICENSE engine definition, 2 shelved + 2 conditional use cases", "0 (external)", "HIGH", "⬜ TODO — Deferred to pre-revenue"],
  ["1.8", "R13 added to manifest.md (Embedding Platform Obligations)", "0.5", "HIGH", "✅ DONE"],
  ["1.9", "LICENSE competing service definition updated for engine-level", "0.5", "HIGH", "✅ DONE"],
  ["1.10", "Terms of Service updated — engine refs, embedding §10, acceptable use additions", "2", "HIGH", "✅ DONE"],
  ["1.11", "Privacy Policy updated — engine API data + embedding platform data rows", "1", "HIGH", "✅ DONE"]
];

// Phase 2 table data
const phase2 = [
  ["2.1", "POST /api/reason (sage-reason engine — 3 depths)", "12", "CRITICAL", "✅ DONE"],
  ["2.2", "Response metadata envelope (shared lib)", "4", "HIGH", "✅ DONE"],
  ["2.3", "Retrofit envelope to all existing endpoints (9 routes)", "3", "MEDIUM", "✅ DONE"],
  ["2.4", "Composability metadata (next_steps, chain_start)", "2", "HIGH", "✅ DONE"],
  ["2.5", "GET /api/evaluate (free demo, no auth)", "2", "HIGH", "✅ DONE"],
  ["2.6", "OpenAPI 3.1.0 spec (public/openapi.yaml)", "4", "HIGH", "✅ DONE"],
  ["2.7", "GET /api/skills (skill catalogue)", "2", "HIGH", "✅ DONE"],
  ["2.8", "GET /api/skills/{id} (skill contract with example I/O)", "2", "HIGH", "✅ DONE"],
  ["2.9", "Skill registry (centralized source of truth)", "4", "HIGH", "✅ DONE"],
  ["2.10", "Usage triggers in envelope (pre-limit 80%, at-limit 100%)", "1", "MEDIUM", "✅ DONE"],
  ["2.11", "Cost estimation in envelope", "1", "MEDIUM", "✅ DONE"],
  ["2.12", "POST /api/execute (unified skill router)", "3", "HIGH", "✅ DONE"]
];

// Phase 3 table data
const phase3 = [
  ["3.1", "POST /api/guardrail — sage-guard pre-action checkpoint", "4", "HIGH", "✅ DONE (built in Phase 1)"],
  ["3.2", "POST /api/score-iterate — sage-iterate post-score refinement", "4", "HIGH", "⬜ TODO"],
  ["3.3", "Wrapper SKILL.md template (open-source checkpoint pattern)", "3", "HIGH", "⬜ TODO"],
  ["3.4", "Example wrapper: sage-wrapped-code-review", "4", "MEDIUM", "⬜ TODO"],
  ["3.5", "Wrapper documentation in AGENTS.md", "2", "MEDIUM", "⬜ TODO"],
  ["3.6", "Verify wrapper consumes 2-3 API calls per R5", "1", "HIGH", "⬜ TODO"]
];

// Phase 4A table data
const phase4a = [
  ["4A.1", "sage-premortem (decision pre-analysis)", "2", "HIGH", "⬜ TODO"],
  ["4A.2", "sage-negotiate (negotiation reasoning)", "2", "HIGH", "⬜ TODO"],
  ["4A.3", "sage-invest (investment reasoning)", "2", "MEDIUM", "⬜ TODO"],
  ["4A.4", "sage-hire — SHELVED (R2 violation)", "0", "N/A", "🚫 SHELVED"],
  ["4A.5", "sage-pivot (strategic pivot analysis)", "2", "MEDIUM", "⬜ TODO"],
  ["4A.6", "sage-retro (retrospective reasoning)", "2", "MEDIUM", "⬜ TODO"],
  ["4A.7", "sage-align (team alignment)", "2", "MEDIUM", "⬜ TODO"],
  ["4A.8", "sage-prioritise (priority reasoning)", "2", "MEDIUM", "⬜ TODO"],
  ["4A.9", "sage-resolve (conflict resolution)", "2", "MEDIUM", "⬜ TODO"],
  ["4A.10", "sage-identity (identity/values reasoning)", "2", "MEDIUM", "⬜ TODO"],
  ["4A.11", "sage-coach (coaching reasoning)", "2", "MEDIUM", "⬜ TODO"],
  ["4A.12", "sage-govern (governance reasoning)", "2", "MEDIUM", "⬜ TODO"],
  ["4A.13", "sage-clinical — SHELVED (R1 violation)", "0", "N/A", "🚫 SHELVED"],
  ["4A.14", "sage-compliance (compliance reasoning — conditional, needs R1/R9 disclaimers)", "2", "MEDIUM", "⬜ TODO"],
  ["4A.15", "sage-moderate (content moderation reasoning)", "2", "MEDIUM", "⬜ TODO"],
  ["4A.16", "sage-educate (educational reasoning — conditional, needs age-appropriate framing)", "2", "MEDIUM", "⬜ TODO"]
];

// Phase 5 table data
const phase5 = [
  ["5.1", "Marketplace page UI (browse, preview, acquire skills)", "8", "HIGH", "⬜ TODO"],
  ["5.2", "GET /api/marketplace (agent-facing skill discovery)", "4", "HIGH", "⬜ TODO"],
  ["5.3", "POST /api/marketplace/acquire (skill acquisition)", "4", "HIGH", "⬜ TODO"],
  ["5.4", "Marketplace data in Privacy Policy (already added)", "0", "MEDIUM", "✅ DONE"],
  ["5.5", "Marketplace terms in Terms of Service (already added)", "0", "MEDIUM", "✅ DONE"]
];

// Phase 6 table data
const phase6 = [
  ["6.1", "Stripe integration (subscription billing)", "8", "CRITICAL", "⬜ TODO"],
  ["6.2", "API key management (generation, rotation, revocation)", "6", "CRITICAL", "⬜ TODO"],
  ["6.3", "Usage tracking and billing dashboard", "6", "HIGH", "⬜ TODO"],
  ["6.4", "Rate limiting enforcement (free tier 100/month)", "4", "HIGH", "⬜ TODO"],
  ["6.5", "MCP server registration — BLOCKED until Stripe is live", "4", "HIGH", "⛔ BLOCKED"]
];

// Phase 7 table data
const phase7 = [
  ["7.1", "Developer landing page (API docs, getting started)", "6", "HIGH", "⬜ TODO"],
  ["7.2", "Engine use case marketing (8 compliant verticals)", "4", "MEDIUM", "⬜ TODO"],
  ["7.3", "Embedding platform partner outreach materials", "3", "MEDIUM", "⬜ TODO"],
  ["7.4", "Community/journal curriculum launch content", "4", "MEDIUM", "⬜ TODO"],
  ["7.5", "SEO and content strategy for stoic reasoning niche", "3", "MEDIUM", "⬜ TODO"]
];

// Shelved Items table data
const shelved = [
  ["sage-hire skill", "Employment evaluation prohibited", "R2", "Would require R2 amendment — not planned"],
  ["sage-clinical skill", "Therapeutic implication prohibited", "R1", "Would require R1 amendment — not planned"],
  ["Hiring platform embedding", "R2 applies to embedding platforms via R13", "R2, R13", "Cannot embed sage-reason in HR tools"],
  ["Therapy platform embedding", "R1 applies to embedding platforms via R13", "R1, R13", "Cannot embed sage-reason in therapy tools"]
];

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Arial", size: 22 }
      }
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 32, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 }
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 1 }
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: {
          width: 12240,
          height: 15840
        },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      // Title
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [new TextRun({
          text: "SageReasoning — Consolidated To-Do List",
          bold: true,
          size: 32,
          font: "Arial"
        })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 360 },
        children: [new TextRun({
          text: "(Updated April 2026)",
          size: 24,
          font: "Arial"
        })]
      }),

      // Key Decisions Section
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Key Decisions Made")]
      }),
      createTable([500, 2800, 3200, 1860],
        ["#", "Decision", "Rationale", "Date"],
        keyDecisions
      ),
      new Paragraph({ text: "", spacing: { after: 360 } }),

      // Phase 1 Section
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Phase 1 — Foundation & Policy (Weeks 1-2)")]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({
          text: "Status column uses: ✅ DONE, 🔄 IN PROGRESS, ⬜ TODO",
          italic: true,
          size: 20,
          font: "Arial"
        })]
      }),
      createTable([600, 2800, 1200, 1800, 1960],
        ["Task", "Est. Hours", "Priority", "Status"],
        phase1.map(row => [row[0], row[1], row[2], row[3], row[4]])
      ),
      new Paragraph({ text: "", spacing: { after: 360 } }),

      // Phase 2 Section
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Phase 2 — API Foundation & Developer Experience (Weeks 3-4)")]
      }),
      createTable([600, 2800, 1200, 1800, 1960],
        ["Task", "Est. Hours", "Priority", "Status"],
        phase2.map(row => [row[0], row[1], row[2], row[3], row[4]])
      ),
      new Paragraph({ text: "", spacing: { after: 360 } }),

      // Phase 3 Section
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Phase 3 — Sage Wrapper Framework (Weeks 5-6)")]
      }),
      createTable([600, 2800, 1200, 1800, 1960],
        ["Task", "Est. Hours", "Priority", "Status"],
        phase3.map(row => [row[0], row[1], row[2], row[3], row[4]])
      ),
      new Paragraph({ text: "", spacing: { after: 360 } }),

      // Phase 4A Section
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Phase 4A — Context Templates (Marketplace Skills) (Weeks 7-8)")]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({
          text: "Note: Skills are context templates over sage-reason, not independent engines. ~2 hrs each.",
          italic: true,
          size: 20,
          font: "Arial"
        })]
      }),
      createTable([600, 2800, 1200, 1800, 1960],
        ["Task", "Est. Hours", "Priority", "Status"],
        phase4a.map(row => [row[0], row[1], row[2], row[3], row[4]])
      ),
      new Paragraph({ text: "", spacing: { after: 360 } }),

      // Phase 5 Section
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Phase 5 — Marketplace (Weeks 9-10)")]
      }),
      createTable([600, 2800, 1200, 1800, 1960],
        ["Task", "Est. Hours", "Priority", "Status"],
        phase5.map(row => [row[0], row[1], row[2], row[3], row[4]])
      ),
      new Paragraph({ text: "", spacing: { after: 360 } }),

      // Phase 6 Section
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Phase 6 — Commercial Infrastructure (Weeks 11-12)")]
      }),
      createTable([600, 2800, 1200, 1800, 1960],
        ["Task", "Est. Hours", "Priority", "Status"],
        phase6.map(row => [row[0], row[1], row[2], row[3], row[4]])
      ),
      new Paragraph({ text: "", spacing: { after: 360 } }),

      // Phase 7 Section
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Phase 7 — Positioning & Go-to-Market (Weeks 13-14)")]
      }),
      createTable([600, 2800, 1200, 1800, 1960],
        ["Task", "Est. Hours", "Priority", "Status"],
        phase7.map(row => [row[0], row[1], row[2], row[3], row[4]])
      ),
      new Paragraph({ text: "", spacing: { after: 360 } }),

      // Shelved Items Section
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Shelved Items (Require Rule Changes or External Review)")]
      }),
      createTable([1800, 2200, 900, 2460],
        ["Item", "Reason", "Rule", "Resolution Path"],
        shelved
      )
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/sessions/intelligent-friendly-ramanujan/mnt/sagereasoning/SageReasoning_Consolidated_ToDo.docx", buffer);
  console.log("Document created successfully!");
});
