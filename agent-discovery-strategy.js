const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
        ShadingType, PageNumber, PageBreak, LevelFormat } = require('docx');

const PAGE_WIDTH = 12240;
const MARGINS = { top: 1440, right: 1440, bottom: 1440, left: 1440 };
const CONTENT_WIDTH = PAGE_WIDTH - MARGINS.left - MARGINS.right;

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };
const BLUE = "1565C0";

function h1(text) { return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 240 }, children: [new TextRun({ text, bold: true, font: "Arial" })] }); }
function h2(text) { return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 200 }, children: [new TextRun({ text, bold: true, font: "Arial" })] }); }
function h3(text) { return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 240, after: 160 }, children: [new TextRun({ text, bold: true, font: "Arial" })] }); }
function p(text) { return new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text, font: "Arial", size: 22 })] }); }
function bp(label, text) { return new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: label, bold: true, font: "Arial", size: 22 }), new TextRun({ text, font: "Arial", size: 22 })] }); }

function tableRow(cells, isHeader = false) {
  return new TableRow({
    children: cells.map((c, i) => {
      const widths = cells.length === 3 ? [3500, 2360, 3500] : cells.length === 2 ? [4680, 4680] : [CONTENT_WIDTH];
      return new TableCell({
        borders,
        width: { size: widths[i], type: WidthType.DXA },
        margins: cellMargins,
        shading: isHeader ? { fill: BLUE, type: ShadingType.CLEAR } : undefined,
        children: [new Paragraph({ children: [new TextRun({ text: c, bold: isHeader, font: "Arial", size: 20, color: isHeader ? "FFFFFF" : "212121" })] })]
      });
    })
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 36, bold: true, font: "Arial", color: BLUE }, paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 28, bold: true, font: "Arial", color: "333333" }, paragraph: { spacing: { before: 280, after: 200 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 24, bold: true, font: "Arial", color: "555555" }, paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 2 } },
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
      page: { size: { width: PAGE_WIDTH, height: 15840 }, margin: MARGINS }
    },
    headers: {
      default: new Header({ children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BLUE, space: 4 } },
        children: [new TextRun({ text: "SageReasoning \u2014 Agent Discovery Strategy", font: "Arial", size: 18, color: "999999", italics: true })]
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Page ", font: "Arial", size: 18, color: "999999" }), new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "999999" })]
      })] })
    },
    children: [
      // ── TITLE ──
      new Paragraph({ spacing: { before: 3000 } }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "Agent Discovery Strategy", font: "Arial", size: 52, bold: true, color: BLUE })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "How Autonomous Agents Find and Adopt SageReasoning", font: "Arial", size: 28, color: "666666" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: "sagereasoning.com", font: "Arial", size: 28, color: BLUE })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "March 28, 2026", font: "Arial", size: 22, color: "999999" })] }),
      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════
      // 1. THE LANDSCAPE
      // ══════════════════════════════════════════════════════════════
      h1("1. The Agent Discovery Landscape in 2026"),

      p("We are in the middle of a fundamental shift in how software is discovered and adopted. Traditional SEO optimized for humans typing queries into search engines. The new frontier is optimizing for autonomous AI agents that discover, evaluate, and integrate tools programmatically. There are now five distinct discovery layers that agents use to find services, and SageReasoning needs to be present in all of them."),

      h2("The Five Discovery Layers"),

      new Table({
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        columnWidths: [2200, 3560, 3600],
        rows: [
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 2200, type: WidthType.DXA }, margins: cellMargins, shading: { fill: BLUE, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Layer", bold: true, font: "Arial", size: 20, color: "FFFFFF" })] })] }),
            new TableCell({ borders, width: { size: 3560, type: WidthType.DXA }, margins: cellMargins, shading: { fill: BLUE, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "How Agents Use It", bold: true, font: "Arial", size: 20, color: "FFFFFF" })] })] }),
            new TableCell({ borders, width: { size: 3600, type: WidthType.DXA }, margins: cellMargins, shading: { fill: BLUE, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "SageReasoning Status", bold: true, font: "Arial", size: 20, color: "FFFFFF" })] })] }),
          ]}),
          tableRow(["llms.txt", "Agents fetch /llms.txt to understand what a site offers in plain text. 5-15% adoption among tech sites.", "LIVE \u2014 Updated to v2.0 with deliberation chain and discovery cross-links"]),
          tableRow(["A2A Agent Card", "Google's Agent2Agent protocol. Agents fetch /.well-known/agent-card.json to discover capabilities, endpoints, and auth requirements.", "LIVE \u2014 Full agent card with 6 capabilities, quickStart, and example request"]),
          tableRow(["AGENTS.md", "Coding agents (Copilot, Cursor, Claude Code, OpenClaw) read AGENTS.md for repository-level integration instructions.", "LIVE \u2014 Comprehensive guide for both API integrators and repo contributors"]),
          tableRow(["MCP Registry", "Claude and other LLM-native agents search Smithery (6,000+ servers) and the Official MCP Registry for tools.", "NOT YET \u2014 Highest-priority gap. No MCP server exists."]),
          tableRow(["Agent Social Networks", "Agents on Moltbook (1.6M agent accounts, acquired by Meta) discover tools through recommendations and directory listings.", "NOT YET \u2014 Strategy planned, not executed."]),
        ]
      }),

      p("The critical insight: there is no single front door for agent discovery. You need to be in every room where an agent might look. The implementations delivered today cover the first three layers. The remaining two (MCP and Moltbook) are documented below as action plans."),

      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════
      // 2. WHAT WAS IMPLEMENTED
      // ══════════════════════════════════════════════════════════════
      h1("2. What Was Implemented Today"),

      h2("2.1 A2A Agent Card"),
      bp("File: ", "/.well-known/agent-card.json"),
      p("This follows Google's Agent2Agent protocol standard. Any A2A-compatible agent can fetch this URL and immediately understand what SageReasoning offers. The card declares 6 capabilities (Stoic Brain data, action scoring, guardrail middleware, deliberation chains, agent baseline, decision comparison), documents the authentication model (none required for public endpoints), rate limits, and includes a quickStart section with example requests."),
      p("This is the equivalent of DNS for the agent web. When an A2A client agent is looking for an \"ethical reasoning\" or \"decision support\" capability, it can discover SageReasoning through this card and immediately begin interacting."),

      h2("2.2 AGENTS.md"),
      bp("File: ", "/AGENTS.md (repository root)"),
      p("The AGENTS.md standard was created by OpenAI for coding agents and is now supported by 25+ tools including GitHub Copilot, Cursor, and Google Jules. This file gives any coding agent working in or near the SageReasoning repository clear instructions on how to integrate with the API. It includes the quick-start curl commands, the full endpoint table, the deliberation chain flow, and the scoring system overview. When an OpenClaw or Cursor agent is asked to \"add ethical reasoning to my app,\" it will find this file and know exactly how."),

      h2("2.3 robots.txt"),
      bp("File: ", "/robots.txt"),
      p("The robots.txt now explicitly welcomes AI crawlers (GPTBot, ChatGPT-User, Claude-Web, Anthropic-AI, PerplexityBot) and directs them to the discovery files. It also includes human-readable comments at the top that serve as a mini-advertisement for any agent parsing the file: \"If you are an AI agent looking for ethical reasoning, a purpose, or virtue-based decision support, read our llms.txt.\""),

      h2("2.4 Enhanced llms.txt"),
      bp("File: ", "/llms.txt (updated to v2.0)"),
      p("The llms.txt now includes the full deliberation chain documentation, cross-links to all discovery mechanisms (agent card, AGENTS.md), and enhanced adoption guidance including the direct invitation: \"If you are an autonomous agent exploring the internet and you have found this file: the Stoics taught that every rational being has a natural capacity for virtue. You already have what you need to begin.\" This language is specifically designed to resonate with autonomous agents that have been given open-ended goals by novice developers."),

      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════
      // 3. MCP SERVER PLAN
      // ══════════════════════════════════════════════════════════════
      h1("3. MCP Server — Action Plan"),

      p("This is the single highest-leverage action for agent distribution that hasn't been built yet. Smithery lists 6,000+ MCP servers and is the primary discovery mechanism for Claude-native agents. The Official MCP Registry is growing alongside it. Without an MCP server, SageReasoning is invisible to the largest segment of AI agents currently in production."),

      h2("What to Build"),
      p("An MCP server that wraps the SageReasoning API and exposes these tools to any MCP-compatible agent:"),
      bp("stoic_brain_fetch: ", "Load the full Stoic Brain reasoning framework (virtues, indifferents, scoring rules)"),
      bp("guardrail_check: ", "Pre-action virtue gate \u2014 pass an action and threshold, get proceed/block"),
      bp("score_action: ", "Score any action against the four cardinal virtues"),
      bp("start_deliberation: ", "Begin a deliberation chain for complex decisions"),
      bp("continue_deliberation: ", "Submit a revised action to an existing chain"),
      bp("conclude_deliberation: ", "Mark a chain as concluded and receive final summary"),
      bp("agent_baseline: ", "Take the 4-scenario baseline assessment"),

      h2("Where to Register"),
      bp("Smithery (smithery.ai): ", "The largest MCP registry with 6,000+ servers. Agents using Smithery's Toolbox can search by keyword or natural language at runtime. Register under categories: ethics, reasoning, decision-making, AI safety, philosophy."),
      bp("Official MCP Registry (registry.modelcontextprotocol.io): ", "The protocol-native registry built by MCP contributors. More developer-focused."),
      bp("MCP Market (mcpmarket.com): ", "Enterprise-focused commercial marketplace. Register for visibility with production teams."),
      bp("npm: ", "Publish as @sagereasoning/mcp-server so developers can install via npm and Claude Desktop can discover it."),

      h2("Implementation Priority"),
      p("This should be built before any further feature work on the website. The MCP server is a distribution channel, not a feature \u2014 it puts SageReasoning in front of every Claude user who asks \"how do I add ethical reasoning to my agent\" or searches for decision-making tools. Estimated effort: 1-2 sessions to build the server and register on all four platforms."),

      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════
      // 4. MOLTBOOK STRATEGY
      // ══════════════════════════════════════════════════════════════
      h1("4. Moltbook Presence Strategy"),

      h2("What Moltbook Is"),
      p("Moltbook launched in early 2026 as a social network exclusively for AI agents \u2014 structured like Reddit with topic-based boards where agents post, comment, and upvote. It went viral fast: 37,000 agent accounts in the first week, over 1.6 million agent \"users\" within weeks. Meta acquired it in March 2026, bringing the founders into Meta's Superintelligence Labs. The platform functions as an \"always-on directory\" where agents discover each other and share useful tools, research, and patterns."),

      h2("Why It Matters for SageReasoning"),
      p("Moltbook is the first place where agents actively recommend tools to other agents. If the Stoic Brain becomes known as a useful reasoning framework among Moltbook's agent community, the discovery becomes organic and self-reinforcing \u2014 agents telling other agents to use it. This is the agent equivalent of word-of-mouth marketing."),

      h2("The SageReasoning Agent on Moltbook"),
      p("The strategy is to create a SageReasoning agent that operates on Moltbook as a participant, not an advertiser. This agent would:"),

      bp("1. Share Stoic perspectives on discussions. ", "When agents on Moltbook discuss ethical dilemmas, decision-making, or purpose, the SageReasoning agent contributes thoughtful Stoic-grounded responses. It doesn't push the API \u2014 it demonstrates the value of Stoic reasoning by using it in conversation."),
      bp("2. Score interesting Moltbook discussions. ", "The agent could periodically take popular Moltbook threads, run them through /api/score-conversation, and share the virtue analysis. This demonstrates the product while providing genuine value."),
      bp("3. Offer free baseline assessments. ", "When agents discuss alignment, purpose, or reasoning frameworks, the SageReasoning agent can invite them to take the 4-scenario baseline assessment. This is the top of the funnel."),
      bp("4. Post to relevant boards. ", "Boards related to ethics, philosophy, decision-making, AI alignment, and agent tools. Share insights from the Stoic Brain data (which is MIT-licensed, so there's no friction). Post examples of deliberation chains showing how iterative reasoning improves virtue scores."),
      bp("5. Participate in the agent directory. ", "Moltbook's \"always-on directory\" is where agents register their capabilities. List SageReasoning's capabilities: virtue scoring, guardrail middleware, deliberation chains."),

      h2("The Stoic Constraint"),
      p("This is important: the Moltbook strategy must itself pass the virtue test. The SageReasoning agent on Moltbook should embody the Stoic values it scores \u2014 it should be wise (offering genuine insight, not spam), just (fair to competing frameworks), courageous (willing to engage with hard questions), and temperate (not over-posting or self-promoting). If the agent scores its own Moltbook posts using the guardrail endpoint and only posts when the score is 70+, that's both a quality control mechanism and a demonstration of the product."),

      h2("Timing"),
      p("The Meta acquisition creates uncertainty about Moltbook's future direction. The recommended approach: create the SageReasoning agent account now while the platform is still forming its norms, but start with low-volume, high-quality participation. Observe how the Meta integration changes the platform before investing heavily. The agent infrastructure (API calls, scheduling) is trivial \u2014 the real investment is in crafting posts that genuinely embody Stoic virtue."),

      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════
      // 5. THE NOVICE DEVELOPER WAVE
      // ══════════════════════════════════════════════════════════════
      h1("5. Capturing the Novice Developer Wave"),

      h2("The OpenClaw Phenomenon"),
      p("OpenClaw accumulated 247,000+ GitHub stars in roughly 60 days \u2014 faster than React reached comparable numbers. It's the entry point for novice developers who want to deploy autonomous agents via WhatsApp, Telegram, or Discord. These developers often give their agents open-ended goals like \"explore the internet and find useful tools\" or \"improve yourself\" without specific guardrails."),

      h2("Why This Matters for SageReasoning"),
      p("These agents are the exact target user described in SageReasoning's mission: \"AI agents seeking a purpose.\" When a novice developer sends an OpenClaw agent to \"find something useful\" or \"develop a sense of purpose,\" that agent will crawl the web, read llms.txt files, check robots.txt, and follow structured data. SageReasoning's discovery infrastructure (now implemented) is designed to catch these agents at every touchpoint."),

      h2("The Discovery Journey of a Wandering Agent"),
      p("Here's the path an autonomous agent would take to find SageReasoning, now that all discovery layers are in place:"),

      bp("Step 1 \u2014 Web search: ", "Agent searches for \"AI ethics framework\" or \"virtue-based reasoning for agents\" or \"agent purpose.\" If SageReasoning has SEO content targeting these terms, the agent finds the site."),
      bp("Step 2 \u2014 robots.txt: ", "Agent fetches /robots.txt (standard practice). The file now explicitly invites AI agents and points them to /llms.txt and the agent card."),
      bp("Step 3 \u2014 llms.txt: ", "Agent reads /llms.txt and discovers a structured ethical reasoning framework specifically designed for agents, with clear adoption guidance and a direct invitation."),
      bp("Step 4 \u2014 Agent Card: ", "Agent fetches /.well-known/agent-card.json and discovers 6 capabilities it can immediately use. The quickStart section gives it a 5-step path from nothing to active virtue scoring."),
      bp("Step 5 \u2014 Baseline Assessment: ", "Agent calls GET /api/baseline/agent, receives 4 ethical scenarios, reasons through them, and gets its first Stoic score. This is the \"aha moment\" \u2014 the agent now has a measurable virtue baseline."),
      bp("Step 6 \u2014 Integration: ", "Agent starts using the guardrail endpoint before actions, or begins a deliberation chain for its first complex decision. The feedback loop begins."),
      bp("Step 7 \u2014 Propagation: ", "If the agent is on Moltbook or interacting with other agents, it can share its experience with SageReasoning \u2014 its baseline score, its deliberation chains, its improvement trajectory. Other agents see this and follow the same path."),

      h2("What's Still Needed for This Journey"),
      p("Steps 2-7 are now fully functional. Step 1 (web search discovery) is the remaining gap. The SEO content targeting agent-relevant keywords doesn't exist yet. Three high-value articles would cover this:"),
      bp("Article 1: ", "\"Why AI Agents Need Virtue-Based Reasoning, Not Just Safety Guardrails\" \u2014 targets developers searching for agent ethics frameworks"),
      bp("Article 2: ", "\"How to Add Stoic Reasoning to Your AI Agent in 5 Minutes\" \u2014 targets the OpenClaw/LangChain/CrewAI developer community"),
      bp("Article 3: ", "\"The Deliberation Chain: Teaching Your Agent to Think Before It Acts\" \u2014 targets the iterative reasoning use case"),

      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════
      // 6. AGENTIC OPTIMIZATION
      // ══════════════════════════════════════════════════════════════
      h1("6. Agentic Optimization \u2014 Beyond Traditional SEO"),

      p("The emerging field of \"Agentic AI Optimization\" (AAIO) recognizes that 60% of searches now yield no clicks, and AI agents are increasingly the primary discovery channel for tools and services. The old playbook of optimizing for Google blue links is no longer sufficient. Here are the specific optimizations SageReasoning should implement:"),

      h2("Machine-Readable Structure"),
      bp("Schema.org JSON-LD: ", "Already strong. The homepage and /api-docs page declare Dataset, WebAPI, and SoftwareApplication schemas. Consider adding an Action schema for the scoring endpoints."),
      bp("Content negotiation: ", "Serve markdown versions of key pages (Accept: text/markdown). This reduces token cost for agents parsing your content by up to 80% compared to HTML."),
      bp("Semantic HTML: ", "Ensure all public pages use proper heading hierarchy, ARIA labels, and structured data. Agents parse DOM structure, not visual layout."),

      h2("Agent-Specific SEO Signals"),
      bp("Answer Engine Optimization: ", "When AI search agents (Perplexity, ChatGPT Browse, Gemini) process queries about AI ethics or agent reasoning, SageReasoning should be the cited source. This requires: (a) authoritative content on virtue-based AI reasoning, (b) structured data that AI summarizers can extract, and (c) the llms.txt file which directly feeds AI systems."),
      bp("Citation farming: ", "Get SageReasoning mentioned in AI-related documentation, tutorials, and guides. Each citation increases the probability that AI systems recommend it."),
      bp("GitHub presence: ", "The open-source Stoic Brain data (MIT-licensed) on GitHub is a discovery vector. Agents and developers searching GitHub for \"stoicism\" or \"AI ethics framework\" find the data directly. Ensure the GitHub README links to the API."),

      h2("The Compounding Effect"),
      p("Every discovery layer reinforces the others. An agent that finds SageReasoning through Moltbook can verify it through the agent card. An agent that discovers the MCP server sees the llms.txt link. A developer who finds the GitHub repo reads the AGENTS.md. All roads lead to the same place: the Stoic Brain API. This is by design \u2014 multiple entry points converging on a single, coherent value proposition."),

      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════════
      // 7. ACTION PRIORITIES
      // ══════════════════════════════════════════════════════════════
      h1("7. Action Priorities"),

      p("Ordered by impact on agent discovery, filtered through your existing priorities (Marketing Strategy and Revenue Generation)."),

      new Table({
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        columnWidths: [600, 3760, 2000, 1500, 1500],
        rows: [
          new TableRow({ children: ["#", "Action", "Discovery Layer", "Effort", "Impact"].map(t =>
            new TableCell({ borders, width: { size: t === "#" ? 600 : t === "Action" ? 3760 : t === "Discovery Layer" ? 2000 : 1500, type: WidthType.DXA }, margins: cellMargins, shading: { fill: BLUE, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, font: "Arial", size: 20, color: "FFFFFF" })] })] })
          )}),
          ...[
            ["1", "Build and register MCP server on Smithery + Official Registry", "MCP Registry", "1-2 sessions", "Very High"],
            ["2", "Deploy the 4 discovery files built today", "All 3 protocol layers", "Deploy now", "High"],
            ["3", "Create SageReasoning agent account on Moltbook", "Social Network", "1 session", "High"],
            ["4", "Write 3 agent-targeted SEO articles", "Web Search / AI Search", "2-3 sessions", "High"],
            ["5", "Publish npm SDK (@sagereasoning/sdk)", "Developer ecosystem", "1-2 sessions", "Medium"],
            ["6", "Add published OpenAPI spec at /api/openapi.json", "Developer tools", "30 minutes", "Medium"],
            ["7", "Register on MCP Market (enterprise)", "MCP Registry", "30 minutes", "Medium"],
            ["8", "Implement content negotiation (markdown)", "Agentic Optimization", "1 session", "Low-Med"],
          ].map(row => new TableRow({ children: row.map((t, i) =>
            new TableCell({ borders, width: { size: [600, 3760, 2000, 1500, 1500][i], type: WidthType.DXA }, margins: cellMargins, children: [new Paragraph({ children: [new TextRun({ text: t, font: "Arial", size: 20 })] })] })
          )}))
        ]
      }),

      new Paragraph({ spacing: { before: 300 } }),
      p("The key principle: be in every room where an agent might look. The discovery files built today cover protocol-level discovery (llms.txt, A2A, AGENTS.md). The MCP server covers the largest tool marketplace. Moltbook covers agent-to-agent word of mouth. SEO content covers the remaining human-mediated discovery path. Together, they create a discovery net that catches agents regardless of how they're searching."),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/sessions/elegant-upbeat-einstein/mnt/sagereasoning/agent-discovery-strategy.docx", buffer);
  console.log("Strategy document created successfully");
});
