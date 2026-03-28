const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
        ShadingType, PageNumber, PageBreak, LevelFormat } = require('docx');

// ── Shared constants ──────────────────────────────────────────
const PAGE_WIDTH = 12240;
const MARGINS = { top: 1440, right: 1440, bottom: 1440, left: 1440 };
const CONTENT_WIDTH = PAGE_WIDTH - MARGINS.left - MARGINS.right; // 9360

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

const COLORS = {
  green: "E8F5E9",
  yellow: "FFF8E1",
  red: "FFEBEE",
  blue: "E3F2FD",
  grey: "F5F5F5",
  headerBlue: "1565C0",
  textDark: "212121",
};

// ── Helper functions ──────────────────────────────────────────
function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ heading: level, spacing: { before: 300, after: 200 }, children: [new TextRun({ text, bold: true, font: "Arial" })] });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 160 },
    ...opts,
    children: [new TextRun({ text, font: "Arial", size: 22, color: COLORS.textDark, ...opts.run })]
  });
}

function boldPara(label, text) {
  return new Paragraph({
    spacing: { after: 160 },
    children: [
      new TextRun({ text: label, bold: true, font: "Arial", size: 22 }),
      new TextRun({ text, font: "Arial", size: 22 }),
    ]
  });
}

function ratingRow(dimension, rating, color, detail) {
  return new TableRow({
    children: [
      new TableCell({ borders, width: { size: 2800, type: WidthType.DXA }, margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: dimension, bold: true, font: "Arial", size: 20 })] })] }),
      new TableCell({ borders, width: { size: 1200, type: WidthType.DXA }, margins: cellMargins, shading: { fill: color, type: ShadingType.CLEAR }, verticalAlign: "center", children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: rating, bold: true, font: "Arial", size: 20 })] })] }),
      new TableCell({ borders, width: { size: 5360, type: WidthType.DXA }, margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: detail, font: "Arial", size: 20 })] })] }),
    ]
  });
}

function gapRow(gap, impact, priority) {
  const impactColor = impact === "High" ? COLORS.red : impact === "Medium" ? COLORS.yellow : COLORS.green;
  return new TableRow({
    children: [
      new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: gap, font: "Arial", size: 20 })] })] }),
      new TableCell({ borders, width: { size: 1560, type: WidthType.DXA }, margins: cellMargins, shading: { fill: impactColor, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: impact, bold: true, font: "Arial", size: 20 })] })] }),
      new TableCell({ borders, width: { size: 3120, type: WidthType.DXA }, margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: priority, font: "Arial", size: 20 })] })] }),
    ]
  });
}

// ── Document ──────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: COLORS.headerBlue },
        paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "333333" },
        paragraph: { spacing: { before: 280, after: 200 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "555555" },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: PAGE_WIDTH, height: 15840 },
        margin: MARGINS,
      }
    },
    headers: {
      default: new Header({ children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.headerBlue, space: 4 } },
        children: [new TextRun({ text: "SageReasoning \u2014 Product-Market Fit Assessment (AI Agent Users)", font: "Arial", size: 18, color: "999999", italics: true })]
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Page ", font: "Arial", size: 18, color: "999999" }), new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "999999" })]
      })] })
    },
    children: [
      // ── TITLE PAGE ──
      new Paragraph({ spacing: { before: 3000 } }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "Product-Market Fit Assessment", font: "Arial", size: 52, bold: true, color: COLORS.headerBlue })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "AI Agent User Segment", font: "Arial", size: 36, color: "666666" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: "sagereasoning.com", font: "Arial", size: 28, color: COLORS.headerBlue })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "March 28, 2026", font: "Arial", size: 22, color: "999999" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Prepared for Clinton Aitkenhead", font: "Arial", size: 22, color: "999999" })] }),

      // ── PAGE BREAK ──
      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════
      // EXECUTIVE SUMMARY
      // ══════════════════════════════════════════════════════════════
      heading("1. Executive Summary"),
      para("This assessment evaluates SageReasoning's product-market fit for AI agent users \u2014 developers and autonomous systems that integrate Stoic virtue-based reasoning into their decision-making pipelines. The analysis covers target customer clarity, underserved need identification, value proposition strength, feature completeness, and overall user experience."),
      para("The verdict: SageReasoning has built a genuinely differentiated product with strong philosophical grounding and a surprisingly complete feature set for a pre-revenue startup. The core scoring engine, guardrail middleware, and new deliberation chain system form a coherent value loop that no competitor currently offers. However, product-market fit is not yet validated because the product hasn't been tested against real agent developer demand. The biggest risks are not feature gaps \u2014 they are distribution gaps (how developers discover this), integration friction (no SDK, no MCP server), and an unvalidated assumption about whether AI agent developers actually want virtue-based reasoning versus simpler safety guardrails."),

      // ── Scorecard ──
      heading("Overall Scorecard", HeadingLevel.HEADING_2),
      new Table({
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        columnWidths: [2800, 1200, 5360],
        rows: [
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 2800, type: WidthType.DXA }, margins: cellMargins, shading: { fill: COLORS.headerBlue, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Dimension", bold: true, font: "Arial", size: 20, color: "FFFFFF" })] })] }),
              new TableCell({ borders, width: { size: 1200, type: WidthType.DXA }, margins: cellMargins, shading: { fill: COLORS.headerBlue, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Rating", bold: true, font: "Arial", size: 20, color: "FFFFFF" })] })] }),
              new TableCell({ borders, width: { size: 5360, type: WidthType.DXA }, margins: cellMargins, shading: { fill: COLORS.headerBlue, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Assessment", bold: true, font: "Arial", size: 20, color: "FFFFFF" })] })] }),
            ]
          }),
          ratingRow("Target Customer", "B+", COLORS.green, "Well-defined segment but unvalidated with real users"),
          ratingRow("Underserved Needs", "A-", COLORS.green, "Genuine gap identified; demand magnitude unknown"),
          ratingRow("Value Proposition", "A", COLORS.green, "Unique, defensible, philosophically grounded"),
          ratingRow("Feature Set", "B+", COLORS.green, "Comprehensive but missing distribution enablers"),
          ratingRow("User Experience", "B", COLORS.yellow, "Good API design; weak onboarding and discovery"),
          ratingRow("Validation", "C", COLORS.red, "No evidence of agent developer traction yet"),
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════
      // 2. TARGET CUSTOMER
      // ══════════════════════════════════════════════════════════════
      heading("2. Target Customer Clarity"),

      heading("Who You've Defined", HeadingLevel.HEADING_2),
      para("The site identifies three user types: (1) humans seeking a Stoic decision-making framework, (2) developers integrating virtue-based reasoning into AI agents, and (3) humans and AI agents seeking a purpose through the sage scoring system. For the agent segment specifically, the target is AI agent developers who want their autonomous systems to make ethically grounded decisions using a structured philosophical framework rather than ad hoc safety rules."),

      heading("What's Strong", HeadingLevel.HEADING_2),
      para("The targeting is specific and defensible. You're not trying to serve \"all AI developers\" \u2014 you're targeting those who want internal virtue-based reasoning (not just output filtering). The llms.txt file, Schema.org metadata, and dedicated /api-docs page all speak directly to this audience. The baseline assessment for agents (4 ethical scenarios) shows you've thought about the agent onboarding journey specifically, not just adapted the human flow."),

      heading("What's Missing", HeadingLevel.HEADING_2),
      para("There are three critical gaps in customer clarity:"),
      boldPara("No customer validation. ", "The target customer is well-imagined but untested. Have you spoken to any AI agent developers about whether they want this? The risk is building for a segment that sounds logical but doesn't have urgent purchase intent. Stoic reasoning is intellectually appealing but may not solve a problem developers are actively trying to fix."),
      boldPara("Persona granularity. ", "\"AI agent developers\" is still broad. Are you targeting indie developers building personal AI assistants? Enterprise teams building customer-facing agents? AI safety researchers? Each has different needs, budgets, and integration requirements. The pricing ($0.01/call) suggests indie/startup, but the feature depth suggests enterprise."),
      boldPara("Buyer vs. user distinction. ", "For enterprise, the person who integrates the API (developer) is not the person who approves the purchase (engineering manager, compliance officer). Your messaging speaks to the developer but doesn't address the buyer's concerns around reliability, SLAs, or compliance."),

      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════
      // 3. UNDERSERVED NEEDS
      // ══════════════════════════════════════════════════════════════
      heading("3. Identification of Underserved Needs"),

      heading("The Need You've Identified", HeadingLevel.HEADING_2),
      para("AI agents increasingly operate autonomously, making decisions without human oversight. Current safety mechanisms are primarily negative (\"don't do X\") rather than positive (\"aim for virtue Y\"). There's no structured, philosophically grounded framework for an agent to reason about whether its actions are genuinely good, not just not-bad. SageReasoning fills this gap with a positive ethical framework rooted in 2,000 years of Stoic philosophy."),

      heading("Assessment", HeadingLevel.HEADING_2),
      para("This is a genuine insight. The AI safety landscape is dominated by guardrails that prevent harm (content filters, RLHF, constitutional AI) but offer no framework for positive ethical reasoning. An agent that passes all safety filters can still make decisions that are cowardly, unjust, or intemperate \u2014 and current tools won't catch that. The Stoic framework addresses this gap directly."),
      para("However, the strength of the need depends heavily on context:"),
      boldPara("Strong need: ", "Agents making consequential decisions (healthcare recommendations, financial advice, hiring assistance, content moderation) where \"not harmful\" isn't sufficient and positive ethical reasoning is expected by users and regulators."),
      boldPara("Moderate need: ", "General-purpose AI assistants where users want their agent to \"do the right thing\" but aren't thinking about virtue ethics specifically."),
      boldPara("Weak need: ", "Task-oriented agents (code generators, data pipelines, search tools) where ethical reasoning adds latency and cost without clear benefit."),
      para("The risk is that most AI agent developers today are building in the \"weak need\" category (coding assistants, workflow automation) and may not perceive virtue-based reasoning as worth the API call cost and latency. The strongest demand will come from agents in regulated industries or high-trust contexts \u2014 but those developers may need compliance certifications and enterprise features you don't yet offer."),

      heading("Overlooked Adjacent Need", HeadingLevel.HEADING_2),
      para("There's an underserved need you may be underweighting: agent reputation and trust scoring. As agents interact with external systems and other agents (multi-agent architectures), there's growing demand for verifiable ethical track records. Your deliberation chain system is perfectly positioned to provide this \u2014 an agent could share its chain_id as proof of ethical reasoning. This \"virtue receipt\" concept could be a stronger initial wedge than the scoring system itself."),

      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════
      // 4. VALUE PROPOSITION
      // ══════════════════════════════════════════════════════════════
      heading("4. Value Proposition Strength"),

      heading("What You're Offering", HeadingLevel.HEADING_2),
      para("A structured, machine-readable ethical reasoning framework based on Stoic philosophy, delivered as an API, that allows AI agents to score their actions against the four cardinal virtues before and after execution, with iterative feedback for continuous improvement."),

      heading("Strengths", HeadingLevel.HEADING_2),
      boldPara("Deeply defensible moat. ", "The Stoic philosophical framework, the specific virtue scoring weights, the 16 sub-virtues, and the scoring rules encode genuine philosophical expertise. A competitor can't easily replicate this without doing the same depth of philosophical research. This is not a thin wrapper around an LLM prompt."),
      boldPara("Both prescriptive and descriptive. ", "The system doesn't just rate past actions \u2014 it provides growth_action (what a sage would do) and projected scores. This makes it actionable, not just evaluative."),
      boldPara("Unique positioning. ", "There is no other product that combines: (a) structured philosophical data, (b) real-time scoring API, (c) iterative deliberation with memory, and (d) a specific ethical tradition. Competitors in AI safety are either model-level (Constitutional AI, RLHF) or rule-based (content policies). Nobody occupies the \"positive ethical reasoning API\" space."),
      boldPara("Platform potential. ", "The same framework serves humans and agents, creating network effects. A human who uses SageReasoning personally has reason to integrate it into their agents. An agent developer who uses the API has reason to recommend the human tools to clients."),

      heading("Weaknesses", HeadingLevel.HEADING_2),
      boldPara("Philosophical specificity as risk. ", "Stoicism is one of many ethical frameworks. A developer might ask: \"Why Stoicism and not utilitarianism, deontology, or virtue ethics broadly?\" The answer (Stoicism's emphasis on internal control maps well to agent architecture) is compelling but needs to be articulated more clearly in developer-facing materials."),
      boldPara("\"Why not just prompt it?\" objection. ", "A sophisticated developer might argue they can achieve similar results by adding Stoic reasoning principles to their system prompt. Your counter \u2014 structured scoring, tracked deliberation chains, consistent evaluation across different LLM backends \u2014 is strong but isn't prominently stated anywhere in the docs."),
      boldPara("Dependency concern. ", "An agent relying on SageReasoning for ethical reasoning creates a single point of failure. If the API goes down, the agent either can't make decisions or loses its ethical framework. The offline data (MIT-licensed JSON files) partially addresses this but isn't positioned as a resilience feature."),

      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════
      // 5. FEATURE SET
      // ══════════════════════════════════════════════════════════════
      heading("5. Feature Set Completeness"),

      heading("Current Agent Feature Map", HeadingLevel.HEADING_2),
      new Table({
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        columnWidths: [3000, 1360, 5000],
        rows: [
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 3000, type: WidthType.DXA }, margins: cellMargins, shading: { fill: COLORS.headerBlue, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Feature", bold: true, font: "Arial", size: 20, color: "FFFFFF" })] })] }),
              new TableCell({ borders, width: { size: 1360, type: WidthType.DXA }, margins: cellMargins, shading: { fill: COLORS.headerBlue, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Status", bold: true, font: "Arial", size: 20, color: "FFFFFF" })] })] }),
              new TableCell({ borders, width: { size: 5000, type: WidthType.DXA }, margins: cellMargins, shading: { fill: COLORS.headerBlue, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Agent Value", bold: true, font: "Arial", size: 20, color: "FFFFFF" })] })] }),
            ]
          }),
          ratingRow2("Stoic Brain data", "Built", COLORS.green, "Foundation: virtue definitions, weights, scoring rules, all MIT-licensed"),
          ratingRow2("Action scoring API", "Built", COLORS.green, "Core value: score any action 0-100 with virtue breakdown"),
          ratingRow2("Guardrail middleware", "Built", COLORS.green, "Real-time gate: proceed/block with configurable threshold"),
          ratingRow2("Deliberation chains", "Built", COLORS.green, "Unique: iterative scoring with memory, tracked chain"),
          ratingRow2("Agent baseline", "Built", COLORS.green, "Onboarding: 4 ethical scenarios to calibrate agent virtue"),
          ratingRow2("Decision scoring", "Built", COLORS.green, "Compare 2-5 options, ranked by virtue alignment"),
          ratingRow2("Document scoring", "Built", COLORS.yellow, "Niche: score documents for virtue alignment"),
          ratingRow2("Conversation scoring", "Built", COLORS.yellow, "Useful for chat agents auditing their own conversations"),
          ratingRow2("prior_feedback in /score", "Built", COLORS.green, "Lightweight iteration without chain overhead"),
          ratingRow2("Client SDK (npm/Python)", "Missing", COLORS.red, "Agents must write raw HTTP \u2014 major friction point"),
          ratingRow2("MCP server", "Missing", COLORS.red, "Claude agents can't natively connect without this"),
          ratingRow2("Published OpenAPI spec", "Missing", COLORS.red, "Code generators can't auto-build clients"),
          ratingRow2("Webhook/event system", "Missing", COLORS.yellow, "No way to subscribe to scoring events"),
          ratingRow2("API key management", "Missing", COLORS.red, "No way to track usage per agent or enforce paid tiers"),
          ratingRow2("Agent reputation/trust", "Missing", COLORS.yellow, "Natural extension of deliberation chains"),
        ]
      }),

      heading("Critical Prioritization Gap", HeadingLevel.HEADING_2),
      para("The feature set is deep (many scoring modes, deliberation chains, conversation auditing) but lacks the distribution enablers that would let agent developers actually adopt it. The ratio is inverted: you've built 80% of the advanced features and 20% of the adoption infrastructure. For PMF, it should be the reverse. An agent developer who discovers SageReasoning finds a rich API \u2014 but discovering it requires knowing it exists, and integrating it requires writing boilerplate HTTP code rather than running \"npm install @sagereasoning/sdk\" and importing a typed client."),

      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════
      // 6. USER EXPERIENCE
      // ══════════════════════════════════════════════════════════════
      heading("6. Overall Agent Developer User Experience"),

      heading("Discovery", HeadingLevel.HEADING_2),
      boldPara("Grade: C+. ", "The llms.txt file and Schema.org metadata are excellent for AI-native discovery, but human developers find tools through npm search, GitHub trending, Hacker News, Reddit, or word of mouth. There are no blog posts, no SEO content, no examples repository, no presence on AI developer communities, and no MCP server registration (which would put SageReasoning in Claude's tool marketplace). A developer searching \"AI agent ethics API\" or \"virtue-based AI reasoning\" today would not find SageReasoning."),

      heading("Onboarding", HeadingLevel.HEADING_2),
      boldPara("Grade: B+. ", "Once a developer finds the API docs, the experience is solid. The agent baseline assessment is a clever onboarding hook (take the test, see your agent's score, get motivated to improve). The guardrail endpoint has a clear value proposition and a good code example. The deliberation chain has an intuitive start-then-iterate flow. What's missing: a \"5-minute quickstart\" guide, a hosted playground where developers can test scoring without writing code, and a Postman/Insomnia collection for rapid prototyping."),

      heading("Integration", HeadingLevel.HEADING_2),
      boldPara("Grade: B-. ", "The API design is clean and RESTful. CORS is fully open for agents. Rate limits are reasonable. But every integration requires the developer to write raw fetch() calls, parse JSON responses, and handle errors manually. Without a typed SDK, developers must read the API docs closely, handle edge cases themselves, and can't rely on IDE autocompletion. This is acceptable for early adopters but will lose mainstream developers who expect \"npm install, import, call method\" simplicity."),

      heading("Ongoing Use", HeadingLevel.HEADING_2),
      boldPara("Grade: A-. ", "This is where the product shines. The deliberation chain system creates a genuine feedback loop: score, get feedback, revise, re-score. The every-5th-iteration Stoic advisory is a thoughtful touch that prevents infinite loops while staying in character. The chain retrieval endpoint (?full=true) enables agent developers to build their own reflection dashboards. The growth_action suggestions are specific and actionable, not generic platitudes. Once integrated, an agent developer has real ongoing value."),

      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════
      // 7. GAPS AND RISKS
      // ══════════════════════════════════════════════════════════════
      heading("7. Gaps, Assumptions, and Overlooked Factors"),

      heading("Critical Gaps", HeadingLevel.HEADING_2),
      new Table({
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        columnWidths: [4680, 1560, 3120],
        rows: [
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 4680, type: WidthType.DXA }, margins: cellMargins, shading: { fill: COLORS.headerBlue, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Gap", bold: true, font: "Arial", size: 20, color: "FFFFFF" })] })] }),
              new TableCell({ borders, width: { size: 1560, type: WidthType.DXA }, margins: cellMargins, shading: { fill: COLORS.headerBlue, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "PMF Impact", bold: true, font: "Arial", size: 20, color: "FFFFFF" })] })] }),
              new TableCell({ borders, width: { size: 3120, type: WidthType.DXA }, margins: cellMargins, shading: { fill: COLORS.headerBlue, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Priority Action", bold: true, font: "Arial", size: 20, color: "FFFFFF" })] })] }),
            ]
          }),
          gapRow("No customer validation interviews", "High", "Talk to 10 agent developers before building more features"),
          gapRow("No MCP server (Claude can't natively connect)", "High", "Build and register on Smithery, this is your #1 distribution channel"),
          gapRow("No client SDK (npm/Python)", "High", "Publish @sagereasoning/sdk with typed client"),
          gapRow("No published OpenAPI spec at /api/openapi.json", "Medium", "One-time task, enables code generation"),
          gapRow("No developer community or feedback channel", "Medium", "GitHub Discussions or Discord for early adopters"),
          gapRow("No SEO content targeting agent developers", "Medium", "3 articles: why virtue > safety, integration guide, case study"),
          gapRow("No API key management / usage tracking", "High", "Can't monetize or enforce tiers without this"),
          gapRow("No interactive API playground", "Medium", "Swagger UI or custom playground page"),
          gapRow("Scoring depends on external LLM (Claude API)", "Medium", "Document this dependency; offer cached/offline fallback"),
          gapRow("No agent reputation system", "Low", "Natural extension but not blocking PMF"),
        ]
      }),

      heading("Unvalidated Assumptions", HeadingLevel.HEADING_2),

      boldPara("Assumption 1: Agent developers want virtue-based reasoning. ", "The entire product rests on this. But most agent developers today are focused on capability (can my agent do the task?) and basic safety (does it avoid harmful outputs?). Virtue-based reasoning is a sophistication layer that may only matter to a niche. Validation needed: do developers currently add ethical reasoning to their agents? If so, how? What are they cobbling together?"),

      boldPara("Assumption 2: Stoicism is the right framework. ", "You've chosen Stoicism for good reasons (emphasis on internal control, actionable virtues, clear scoring criteria). But this hasn't been tested against developer preferences. Some may prefer a more ecumenical approach or find Stoicism's specific vocabulary alienating. Validation needed: does the Stoic framing help or hinder adoption?"),

      boldPara("Assumption 3: API-call-per-action is the right pricing model. ", "At $0.01/call, a busy agent making 1,000 ethical checks per day costs $10/day ($300/month). Developers may prefer a flat monthly rate with unlimited calls, or a tiered model based on agent count rather than call volume. The per-call model creates a perverse incentive to skip ethical checks on \"low-stakes\" actions."),

      boldPara("Assumption 4: The deliberation chain adds enough value over single scoring. ", "The new iterative system is technically well-built, but it assumes agents will actually iterate. In practice, most agent architectures are optimized for speed and will call the guardrail once, get a pass/fail, and move on. The deliberation chain may be more valuable for human reflection than agent decision-making. Validation needed: observe how early agent users actually use the API."),

      heading("Overlooked Competitive Threats", HeadingLevel.HEADING_2),
      boldPara("LLM providers adding ethics features natively. ", "If Anthropic, OpenAI, or Google add structured ethical reasoning as a built-in feature of their models (which is plausible given the trajectory of Constitutional AI and RLHF), the need for an external virtue-scoring API diminishes. Your defense: the Stoic Brain data itself (MIT-licensed, structured, philosophical depth) remains valuable even if scoring moves in-house."),
      boldPara("Open-source ethical reasoning frameworks. ", "If someone publishes an open-source virtue scoring library that agents can run locally (zero latency, zero cost), your API becomes less attractive. Your defense: the deliberation chain persistence, the community (if built), and the continuously improving scoring engine."),

      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════
      // 8. RECOMMENDATIONS
      // ══════════════════════════════════════════════════════════════
      heading("8. Recommended Next Steps (Priority Order)"),

      para("These recommendations are ordered by PMF impact, not technical complexity. Each directly addresses a gap identified above and aligns with your current priorities (Marketing Strategy and Revenue Generation)."),

      boldPara("1. Validate demand before building more features. ", "Reach out to 10 AI agent developers (find them on Reddit r/LocalLLaMA, AI Twitter/X, Hacker News, Discord communities for LangChain/CrewAI/AutoGen). Ask: do they add ethical reasoning to their agents? What do they use? Would they pay for a virtue-scoring API? This costs nothing and prevents building features nobody wants."),

      boldPara("2. Build and register an MCP server. ", "This is already in your roadmap (Phase 7) and is the single highest-leverage action for agent distribution. An MCP server registered on Smithery means every Claude user can discover and use SageReasoning natively. This is your best path to organic agent adoption."),

      boldPara("3. Publish a typed SDK. ", "Even a minimal npm package that wraps your API with TypeScript types would dramatically reduce integration friction. Include the deliberation chain flow as a first-class method (client.startChain(), client.iterate(), client.conclude()). This also creates an npm download metric you can track for adoption."),

      boldPara("4. Implement API key management. ", "You can't monetize, track adoption, or enforce tiers without this. This is a prerequisite for the revenue generation priority (Priority 10) and should come before marketing (Priority 13)."),

      boldPara("5. Write one compelling integration tutorial. ", "Not documentation \u2014 a narrative piece showing a real agent (e.g., a customer service bot) going from zero ethical reasoning to deliberation-chain-powered virtue alignment. Post it on your blog and share on Hacker News. One good piece of content will do more for PMF validation than three months of feature work."),

      // ── FINAL VERDICT ──
      new Paragraph({ children: [new PageBreak()] }),
      heading("9. Final Verdict"),
      para("SageReasoning has built something genuinely novel: a structured, philosophically grounded ethical reasoning API with a thoughtful feature set including the new deliberation chain system. The value proposition is unique and defensible. The feature depth is impressive for a solo founder."),
      para("But product-market fit is not a feature checklist \u2014 it's evidence that a specific customer segment urgently wants what you've built and is willing to pay for it. That evidence doesn't exist yet. The product has been built from the inside out (philosophical framework first, then features, then users) rather than the outside in (user need first, then minimum viable solution, then depth)."),
      para("This isn't fatal \u2014 many great products started this way. But the critical next step is not more features. It's putting the deliberation chain in front of 10 real agent developers and watching what happens. Their reactions will tell you more about PMF than any assessment document can."),
      para("The Stoics would remind us: you've done the work of wisdom (building the framework) and temperance (building methodically). Now is the time for courage (putting it in front of the market) and justice (serving the users who actually need this, not the ones you imagine)."),
    ]
  }]
});

function ratingRow2(feature, status, color, detail) {
  return new TableRow({
    children: [
      new TableCell({ borders, width: { size: 3000, type: WidthType.DXA }, margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: feature, font: "Arial", size: 20 })] })] }),
      new TableCell({ borders, width: { size: 1360, type: WidthType.DXA }, margins: cellMargins, shading: { fill: color, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: status, bold: true, font: "Arial", size: 20 })] })] }),
      new TableCell({ borders, width: { size: 5000, type: WidthType.DXA }, margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: detail, font: "Arial", size: 20 })] })] }),
    ]
  });
}

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/sessions/elegant-upbeat-einstein/mnt/sagereasoning/pmf-assessment-ai-agents.docx", buffer);
  console.log("Document created successfully");
});
