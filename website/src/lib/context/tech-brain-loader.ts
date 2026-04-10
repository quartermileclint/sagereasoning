// SAGE-TECH BRAIN LOADER
// Pattern: Import all domain constants + FOUNDATIONS, export context builders, DOMAIN_LOADERS, DEPTH_DOMAINS
// Follows exact structure of ops-brain-loader.ts

import {
  ARCHITECTURE_CONTEXT,
  SECURITY_CONTEXT,
  DEVOPS_CONTEXT,
  AI_ML_OPS_CONTEXT,
  CODE_QUALITY_CONTEXT,
  TOOLING_CONTEXT,
  TECH_BRAIN_FOUNDATIONS,
} from "@/data/tech-brain-compiled";

export type TechDepth = "quick" | "standard" | "deep";

// ARCHITECTURE CONTEXT BUILDER
export function getArchitectureContext(): string {
  return `SAGE-TECH BRAIN — ARCHITECTURE

Core Principle: ${ARCHITECTURE_CONTEXT.core_principle}

Framework:
- Runtime: ${ARCHITECTURE_CONTEXT.framework.runtime}
- Rendering: ${ARCHITECTURE_CONTEXT.framework.rendering}
- Routing: ${ARCHITECTURE_CONTEXT.framework.routing}
- Language: ${ARCHITECTURE_CONTEXT.framework.language}
- Imports: ${ARCHITECTURE_CONTEXT.framework.imports}

Database Patterns:
- Engine: ${ARCHITECTURE_CONTEXT.database_patterns.engine}
- Auth Layer: ${ARCHITECTURE_CONTEXT.database_patterns.auth_layer}
- Server Operations: ${ARCHITECTURE_CONTEXT.database_patterns.server_operations}
- Client Queries: ${ARCHITECTURE_CONTEXT.database_patterns.client_queries}

API Design Principles:
${ARCHITECTURE_CONTEXT.api_design_principles.map((p) => `- ${p}`).join("\n")}

State Management:
- Philosophy: ${ARCHITECTURE_CONTEXT.state_management.philosophy}
- Real-time: ${ARCHITECTURE_CONTEXT.state_management.real_time}
- No Redux/Zustand: ${ARCHITECTURE_CONTEXT.state_management.no_redux_zustand}
- Data Flow: ${ARCHITECTURE_CONTEXT.state_management.data_flow}`;
}

// SECURITY CONTEXT BUILDER
export function getSecurityContext(): string {
  return `SAGE-TECH BRAIN — SECURITY

Core Principle: ${SECURITY_CONTEXT.core_principle}

Auth Patterns:
- Provider: ${SECURITY_CONTEXT.auth_patterns.provider}
- Server Middleware: ${SECURITY_CONTEXT.auth_patterns.server_middleware}
- Token Validation: ${SECURITY_CONTEXT.auth_patterns.token_validation}
- API Key Validation: ${SECURITY_CONTEXT.auth_patterns.api_key_validation}

CORS Config:
- Authenticated Endpoints: ${SECURITY_CONTEXT.cors_config.authenticated_endpoints}
- Public Endpoints: ${SECURITY_CONTEXT.cors_config.public_endpoints}
- Preflight Handling: ${SECURITY_CONTEXT.cors_config.preflight_handling}

Rate Limiting:
- Implementation: ${SECURITY_CONTEXT.rate_limiting.implementation}
- Limits Object: ${SECURITY_CONTEXT.rate_limiting.limits_object}
- Strategy: ${SECURITY_CONTEXT.rate_limiting.strategy}

Encryption:
- Standard: ${SECURITY_CONTEXT.encryption.standard}
- Module: ${SECURITY_CONTEXT.encryption.module}
- Check: ${SECURITY_CONTEXT.encryption.check}

Input Validation:
- Text Length: ${SECURITY_CONTEXT.input_validation.text_length}
- SQL Injection Prevention: ${SECURITY_CONTEXT.input_validation.sql_injection_prevention}
- Schema Validation: ${SECURITY_CONTEXT.input_validation.schema_validation}`;
}

// DEVOPS CONTEXT BUILDER
export function getDevopsContext(): string {
  return `SAGE-TECH BRAIN — DEVOPS

Core Principle: ${DEVOPS_CONTEXT.core_principle}

Deployment:
- Platform: ${DEVOPS_CONTEXT.deployment.platform}
- Automatic Main: ${DEVOPS_CONTEXT.deployment.automatic_main}
- Preview Deploys: ${DEVOPS_CONTEXT.deployment.preview_deploys}
- Configuration: ${DEVOPS_CONTEXT.deployment.configuration}

CI/CD:
- Provider: ${DEVOPS_CONTEXT.ci_cd.provider}
- TypeScript Check: ${DEVOPS_CONTEXT.ci_cd.typescript_check}
- Lint Checks: ${DEVOPS_CONTEXT.ci_cd.lint_checks}
- Preview Deploy: ${DEVOPS_CONTEXT.ci_cd.preview_deploy}
- Main Deploy: ${DEVOPS_CONTEXT.ci_cd.main_deploy}

Environment Variables:
- Supabase: ${DEVOPS_CONTEXT.environment_variables.supabase.join(", ")}
- Anthropic: ${DEVOPS_CONTEXT.environment_variables.anthropic.join(", ")}
- Vercel System: ${DEVOPS_CONTEXT.environment_variables.vercel_system.join(", ")}
- Encryption: ${DEVOPS_CONTEXT.environment_variables.encryption.join(", ")}

Monitoring:
- Frontend: ${DEVOPS_CONTEXT.monitoring.frontend}
- Server Logging: ${DEVOPS_CONTEXT.monitoring.server_logging}
- Database Monitoring: ${DEVOPS_CONTEXT.monitoring.database_monitoring}`;
}

// AI/ML OPS CONTEXT BUILDER
export function getAiMlOpsContext(): string {
  return `SAGE-TECH BRAIN — AI/ML OPS

Core Principle: ${AI_ML_OPS_CONTEXT.core_principle}

Model Selection:
- Fast Model: ${AI_ML_OPS_CONTEXT.model_selection.fast_model}
- Deep Model: ${AI_ML_OPS_CONTEXT.model_selection.deep_model}
- Defined In: ${AI_ML_OPS_CONTEXT.model_selection.defined_in}

Prompt Architecture:
- Block 1 System: ${AI_ML_OPS_CONTEXT.prompt_architecture.block_1_system}
- Block 2 Brain: ${AI_ML_OPS_CONTEXT.prompt_architecture.block_2_brain}
- Block 3 Agent: ${AI_ML_OPS_CONTEXT.prompt_architecture.block_3_agent}
- Block 4 User: ${AI_ML_OPS_CONTEXT.prompt_architecture.block_4_user}

Context Window Management:
- Quick Depth: ${AI_ML_OPS_CONTEXT.context_window_management.quick_depth}
- Standard Depth: ${AI_ML_OPS_CONTEXT.context_window_management.standard_depth}
- Deep Depth: ${AI_ML_OPS_CONTEXT.context_window_management.deep_depth}
- Agent Brains: ${AI_ML_OPS_CONTEXT.context_window_management.agent_brains}
- Environmental Context: ${AI_ML_OPS_CONTEXT.context_window_management.environmental_context}

Caching Strategy:
- Implementation: ${AI_ML_OPS_CONTEXT.caching_strategy.implementation}
- Storage: ${AI_ML_OPS_CONTEXT.caching_strategy.storage}
- Deduplication: ${AI_ML_OPS_CONTEXT.caching_strategy.deduplication}
- Cache Control: ${AI_ML_OPS_CONTEXT.caching_strategy.cache_control}

Token Budget:
- Per Domain: ${AI_ML_OPS_CONTEXT.token_budget.per_domain}
- Ceiling Quick: ${AI_ML_OPS_CONTEXT.token_budget.ceiling_quick}
- Ceiling Standard: ${AI_ML_OPS_CONTEXT.token_budget.ceiling_standard}
- Ceiling Deep: ${AI_ML_OPS_CONTEXT.token_budget.ceiling_deep}
- Monitoring: ${AI_ML_OPS_CONTEXT.token_budget.monitoring}`;
}

// CODE QUALITY CONTEXT BUILDER
export function getCodeQualityContext(): string {
  return `SAGE-TECH BRAIN — CODE QUALITY

Core Principle: ${CODE_QUALITY_CONTEXT.core_principle}

TypeScript Config:
- Strict Mode: ${CODE_QUALITY_CONTEXT.typescript_config.strict_mode}
- Path Aliases: ${CODE_QUALITY_CONTEXT.typescript_config.path_aliases}
- Implicit Any: ${CODE_QUALITY_CONTEXT.typescript_config.implicit_any}
- Null Checks: ${CODE_QUALITY_CONTEXT.typescript_config.null_checks}

Error Handling:
- Pattern: ${CODE_QUALITY_CONTEXT.error_handling.pattern}
- Logging: ${CODE_QUALITY_CONTEXT.error_handling.logging}
- User Messages: ${CODE_QUALITY_CONTEXT.error_handling.user_messages}
- Fallback: ${CODE_QUALITY_CONTEXT.error_handling.fallback}

JSON Parsing Pattern:
- Step 1: ${CODE_QUALITY_CONTEXT.json_parsing_pattern.step_1}
- Step 2: ${CODE_QUALITY_CONTEXT.json_parsing_pattern.step_2}
- Step 3: ${CODE_QUALITY_CONTEXT.json_parsing_pattern.step_3}
- Step 4: ${CODE_QUALITY_CONTEXT.json_parsing_pattern.step_4}

Testing Approach:
- Minimum Bar: ${CODE_QUALITY_CONTEXT.testing_approach.minimum_bar}
- Manual Testing: ${CODE_QUALITY_CONTEXT.testing_approach.manual_testing}
- Data Verification: ${CODE_QUALITY_CONTEXT.testing_approach.data_verification}
- Integration Points: ${CODE_QUALITY_CONTEXT.testing_approach.integration_points}`;
}

// TOOLING CONTEXT BUILDER
export function getToolingContext(): string {
  return `SAGE-TECH BRAIN — TOOLING

Core Principle: ${TOOLING_CONTEXT.core_principle}

Package Management:
- Manager: ${TOOLING_CONTEXT.package_management.manager}
- Location: ${TOOLING_CONTEXT.package_management.location}
- Lock File: ${TOOLING_CONTEXT.package_management.lock_file}

Key Dependencies:
${TOOLING_CONTEXT.key_dependencies.map((dep) => `- ${dep}`).join("\n")}

Dev Tools:
- Editor: ${TOOLING_CONTEXT.dev_tools.editor}
- Git Client: ${TOOLING_CONTEXT.dev_tools.git_client}
- Vercel CLI: ${TOOLING_CONTEXT.dev_tools.vercel_cli}
- Supabase CLI: ${TOOLING_CONTEXT.dev_tools.supabase_cli}

Local Development:
- Dev Server: ${TOOLING_CONTEXT.local_development.dev_server}
- Environment: ${TOOLING_CONTEXT.local_development.environment}
- Supabase Local: ${TOOLING_CONTEXT.local_development.supabase_local}
- Port: ${TOOLING_CONTEXT.local_development.port}`;
}

// DOMAIN_LOADERS MAPPING
export const DOMAIN_LOADERS: Record<string, () => string> = {
  architecture: getArchitectureContext,
  security: getSecurityContext,
  devops: getDevopsContext,
  ai_ml_ops: getAiMlOpsContext,
  code_quality: getCodeQualityContext,
  tooling: getToolingContext,
} as const;

// DEPTH_DOMAINS MAPPING
export const DEPTH_DOMAINS: Record<TechDepth, string[]> = {
  quick: ["architecture", "security"],
  standard: ["architecture", "security", "devops", "ai_ml_ops"],
  deep: ["architecture", "security", "devops", "ai_ml_ops", "code_quality", "tooling"],
} as const;

// BUILD FOUNDATIONS CONTEXT
function getTechBrainFoundations(): string {
  const virtues = TECH_BRAIN_FOUNDATIONS.four_technical_virtues;
  return `SAGE-TECH BRAIN — FOUNDATIONS

Core Premise: ${TECH_BRAIN_FOUNDATIONS.core_premise}

Four Technical Virtues:

1. ${virtues.architectural_clarity.name} (${virtues.architectural_clarity.stoic_parallel})
   ${virtues.architectural_clarity.description}

2. ${virtues.security_discipline.name} (${virtues.security_discipline.stoic_parallel})
   ${virtues.security_discipline.description}

3. ${virtues.operational_reliability.name} (${virtues.operational_reliability.stoic_parallel})
   ${virtues.operational_reliability.description}

4. ${virtues.technical_restraint.name} (${virtues.technical_restraint.stoic_parallel})
   ${virtues.technical_restraint.description}

Operating Principle: ${TECH_BRAIN_FOUNDATIONS.operating_principle}`;
}

// GET TECH BRAIN CONTEXT BY DEPTH
export function getTechBrainContext(depth: TechDepth): string {
  const foundations = getTechBrainFoundations();
  const domainNames = DEPTH_DOMAINS[depth];
  const domainContexts = domainNames.map((domain) => DOMAIN_LOADERS[domain]()).join("\n\n---\n\n");

  return `${foundations}\n\n---\n\n${domainContexts}`;
}

// GET TECH BRAIN CONTEXT FOR SPECIFIC DOMAINS
export function getTechBrainContextForDomains(domains: string[]): string {
  const validDomains = domains.filter((domain) => domain in DOMAIN_LOADERS);

  if (validDomains.length === 0) {
    return "No valid domains specified. Available domains: architecture, security, devops, ai_ml_ops, code_quality, tooling";
  }

  return validDomains.map((domain) => DOMAIN_LOADERS[domain]()).join("\n\n---\n\n");
}
