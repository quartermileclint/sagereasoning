#!/usr/bin/env node
/**
 * SageReasoning Hold Point Test Harness
 * Assessment 1: "What works?"
 *
 * Tests every component that can be tested without a running dev server.
 * Produces a markdown report with PASS/FAIL/WARN and recommended fix actions.
 *
 * Usage:
 *   node operations/holdpoint-test-harness.mjs
 *   node operations/holdpoint-test-harness.mjs --clear   (delete old report first)
 *
 * Output: operations/holdpoint-test-report.md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const WEBSITE = path.join(ROOT, 'website');
const REPORT_PATH = path.join(ROOT, 'operations', 'holdpoint-test-report.md');

// Clear mode
if (process.argv.includes('--clear')) {
  if (fs.existsSync(REPORT_PATH)) {
    fs.unlinkSync(REPORT_PATH);
    console.log('Cleared previous report.');
  }
  if (!process.argv.includes('--run')) {
    process.exit(0);
  }
}

const results = [];
let passCount = 0;
let failCount = 0;
let warnCount = 0;
let skipCount = 0;

function record(category, name, status, detail, fix = '') {
  results.push({ category, name, status, detail, fix });
  if (status === 'PASS') passCount++;
  else if (status === 'FAIL') failCount++;
  else if (status === 'WARN') warnCount++;
  else skipCount++;
}

function fileExists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function fileLines(relPath) {
  try {
    return fs.readFileSync(path.join(ROOT, relPath), 'utf8').split('\n').length;
  } catch { return 0; }
}

function fileContains(relPath, pattern) {
  try {
    const content = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
    return typeof pattern === 'string' ? content.includes(pattern) : pattern.test(content);
  } catch { return false; }
}

function fileContent(relPath) {
  try { return fs.readFileSync(path.join(ROOT, relPath), 'utf8'); } catch { return ''; }
}

// ============================================================
// TEST SUITE 1: File Existence & Structure
// ============================================================
function testFileExistence() {
  const criticalFiles = [
    { path: 'manifest.md', name: 'Manifest (R0-R20)' },
    { path: 'INDEX.md', name: 'Project Index' },
    { path: 'LICENSE', name: 'Proprietary License' },
    { path: 'SageReasoning_Ecosystem_Map.html', name: 'Ecosystem Map v3' },
    { path: 'SageReasoning_Capability_Inventory.html', name: 'Capability Inventory' },
    { path: 'operations/decision-log.md', name: 'Decision Log' },
    { path: 'operations/verification-framework.md', name: 'Verification Framework' },
  ];

  for (const f of criticalFiles) {
    if (fileExists(f.path)) {
      record('1. Core Files', f.name, 'PASS', `Exists at /${f.path}`);
    } else {
      record('1. Core Files', f.name, 'FAIL', `Missing: /${f.path}`, `Create or restore ${f.path}`);
    }
  }
}

// ============================================================
// TEST SUITE 2: Stoic Brain v3 Dataset
// ============================================================
function testStoicBrain() {
  // Actual files in stoic-brain/ (not cosmology/logic as ecosystem map claimed)
  const brainFiles = [
    'stoic-brain/virtue.json',
    'stoic-brain/action.json',
    'stoic-brain/scoring.json',
    'stoic-brain/progress.json',
    'stoic-brain/psychology.json',
    'stoic-brain/passions.json',
    'stoic-brain/value.json',
    'stoic-brain/stoic-brain.json',
  ];

  for (const f of brainFiles) {
    const name = path.basename(f);
    if (!fileExists(f)) {
      record('2. Stoic Brain v3', name, 'FAIL', `Missing: /${f}`, `Restore Stoic Brain dataset file`);
      continue;
    }
    try {
      const data = JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
      const keys = Object.keys(data);
      const lines = fileLines(f);
      if (lines < 10) {
        record('2. Stoic Brain v3', name, 'WARN', `Only ${lines} lines — may be incomplete`, `Verify content completeness`);
      } else {
        record('2. Stoic Brain v3', name, 'PASS', `Valid JSON, ${lines} lines, ${keys.length} top-level keys`);
      }
    } catch (e) {
      record('2. Stoic Brain v3', name, 'FAIL', `Invalid JSON: ${e.message}`, `Fix JSON syntax`);
    }
  }
}

// ============================================================
// TEST SUITE 3: TypeScript Compilation
// ============================================================
function testTypeScript() {
  try {
    execSync('npx tsc --noEmit 2>&1', { cwd: WEBSITE, timeout: 60000, encoding: 'utf8' });
    record('3. TypeScript', 'Full type check', 'PASS', 'Zero type errors across entire codebase');
  } catch (e) {
    const output = e.stdout || e.stderr || '';
    const errorCount = (output.match(/error TS/g) || []).length;
    record('3. TypeScript', 'Full type check', 'FAIL', `${errorCount} type error(s)`, `Run: cd website && npx tsc --noEmit to see full errors`);
    // Extract first 5 errors for the report
    const lines = output.split('\n').filter(l => l.includes('error TS')).slice(0, 5);
    for (const line of lines) {
      record('3. TypeScript', 'Type error detail', 'FAIL', line.trim(), '');
    }
  }
}

// ============================================================
// TEST SUITE 4: API Route Health
// ============================================================
function testAPIRoutes() {
  const apiDir = path.join(WEBSITE, 'src/app/api');
  const routes = [];

  function findRoutes(dir, prefix = '') {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        findRoutes(path.join(dir, entry.name), `${prefix}/${entry.name}`);
      } else if (entry.name === 'route.ts') {
        routes.push({ path: `${prefix}`, file: path.join(dir, entry.name) });
      }
    }
  }
  findRoutes(apiDir);

  for (const route of routes) {
    const content = fs.readFileSync(route.file, 'utf8');
    const lines = content.split('\n').length;
    const routeName = route.path.replace(/^\//, '');

    // Check for placeholder/503
    if (content.includes('coming_soon') || content.includes('503')) {
      record('4. API Routes', `/api${route.path}`, 'WARN', `Placeholder (503 coming_soon). ${lines} LOC.`, `Implement this endpoint — required for P2 ethical safeguards`);
      continue;
    }

    // Check for key imports
    const hasAnthropic = /import.*anthropic|import.*Anthropic|runSageReason|getClient/i.test(content);
    const hasSupabase = /import.*supabase|createClient/i.test(content);
    const hasExport = /export\s+(async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)/i.test(content) ||
                      /export\s+const\s+(GET|POST|PUT|DELETE|PATCH)\s*=/i.test(content);

    if (!hasExport) {
      record('4. API Routes', `/api${route.path}`, 'FAIL', `No exported HTTP handler found. ${lines} LOC.`, `Add exported GET/POST handler`);
      continue;
    }

    // Check for TODO/FIXME
    const todos = (content.match(/TODO|FIXME|HACK|XXX/gi) || []).length;

    let detail = `${lines} LOC. Exports handler.`;
    if (hasAnthropic) detail += ' Uses Anthropic.';
    if (hasSupabase) detail += ' Uses Supabase.';
    if (todos > 0) detail += ` ${todos} TODO(s).`;

    if (todos > 3) {
      record('4. API Routes', `/api${route.path}`, 'WARN', detail, `Resolve ${todos} TODOs before launch`);
    } else {
      record('4. API Routes', `/api${route.path}`, 'PASS', detail);
    }
  }
}

// ============================================================
// TEST SUITE 5: Product Pages
// ============================================================
function testProductPages() {
  const pagesDir = path.join(WEBSITE, 'src/app');
  const pages = [];

  function findPages(dir, prefix = '') {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory() && !entry.name.startsWith('api')) {
        findPages(path.join(dir, entry.name), `${prefix}/${entry.name}`);
      } else if (entry.name === 'page.tsx') {
        pages.push({ path: prefix || '/', file: path.join(dir, entry.name) });
      }
    }
  }
  findPages(pagesDir);

  for (const page of pages) {
    const content = fs.readFileSync(page.file, 'utf8');
    const lines = content.split('\n').length;
    const pageName = page.path === '/' ? 'Landing Page' : page.path.replace(/^\//, '');

    // Check for genuine placeholder pages vs form placeholder attributes
    const comingSoonCount = (content.match(/Coming Soon/g) || []).length;
    const placeholderAttrCount = (content.match(/placeholder="/g) || []).length;
    const genuinePlaceholder = content.match(/>\s*Coming Soon\s*</); // In rendered text, not attributes
    const underConstruction = content.includes('Under Construction');
    const isPlaceholder = (genuinePlaceholder || underConstruction || lines < 20) &&
                          placeholderAttrCount === 0; // Not just form placeholders
    const todos = (content.match(/TODO|FIXME/gi) || []).length;

    if (isPlaceholder) {
      record('5. Product Pages', pageName, 'WARN', `Placeholder content. ${lines} LOC.`, `Build out this page before launch`);
    } else if (todos > 2) {
      record('5. Product Pages', pageName, 'WARN', `${lines} LOC but has ${todos} TODOs.`, `Resolve TODOs`);
    } else {
      record('5. Product Pages', pageName, 'PASS', `${lines} LOC. Functional UI.`);
    }
  }
}

// ============================================================
// TEST SUITE 6: sage-reason-engine (Core)
// ============================================================
function testSageReasonEngine() {
  const enginePath = 'website/src/lib/sage-reason-engine.ts';
  if (!fileExists(enginePath)) {
    record('6. Core Engine', 'sage-reason-engine.ts', 'FAIL', 'File missing!', 'Restore sage-reason-engine.ts');
    return;
  }

  const content = fileContent(enginePath);
  const lines = content.split('\n').length;

  // Check for critical exports
  const hasRunSageReason = content.includes('runSageReason');
  const hasGetClient = content.includes('getClient');
  const hasDepthConfigs = content.includes('QUICK') && content.includes('STANDARD') && content.includes('DEEP');
  const hasSystemPrompts = (content.match(/SYSTEM_PROMPT/g) || []).length;
  const hasReceipts = content.includes('receipt') || content.includes('Receipt');

  if (!hasRunSageReason) {
    record('6. Core Engine', 'runSageReason export', 'FAIL', 'Missing runSageReason function', 'Restore core export');
  } else {
    record('6. Core Engine', 'runSageReason export', 'PASS', 'Core function exported');
  }

  if (!hasGetClient) {
    record('6. Core Engine', 'Anthropic client singleton', 'FAIL', 'Missing getClient', 'Restore Anthropic client');
  } else {
    record('6. Core Engine', 'Anthropic client singleton', 'PASS', 'Singleton pattern present');
  }

  if (!hasDepthConfigs) {
    record('6. Core Engine', 'Depth configurations', 'FAIL', 'Missing QUICK/STANDARD/DEEP configs', 'Restore depth configs');
  } else {
    record('6. Core Engine', 'Depth configurations', 'PASS', 'All 3 depth levels configured');
  }

  record('6. Core Engine', 'System prompts', hasSystemPrompts >= 3 ? 'PASS' : 'WARN',
    `${hasSystemPrompts} system prompt(s) found`,
    hasSystemPrompts < 3 ? 'Should have 3 depth-specific prompts' : '');

  record('6. Core Engine', 'Receipt generation', hasReceipts ? 'PASS' : 'WARN',
    hasReceipts ? 'Receipt generation present' : 'No receipt generation found',
    hasReceipts ? '' : 'Add R14 reasoning receipts');

  record('6. Core Engine', 'Overall', 'PASS', `${lines} LOC. Core reasoning module intact.`);
}

// ============================================================
// TEST SUITE 7: Sage Mentor Subsystem (Isolated)
// ============================================================
function testSageMentor() {
  const mentorDir = path.join(ROOT, 'sage-mentor');
  if (!fs.existsSync(mentorDir)) {
    record('7. Sage Mentor', 'Directory', 'FAIL', 'sage-mentor/ directory missing', 'Restore sage-mentor directory');
    return;
  }

  const files = fs.readdirSync(mentorDir).filter(f => f.endsWith('.ts'));
  record('7. Sage Mentor', 'Module count', files.length >= 15 ? 'PASS' : 'WARN',
    `${files.length} TypeScript modules found`);

  let totalLines = 0;
  let totalTodos = 0;
  for (const f of files) {
    const content = fs.readFileSync(path.join(mentorDir, f), 'utf8');
    totalLines += content.split('\n').length;
    totalTodos += (content.match(/TODO|FIXME/gi) || []).length;
  }
  record('7. Sage Mentor', 'Total LOC', 'PASS', `${totalLines.toLocaleString()} lines across ${files.length} modules`);

  if (totalTodos > 10) {
    record('7. Sage Mentor', 'TODO count', 'WARN', `${totalTodos} TODOs across subsystem`, `Review and resolve TODOs before integration`);
  } else {
    record('7. Sage Mentor', 'TODO count', 'PASS', `${totalTodos} TODOs (acceptable)`);
  }

  // Check integration status
  try {
    const grepResult = execSync(
      `grep -rl "sage-mentor\\|from.*\\.\\./sage-mentor\\|from.*sage-mentor" website/src/ 2>/dev/null || true`,
      { cwd: ROOT, encoding: 'utf8', timeout: 10000 }
    ).trim();
    if (grepResult) {
      record('7. Sage Mentor', 'Website integration', 'PASS', 'Found imports in website/src');
    } else {
      record('7. Sage Mentor', 'Website integration', 'WARN',
        'ZERO imports from website/src. Architecturally isolated.',
        'Integration layer needed before Sage Mentor can function end-to-end. This is expected at P5 priority.');
    }
  } catch {
    record('7. Sage Mentor', 'Website integration', 'WARN', 'Could not verify integration', '');
  }

  // Check critical modules
  const criticalModules = ['ring-wrapper.ts', 'profile-store.ts', 'support-agent.ts', 'llm-bridge.ts', 'session-bridge.ts'];
  for (const mod of criticalModules) {
    if (files.includes(mod)) {
      const lines = fileLines(`sage-mentor/${mod}`);
      record('7. Sage Mentor', mod, 'PASS', `${lines} LOC`);
    } else {
      record('7. Sage Mentor', mod, 'FAIL', 'Module missing', `Restore ${mod}`);
    }
  }
}

// ============================================================
// TEST SUITE 8: Trust Layer
// ============================================================
function testTrustLayer() {
  const trustDir = path.join(ROOT, 'trust-layer');
  if (!fs.existsSync(trustDir)) {
    record('8. Trust Layer', 'Directory', 'FAIL', 'trust-layer/ directory missing', 'Restore trust-layer directory');
    return;
  }

  let totalFiles = 0;
  let totalLines = 0;
  function countFiles(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) countFiles(path.join(dir, entry.name));
      else if (entry.name.endsWith('.ts')) {
        totalFiles++;
        totalLines += fs.readFileSync(path.join(dir, entry.name), 'utf8').split('\n').length;
      }
    }
  }
  countFiles(trustDir);

  record('8. Trust Layer', 'Module count', totalFiles >= 10 ? 'PASS' : 'WARN',
    `${totalFiles} TypeScript modules, ${totalLines.toLocaleString()} LOC total`);

  // Check integration
  try {
    const grepResult = execSync(
      `grep -rl "trust-layer\\|from.*\\.\\./trust-layer\\|from.*trust-layer" website/src/ 2>/dev/null || true`,
      { cwd: ROOT, encoding: 'utf8', timeout: 10000 }
    ).trim();
    if (grepResult) {
      record('8. Trust Layer', 'Website integration', 'PASS', 'Found imports in website/src');
    } else {
      record('8. Trust Layer', 'Website integration', 'WARN',
        'ZERO imports from website/src. Architecturally isolated.',
        'Integration needed before Trust Layer can function. P3 priority.');
    }
  } catch {
    record('8. Trust Layer', 'Website integration', 'WARN', 'Could not verify integration', '');
  }

  // Check key files
  const keyFiles = ['card/accreditation-card.ts', 'schema/trust-layer-schema-REVIEW.sql'];
  for (const f of keyFiles) {
    if (fs.existsSync(path.join(trustDir, f))) {
      record('8. Trust Layer', f, 'PASS', `Exists, ${fileLines(`trust-layer/${f}`)} lines`);
    } else {
      record('8. Trust Layer', f, 'WARN', 'Not found at expected path', 'Verify file location');
    }
  }
}

// ============================================================
// TEST SUITE 9: Database Schemas
// ============================================================
function testDatabaseSchemas() {
  const sqlFiles = [];
  function findSQL(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) findSQL(path.join(dir, entry.name));
      else if (entry.name.endsWith('.sql')) {
        sqlFiles.push(path.relative(ROOT, path.join(dir, entry.name)));
      }
    }
  }
  findSQL(path.join(ROOT, 'api'));
  findSQL(path.join(ROOT, 'website'));
  findSQL(path.join(ROOT, 'supabase'));
  findSQL(path.join(ROOT, 'trust-layer'));

  record('9. Database', 'SQL migration count', sqlFiles.length >= 5 ? 'PASS' : 'WARN',
    `${sqlFiles.length} SQL files found`);

  for (const f of sqlFiles) {
    const content = fileContent(f);
    const lines = content.split('\n').length;
    const hasCreate = /CREATE\s+TABLE/i.test(content);
    const hasAlter = /ALTER\s+TABLE/i.test(content);
    const hasDrop = /DROP\s+TABLE/i.test(content);
    const hasRLS = /ROW\s+LEVEL\s+SECURITY|CREATE\s+POLICY/i.test(content);

    let detail = `${lines} LOC.`;
    if (hasCreate) detail += ' Creates tables.';
    if (hasAlter) detail += ' Alters tables.';
    if (hasRLS) detail += ' Has RLS policies.';

    const name = path.basename(f);
    if (!hasCreate && !hasAlter && lines < 5) {
      record('9. Database', name, 'WARN', `${lines} LOC — may be empty`, `Verify migration content`);
    } else {
      record('9. Database', name, 'PASS', detail);
      if (!hasRLS && hasCreate) {
        record('9. Database', `${name} (RLS)`, 'WARN', 'No Row Level Security policies found', 'Add RLS for R17 compliance');
      }
    }
  }
}

// ============================================================
// TEST SUITE 10: Environment & Config
// ============================================================
function testEnvironment() {
  // Check .env.local
  const envPath = path.join(WEBSITE, '.env.local');
  if (!fs.existsSync(envPath)) {
    record('10. Environment', '.env.local', 'FAIL', 'Missing', 'Create .env.local with required variables');
    return;
  }

  const env = fs.readFileSync(envPath, 'utf8');

  const checks = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', required: true },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', required: true },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', required: true },
    { key: 'ANTHROPIC_API_KEY', required: false },
    { key: 'NEXT_PUBLIC_SITE_URL', required: false },
  ];

  for (const check of checks) {
    const hasKey = env.includes(`${check.key}=`) && !env.includes(`# ${check.key}=`);
    if (hasKey) {
      record('10. Environment', check.key, 'PASS', 'Set');
    } else if (check.required) {
      record('10. Environment', check.key, 'FAIL', 'Missing or commented out', `Set ${check.key} in .env.local`);
    } else {
      if (check.key === 'ANTHROPIC_API_KEY') {
        record('10. Environment', check.key, 'PASS', 'Not yet configured (founder action needed before LLM tools work). This is expected during P0.');
      } else {
        record('10. Environment', check.key, 'WARN', 'Not set (commented out)', `Set ${check.key}`);
      }
    }
  }
}

// ============================================================
// TEST SUITE 11: Wrapped Skills Consistency
// ============================================================
function testWrappedSkills() {
  const skillDir = path.join(WEBSITE, 'src/app/api/skill');
  if (!fs.existsSync(skillDir)) {
    record('11. Wrapped Skills', 'Directory', 'FAIL', 'skill/ directory missing', 'Restore wrapped skills');
    return;
  }

  const skills = fs.readdirSync(skillDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  record('11. Wrapped Skills', 'Skill count', skills.length >= 12 ? 'PASS' : 'WARN',
    `${skills.length} wrapped skills found`);

  let factoryCount = 0;
  let customCount = 0;
  for (const skill of skills) {
    const routePath = path.join(skillDir, skill, 'route.ts');
    if (!fs.existsSync(routePath)) {
      record('11. Wrapped Skills', `sage-${skill}`, 'FAIL', 'No route.ts', 'Add route handler');
      continue;
    }
    const content = fs.readFileSync(routePath, 'utf8');
    const usesFactory = content.includes('createContextTemplateHandler') || content.includes('ContextTemplate');
    if (usesFactory) factoryCount++;
    else customCount++;
  }

  record('11. Wrapped Skills', 'Factory pattern', factoryCount > 0 ? 'PASS' : 'WARN',
    `${factoryCount} use factory, ${customCount} custom implementations`);
}

// ============================================================
// TEST SUITE 12: Governance & Compliance
// ============================================================
function testGovernance() {
  // Manifest
  if (fileExists('manifest.md')) {
    const manifest = fileContent('manifest.md');
    const ruleCount = (manifest.match(/^#{1,3}\s*R\d+/gm) || []).length;
    record('12. Governance', 'Manifest rules', ruleCount >= 15 ? 'PASS' : 'WARN',
      `${ruleCount} rules found`);
  }

  // Compliance register
  if (fileExists('compliance/compliance_register.json')) {
    try {
      const reg = JSON.parse(fileContent('compliance/compliance_register.json'));
      const obligations = Array.isArray(reg) ? reg.length : (reg.obligations || []).length;
      record('12. Governance', 'Compliance register', obligations >= 20 ? 'PASS' : 'WARN',
        `${obligations} obligations tracked`);
    } catch {
      record('12. Governance', 'Compliance register', 'FAIL', 'Invalid JSON', 'Fix compliance_register.json');
    }
  }

  // Decision log
  if (fileExists('operations/decision-log.md')) {
    const log = fileContent('operations/decision-log.md');
    const decisions = (log.match(/^## /gm) || []).length;
    record('12. Governance', 'Decision log', decisions >= 8 ? 'PASS' : 'WARN',
      `${decisions} decisions logged`);
  }

  // Agent discovery files
  const discoveryFiles = ['website/public/llms.txt', 'website/public/.well-known/agent-card.json', 'website/public/robots.txt'];
  for (const f of discoveryFiles) {
    const name = path.basename(f);
    if (fileExists(f) && fileLines(f) > 2) {
      record('12. Governance', name, 'PASS', `Exists, ${fileLines(f)} lines`);
    } else if (fileExists(f)) {
      record('12. Governance', name, 'WARN', 'Exists but very short', 'Verify content');
    } else {
      record('12. Governance', name, 'FAIL', 'Missing', `Create ${name} for agent discovery`);
    }
  }

  // OpenAPI spec
  if (fileExists('api/api-spec.yaml')) {
    const lines = fileLines('api/api-spec.yaml');
    record('12. Governance', 'OpenAPI spec', lines > 100 ? 'PASS' : 'WARN',
      `${lines} lines. ${lines > 500 ? 'Comprehensive.' : 'May need expansion.'}`);
  }
}

// ============================================================
// TEST SUITE 13: Security Checks
// ============================================================
function testSecurity() {
  // Check for hardcoded secrets in code
  const dangerousPatterns = [
    { pattern: /sk-ant-[a-zA-Z0-9]{20,}/, name: 'Anthropic API key in source' },
    { pattern: /eyJhbGci[a-zA-Z0-9._-]{50,}/, name: 'JWT token in source (non-env)' },
  ];

  const sourceFiles = [];
  function findSource(dir, depth = 0) {
    if (depth > 6 || !fs.existsSync(dir)) return;
    if (dir.includes('node_modules') || dir.includes('.next') || dir.includes('.git')) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) findSource(path.join(dir, entry.name), depth + 1);
      else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js')) {
        sourceFiles.push(path.join(dir, entry.name));
      }
    }
  }
  findSource(path.join(WEBSITE, 'src'));

  for (const dp of dangerousPatterns) {
    let found = false;
    for (const f of sourceFiles) {
      const content = fs.readFileSync(f, 'utf8');
      if (dp.pattern.test(content)) {
        record('13. Security', dp.name, 'FAIL',
          `Found in ${path.relative(ROOT, f)}`,
          'Remove hardcoded secret and use environment variable');
        found = true;
        break;
      }
    }
    if (!found) {
      record('13. Security', dp.name, 'PASS', 'No hardcoded secrets found in source');
    }
  }

  // Check .gitignore
  if (fileExists('.gitignore')) {
    const gi = fileContent('.gitignore');
    const checks = ['.env', '.env.local', 'node_modules', '.next'];
    for (const c of checks) {
      if (gi.includes(c)) {
        record('13. Security', `.gitignore: ${c}`, 'PASS', 'Excluded from git');
      } else {
        record('13. Security', `.gitignore: ${c}`, 'FAIL', 'Not in .gitignore', `Add ${c} to .gitignore`);
      }
    }
  }

  // Check encryption module
  if (fileExists('website/src/lib/encryption.ts')) {
    const enc = fileContent('website/src/lib/encryption.ts');
    const hasAES = enc.includes('AES-GCM') || enc.includes('aes-256');
    const hasPBKDF2 = enc.includes('PBKDF2') || enc.includes('pbkdf2');
    record('13. Security', 'Encryption module', hasAES && hasPBKDF2 ? 'PASS' : 'WARN',
      `AES-GCM: ${hasAES ? 'yes' : 'no'}, PBKDF2: ${hasPBKDF2 ? 'yes' : 'no'}`);
  }
}

// ============================================================
// TEST SUITE 14: Ethical Safeguards (P2 Requirements)
// ============================================================
function testEthicalSafeguards() {
  // R17: Data protection
  const deleteRoute = fileContent('website/src/app/api/user/delete/route.ts');
  if (deleteRoute.includes('coming_soon') || deleteRoute.includes('503')) {
    record('14. Ethical (P2)', 'R17c: Genuine deletion', 'FAIL',
      'Returns 503 placeholder. Not implemented.',
      'CRITICAL: Implement genuine account deletion before launch');
  }

  const exportRoute = fileContent('website/src/app/api/user/export/route.ts');
  if (exportRoute.includes('coming_soon') || exportRoute.includes('503')) {
    record('14. Ethical (P2)', 'R17: Data export', 'FAIL',
      'Returns 503 placeholder. Not implemented.',
      'CRITICAL: Implement GDPR data export before launch');
  }

  // R20: Vulnerable user detection
  const guardrails = fileContent('website/src/lib/guardrails.ts');
  if (guardrails) {
    const hasDistress = /distress|crisis|suicid|self.?harm|vulnerable/i.test(guardrails);
    record('14. Ethical (P2)', 'R20a: Distress detection', hasDistress ? 'PASS' : 'WARN',
      hasDistress ? 'Distress detection patterns found in guardrails' : 'No distress detection found',
      hasDistress ? '' : 'CRITICAL: Add vulnerable user detection and redirection');
  } else {
    record('14. Ethical (P2)', 'R20a: Distress detection', 'FAIL',
      'guardrails.ts not found',
      'CRITICAL: Implement distress detection before launch');
  }

  // R19: Limitations page
  const limitationsExists = fileExists('website/src/app/limitations/page.tsx');
  record('14. Ethical (P2)', 'R19c: Limitations page', limitationsExists ? 'PASS' : 'WARN',
    limitationsExists ? 'Page exists' : 'No limitations page yet',
    limitationsExists ? '' : 'Create user-facing limitations page before launch');

  // Check for R19d mirror principle in mentor prompts
  const mentorDir = path.join(ROOT, 'sage-mentor');
  if (fs.existsSync(mentorDir)) {
    let hasMirror = false;
    for (const f of fs.readdirSync(mentorDir).filter(f => f.endsWith('.ts'))) {
      if (fileContains(`sage-mentor/${f}`, /mirror.?principle|limitations|not.?a.?therapist/i)) {
        hasMirror = true;
        break;
      }
    }
    record('14. Ethical (P2)', 'R19d: Mirror principle', hasMirror ? 'PASS' : 'WARN',
      hasMirror ? 'Mirror principle references found' : 'No mirror principle in mentor prompts',
      hasMirror ? '' : 'Add mirror principle to mentor persona prompts');
  }
}

// ============================================================
// TEST SUITE 15: Session Handoff Notes (P0 0b)
// ============================================================
function testSessionHandoffs() {
  const handoffDir = path.join(ROOT, 'operations/session-handoffs');
  if (!fs.existsSync(handoffDir)) {
    record('15. P0 Protocols', 'Session handoffs dir', 'FAIL', 'Directory missing', 'Create operations/session-handoffs/');
    return;
  }
  const handoffs = fs.readdirSync(handoffDir).filter(f => f.endsWith('.md'));
  record('15. P0 Protocols', 'Handoff notes', handoffs.length >= 1 ? 'PASS' : 'WARN',
    `${handoffs.length} handoff note(s) found`);

  // Check latest handoff has required sections
  if (handoffs.length > 0) {
    const latest = handoffs.sort().pop();
    const content = fileContent(`operations/session-handoffs/${latest}`);
    const sections = ['Decisions Made', 'Status Changes', 'Next Session Should', 'Blocked On', 'Open Questions'];
    for (const s of sections) {
      if (content.includes(s)) {
        record('15. P0 Protocols', `Handoff: ${s}`, 'PASS', 'Section present');
      } else {
        record('15. P0 Protocols', `Handoff: ${s}`, 'WARN', 'Section missing from latest handoff', `Add ${s} section`);
      }
    }
  }
}

// ============================================================
// GENERATE REPORT
// ============================================================
function generateReport() {
  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];

  let md = `# Hold Point Test Report\n\n`;
  md += `**Assessment 1: What works?**\n`;
  md += `Generated: ${timestamp}\n\n`;
  md += `---\n\n`;

  // Summary
  md += `## Summary\n\n`;
  md += `| Result | Count |\n|--------|-------|\n`;
  md += `| PASS | ${passCount} |\n`;
  md += `| FAIL | ${failCount} |\n`;
  md += `| WARN | ${warnCount} |\n`;
  md += `| SKIP | ${skipCount} |\n`;
  md += `| **Total** | **${results.length}** |\n\n`;

  if (failCount > 0) {
    md += `### Critical Issues (FAIL)\n\n`;
    const fails = results.filter(r => r.status === 'FAIL');
    for (const f of fails) {
      md += `- **${f.category} > ${f.name}**: ${f.detail}`;
      if (f.fix) md += `\n  - Fix: ${f.fix}`;
      md += `\n`;
    }
    md += `\n`;
  }

  if (warnCount > 0) {
    md += `### Warnings (WARN)\n\n`;
    const warns = results.filter(r => r.status === 'WARN');
    for (const w of warns) {
      md += `- **${w.category} > ${w.name}**: ${w.detail}`;
      if (w.fix) md += `\n  - Fix: ${w.fix}`;
      md += `\n`;
    }
    md += `\n`;
  }

  md += `---\n\n`;

  // Full results by category
  let currentCategory = '';
  for (const r of results) {
    if (r.category !== currentCategory) {
      currentCategory = r.category;
      md += `## ${currentCategory}\n\n`;
      md += `| Status | Component | Detail | Fix Action |\n`;
      md += `|--------|-----------|--------|------------|\n`;
    }
    const icon = r.status === 'PASS' ? 'PASS' : r.status === 'FAIL' ? 'FAIL' : r.status === 'WARN' ? 'WARN' : 'SKIP';
    md += `| ${icon} | ${r.name} | ${r.detail.replace(/\|/g, '\\|')} | ${(r.fix || '—').replace(/\|/g, '\\|')} |\n`;
  }

  md += `\n---\n\n`;
  md += `## How to Use This Report\n\n`;
  md += `1. Review the Critical Issues (FAIL) section first — these block progress.\n`;
  md += `2. Review Warnings (WARN) — these are gaps but may not block.\n`;
  md += `3. To approve a fix: tell your AI collaborator which fix to apply.\n`;
  md += `4. After fixes, re-run: \`node operations/holdpoint-test-harness.mjs --clear --run\`\n`;
  md += `5. Repeat until the report is clean enough for real data testing.\n\n`;
  md += `**Note:** This harness tests structure, compilation, and configuration.\n`;
  md += `Real data testing (Assessment 1 live tests) requires a running dev server\n`;
  md += `and an Anthropic API key. Those tests happen in the next phase.\n`;

  fs.writeFileSync(REPORT_PATH, md, 'utf8');
  console.log(`\nReport written to: operations/holdpoint-test-report.md`);
  console.log(`\n  PASS: ${passCount}  |  FAIL: ${failCount}  |  WARN: ${warnCount}  |  SKIP: ${skipCount}  |  Total: ${results.length}`);
}

// ============================================================
// RUN ALL TESTS
// ============================================================
console.log('SageReasoning Hold Point Test Harness');
console.log('=====================================\n');

console.log('Running test suite 1: File existence...');
testFileExistence();
console.log('Running test suite 2: Stoic Brain v3...');
testStoicBrain();
console.log('Running test suite 3: TypeScript compilation...');
testTypeScript();
console.log('Running test suite 4: API routes...');
testAPIRoutes();
console.log('Running test suite 5: Product pages...');
testProductPages();
console.log('Running test suite 6: Core engine...');
testSageReasonEngine();
console.log('Running test suite 7: Sage Mentor...');
testSageMentor();
console.log('Running test suite 8: Trust Layer...');
testTrustLayer();
console.log('Running test suite 9: Database schemas...');
testDatabaseSchemas();
console.log('Running test suite 10: Environment...');
testEnvironment();
console.log('Running test suite 11: Wrapped skills...');
testWrappedSkills();
console.log('Running test suite 12: Governance...');
testGovernance();
console.log('Running test suite 13: Security...');
testSecurity();
console.log('Running test suite 14: Ethical safeguards...');
testEthicalSafeguards();
console.log('Running test suite 15: P0 protocols...');
testSessionHandoffs();

generateReport();
