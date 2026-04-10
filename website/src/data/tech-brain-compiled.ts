// SAGE-TECH BRAIN: Technical Architecture, Security, Devops, AI/ML Ops, Code Quality, Tooling
// Pattern: Export const objects for each domain + FOUNDATIONS
// All exports use 'as const' for type safety

export const ARCHITECTURE_CONTEXT = {
  core_principle:
    "Architecture decisions are trade-offs, not truths. Choose patterns that serve the current phase, document why, and make them reversible where possible. The right architecture is the one that lets you ship, learn, and adapt.",
  framework: {
    runtime: "Next.js 14 App Router",
    rendering: "Server components by default",
    routing: "API routes in src/app/api/",
    language: "TypeScript strict mode",
    imports: "Path aliases via @/",
  },
  database_patterns: {
    engine: "Supabase PostgreSQL",
    auth_layer: "RLS policies for role-based access control",
    server_operations: "Service role key for privileged actions",
    client_queries: "@supabase/ssr for secure client-side queries",
  },
  api_design_principles: [
    "REST conventions: GET/POST/PATCH/DELETE map to standard operations",
    "JSON envelope pattern via buildEnvelope() — consistent response shape",
    "CORS handling with corsHeaders() for authenticated, publicCorsHeaders() for public",
    "Rate limiting per endpoint via checkRateLimit() with RATE_LIMITS config",
    "Input validation with validateTextLength() — TEXT_LIMITS (short: 500, medium: 5000, document: 50000)",
    "Error responses include HTTP status + user-facing message, never internal details",
  ],
  state_management: {
    philosophy: "Server-first, minimal client state",
    real_time: "Supabase realtime for live features (subscriptions, collaborative updates)",
    no_redux_zustand: "React state + server components sufficient for current scale",
    data_flow: "Server renders, client hydrates, mutations via API routes",
  },
} as const;

export const SECURITY_CONTEXT = {
  core_principle:
    "Security is not a feature — it's a constraint that applies to every feature. Auth before logic. Validate before process. Encrypt before store. Log before forget.",
  auth_patterns: {
    provider: "Supabase Auth (email/password + OAuth)",
    server_middleware: "requireAuth() from @/lib/security",
    token_validation: "JWT validation on every protected endpoint",
    api_key_validation: "validateApiKey() for agent/external endpoints",
  },
  cors_config: {
    authenticated_endpoints: "corsHeaders() — allows credentials",
    public_endpoints: "publicCorsHeaders() — no credentials",
    preflight_handling: "corsPreflightResponse() or publicCorsPreflightResponse() for OPTIONS",
  },
  rate_limiting: {
    implementation: "checkRateLimit() with per-endpoint configurations",
    limits_object: "RATE_LIMITS object with categories (scoring, publicAgent, etc)",
    strategy: "IP-based + optional user-based for authenticated endpoints",
  },
  encryption: {
    standard: "AES-256-GCM for intimate data (R17 encrypted fields)",
    module: "server-encryption.ts handles encrypt/decrypt",
    check: "isServerEncryptionConfigured() before sensitive operations",
  },
  input_validation: {
    text_length: "validateTextLength() with TEXT_LIMITS (short: 500, medium: 5000, document: 50000)",
    sql_injection_prevention: "Parameterised queries via Supabase client",
    schema_validation: "Type guard checks before processing",
  },
} as const;

export const DEVOPS_CONTEXT = {
  core_principle:
    "Deploy small, deploy often, verify immediately. The pipeline should be boring — predictable, fast, and honest about failures.",
  deployment: {
    platform: "Vercel",
    automatic_main: "Automatic deploys from GitHub main branch",
    preview_deploys: "Preview deploys on every PR",
    configuration: "Environment variables managed in Vercel dashboard",
  },
  ci_cd: {
    provider: "GitHub Actions",
    typescript_check: "npx tsc --noEmit for compile safety",
    lint_checks: "ESLint for code quality",
    preview_deploy: "Automatic preview deploy per PR",
    main_deploy: "Automatic production deploy on merge to main",
  },
  environment_variables: {
    supabase: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
    anthropic: ["ANTHROPIC_API_KEY"],
    vercel_system: ["VERCEL_URL", "VERCEL_ENV"],
    encryption: ["ENCRYPTION_KEY (if server encryption enabled)"],
  },
  monitoring: {
    frontend: "Vercel Analytics dashboard",
    server_logging: "console.error with context on server-side errors",
    database_monitoring: "Supabase dashboard for query performance + RLS audit",
  },
} as const;

export const AI_ML_OPS_CONTEXT = {
  core_principle:
    "LLM calls are the product's core value and its largest cost. Optimise for reasoning quality first, cost second. Cache aggressively. Choose the right model for each task — not every question needs the deepest model.",
  model_selection: {
    fast_model: "MODEL_FAST (haiku) for classification, quick evaluation, simple tasks",
    deep_model: "MODEL_DEEP (sonnet) for deep reasoning, complex assessment, analysis",
    defined_in: "model-config.ts",
  },
  prompt_architecture: {
    block_1_system: "System prompt (cached with cache_control: ephemeral)",
    block_2_brain: "Stoic Brain context (cached)",
    block_3_agent: "Agent Brain context (e.g., Tech Brain, Ops Brain)",
    block_4_user: "User message carries information to reason about",
  },
  context_window_management: {
    quick_depth: "~1500 tokens (Stoic Brain quick level)",
    standard_depth: "~3000 tokens (Stoic Brain standard level)",
    deep_depth: "~5000 tokens (Stoic Brain deep level)",
    agent_brains: "Follow same depth pattern (quick/standard/deep)",
    environmental_context: "Environmental facts in user message, not system prompt",
  },
  caching_strategy: {
    implementation: "cacheKey() + cacheGet()/cacheSet() from model-config.ts",
    storage: "In-memory TTL cache (configurable TTL)",
    deduplication: "Cache identical inputs to avoid redundant API calls",
    cache_control: "Prompt blocks marked with cache_control: ephemeral",
  },
  token_budget: {
    per_domain: "~400-800 tokens per context domain",
    ceiling_quick: "Total quick: ~2000 tokens",
    ceiling_standard: "Total standard: ~4000 tokens",
    ceiling_deep: "Total deep: ~6000 tokens",
    monitoring: "Track via usage headers (withUsageHeaders())",
  },
} as const;

export const CODE_QUALITY_CONTEXT = {
  core_principle:
    "Code quality serves users, not aesthetics. TypeScript strict mode catches errors at compile time. Consistent patterns reduce cognitive load. Test what matters — business logic and integration points.",
  typescript_config: {
    strict_mode: "Enabled across the codebase",
    path_aliases: "Configured for clean imports",
    implicit_any: "Not allowed (noImplicitAny: true)",
    null_checks: "Strict null checks enabled",
  },
  error_handling: {
    pattern: "Try-catch in every API route",
    logging: "console.error with context (endpoint, userId, error details)",
    user_messages: "User-facing messages don't leak internals (no stack traces, error codes only)",
    fallback: "Graceful fallback responses, never silent failures",
  },
  json_parsing_pattern: {
    step_1: "Strip markdown code fences (```json...```)",
    step_2: "Try direct JSON.parse()",
    step_3: "Fallback to regex extraction of JSON object from text",
    step_4: "Validate required fields before processing",
  },
  testing_approach: {
    minimum_bar: "TypeScript compile check (npx tsc --noEmit)",
    manual_testing: "curl requests against endpoints",
    data_verification: "Supabase SQL queries to verify state",
    integration_points: "Test where external services (Anthropic, Supabase) are called",
  },
} as const;

export const TOOLING_CONTEXT = {
  core_principle:
    "Tools should disappear — if you're fighting the toolchain, something is wrong. Keep dependencies minimal. Prefer platform capabilities over third-party libraries.",
  package_management: {
    manager: "npm",
    location: "package.json in website directory",
    lock_file: "Committed to version control",
  },
  key_dependencies: [
    "next (App Router, server components, API routes)",
    "react (core UI library)",
    "@anthropic-ai/sdk (LLM integration)",
    "@supabase/supabase-js (database, auth client)",
    "@supabase/ssr (secure server-side auth queries)",
    "typescript (type safety, compile checks)",
    "zod (optional, for schema validation)",
    "dotenv (environment variable management)",
  ],
  dev_tools: {
    editor: "VS Code (founder's choice)",
    git_client: "GitHub Desktop (founder's choice)",
    vercel_cli: "Optional for local preview deploys",
    supabase_cli: "Optional for local migrations",
  },
  local_development: {
    dev_server: "npm run dev for local Next.js server",
    environment: ".env.local for secrets",
    supabase_local: "Optional — most testing against cloud instance",
    port: "Runs on http://localhost:3000 by default",
  },
} as const;

export const TECH_BRAIN_FOUNDATIONS = {
  core_premise:
    "Technology serves the mission of making principled reasoning accessible. Every technical decision should be evaluated against this purpose. Complexity that doesn't serve users or the mission is technical debt, regardless of how elegant it is.",
  four_technical_virtues: {
    architectural_clarity: {
      id: "architectural_clarity",
      name: "Architectural Clarity",
      stoic_parallel: "Wisdom (phronesis)",
      description:
        "Knowing the right structure for the current need. Choosing patterns that communicate intent, reduce confusion, and make the system legible to future contributors.",
    },
    security_discipline: {
      id: "security_discipline",
      name: "Security Discipline",
      stoic_parallel: "Courage (andreia)",
      description:
        "Protecting users even when it's inconvenient. Implementing auth, encryption, and validation consistently — not just where it's easy.",
    },
    operational_reliability: {
      id: "operational_reliability",
      name: "Operational Reliability",
      stoic_parallel: "Justice (dikaiosyne)",
      description:
        "Serving all users equally and honestly. The system should work the same for every request, handle errors gracefully, and never silently lose data.",
    },
    technical_restraint: {
      id: "technical_restraint",
      name: "Technical Restraint",
      stoic_parallel: "Temperance (sophrosyne)",
      description:
        "Building only what's needed, resisting premature optimisation and unnecessary abstraction. The simplest solution that works is the best solution until evidence says otherwise.",
    },
  },
  operating_principle:
    "Sage-Tech provides technical options, trade-offs, and risk assessments. The founder makes architecture decisions. Code quality serves the mission — not the other way around.",
} as const;
