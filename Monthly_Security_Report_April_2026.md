# SageReasoning Monthly Security Report — April 2026

**Date:** April 1, 2026
**Scope:** npm dependency vulnerabilities, secrets in git, outdated packages

---

## Vulnerabilities

**11 total issues found: 10 high severity, 1 moderate.** No critical issues.

Here's what matters most:

**Next.js (your website framework) — HIGH — 5 known vulnerabilities.**
Your site runs Next.js version 14.2.35. This version has multiple known security holes including ways an attacker could potentially bypass login protections or cause the site to crash. The fix requires upgrading to Next.js 16, which is a major version jump and will likely need code changes.

**What to do:** This is the most important item. When you're ready for the next development session, upgrading Next.js from v14 to v16 should be a priority. This will also fix the eslint-config-next vulnerability. The upgrade may require some code adjustments since it skips a major version.

**react-simple-maps (the world map component) — HIGH.**
The map library pulls in older versions of d3 (a charting library) that have a vulnerability where a specially crafted input could slow down or freeze the page. The fix requires downgrading react-simple-maps to v1, which would likely break the map feature.

**What to do:** This is lower urgency since the map is a visual feature, not a login or data-handling component. Keep an eye out for a newer version of react-simple-maps that fixes this without a downgrade.

**picomatch — HIGH.**
A file-matching tool used behind the scenes. Has a vulnerability where crafted input could slow down processing. An automatic fix is available.

**What to do:** Run `npm audit fix` in the website folder — this should patch picomatch automatically without breaking anything.

**brace-expansion — MODERATE.**
Similar to picomatch — a utility that could hang if given specially crafted input. Also fixable automatically.

**What to do:** Same as above — `npm audit fix` should handle this one too.

---

## Secrets Check

**PASS — No secrets found in git history.**

Your `.gitignore` file correctly blocks `.env`, `.env.local`, and `.env.production` from being committed. The only environment-related file in git history is `.env.example`, which contains only placeholder text like "your-anon-key-here" — no real keys or passwords.

I also scanned the last 20 commits for anything that looks like an API key, password, or secret token. The word "secret" did appear in recent commits, but only inside Latin text from Stoic philosophy source material (Seneca's letters), not as actual credentials. All clear.

---

## Outdated Packages

Several packages are significantly behind their latest versions:

| Package | Your Version | Latest | Gap |
|---------|-------------|--------|-----|
| **Next.js** | 14.2.35 | 16.2.1 | 2 major versions behind |
| **React** | 18.3.1 | 19.2.4 | 1 major version behind |
| **React DOM** | 18.3.1 | 19.2.4 | 1 major version behind |
| **ESLint** | 8.57.1 | 10.1.0 | 2 major versions behind |
| **Tailwind CSS** | 3.4.19 | 4.2.2 | 1 major version behind |
| **TypeScript** | 5.9.3 | 6.0.2 | 1 major version behind |
| **@types/node** | 20.19.37 | 25.5.0 | 5 major versions behind |
| **@types/react** | 18.3.28 | 19.2.14 | 1 major version behind |
| **@supabase/ssr** | 0.5.2 | 0.10.0 | Minor versions behind |

**What this means:** Being behind on major versions means you're missing out on security patches that older versions no longer receive. The biggest concern is Next.js (v14 vs v16) since it's the core framework and has active vulnerabilities.

**What to do:** Don't try to update all of these at once. A good plan would be: (1) run `npm audit fix` first to grab the easy wins, (2) plan a Next.js + React upgrade as a dedicated task — going from React 18 to 19 and Next.js 14 to 16 together makes sense since they're related, (3) Tailwind and ESLint can be updated separately later.

---

## Summary

The site has no leaked secrets and your `.gitignore` is set up correctly — that's the most important thing. The main action item is the Next.js upgrade, which will fix the majority of the vulnerabilities. In the meantime, running `npm audit fix` will patch 2 of the 11 issues automatically with no risk of breaking anything.
