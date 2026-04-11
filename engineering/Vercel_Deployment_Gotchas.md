# Vercel Deployment Gotchas

**Created:** 11 April 2026 · Session 16
**Purpose:** Quick reference for known Vercel behaviours that have caused production issues during SageReasoning development. Consult before any session that deploys and tests.

---

## 1. Redirect Strips Authorization Headers

**What happens:** Vercel redirects bare domain (`sagereasoning.com`) to `www.sagereasoning.com`. The browser's Fetch API correctly strips the `Authorization` header on cross-origin redirects. Any HTTP self-call from server code through the public URL loses auth on redirect.

**Symptom:** 401 errors on endpoints that work fine when called directly. Appears as "requireAuth() hangs" or "auth middleware broken."

**Fix:** Never make HTTP self-calls through the public URL within the same application. Use direct function imports instead (`import { runSageReason } from '@/lib/sage-reason-engine'`). If you must call another route, use the internal URL without redirect.

**Sessions affected:** 3, 4, 5 (cost 2+ sessions to diagnose).

---

## 2. Deployment Propagation Delay

**What happens:** After pushing a commit, Vercel builds and deploys. The new deployment is not instant — there is a build + propagation window (typically 30–90 seconds, sometimes longer for cold regions).

**Symptom:** Testing a fix immediately after push shows the old behaviour. Leads to false conclusion that the fix didn't work.

**Fix:** After pushing, check the Vercel dashboard → Deployments. Wait for the latest deployment to show "Ready" status before testing. If the `/api/health` endpoint returns a build timestamp or commit hash, compare against your latest commit.

**Sessions affected:** 3 (uncommitted changes assumed to be live).

---

## 3. Serverless Cold Starts

**What happens:** Each Vercel serverless function runs in its own container. Low-traffic functions may have their containers recycled. The next request triggers a cold start (container spin-up + module initialization).

**Symptom:** First request after idle period is slow (1–3 seconds). In-memory caches (like the project context 1-hour cache) are empty on cold start and may rarely hit for low-traffic endpoints.

**Implication for SageReasoning:** The in-memory cache in `project-context.ts` provides little benefit at current traffic levels. This is not harmful (falls back to Supabase), but the code implies caching behaviour that may not materialise. Monitor cache hit rates post-launch.

---

## 4. Environment Variable Availability

**What happens:** Variables prefixed with `NEXT_PUBLIC_` are available in both server and client code. All other variables are server-only. Variables set in Vercel dashboard are available after the next deployment — they do not take effect retroactively on running containers.

**Symptom:** Adding a new env var in Vercel dashboard, then testing without redeploying → the variable is undefined. Also: using a non-`NEXT_PUBLIC_` variable in client-side React code → undefined at runtime, no build error.

**Fix:** After adding or changing env vars in Vercel, trigger a redeployment (push a commit, or use Vercel dashboard → Redeploy). Verify by checking the variable in a server-side route (e.g., add a temporary log line, or check `/api/health`).

---

## 5. Function Bundling and Import Size

**What happens:** Vercel bundles each API route as a separate serverless function. Heavy imports (large libraries, big compiled data files) increase cold start time and memory usage for every route that imports them.

**Implication for SageReasoning:** `stoic-brain-compiled.ts` (438 lines) is imported by every `runSageReason` call. This is acceptable for now. If cold starts become a problem post-launch, consider moving to Vercel Edge Config or KV for the Stoic Brain data.

---

## 6. Stale Vercel Cache During Debugging

**What happens:** Vercel may cache responses at the edge layer, especially for GET endpoints or responses with cache headers. During debugging, cached responses can mask whether a fix has taken effect.

**Symptom:** Deploying a fix but seeing the same old response. Adding `?bust=random` to the URL works for GET requests but not POST.

**Fix:** For debugging, add `Cache-Control: no-store` to response headers temporarily. For production, use appropriate cache headers per endpoint. SageReasoning POST endpoints should never be cached.

---

## 7. Supabase Rate Limits on Auth

**What happens:** Supabase rate-limits magic link emails. Requesting multiple magic links in quick succession triggers "email rate exceeded" errors.

**Symptom:** During auth debugging, rapid retry of magic link requests produces rate limit errors, adding confusion to an already frustrating debugging session.

**Fix:** Wait at least 60 seconds between magic link requests. If rate-limited, wait 5 minutes before retrying. When suggesting auth debugging steps, always mention the rate limit window before suggesting retries.

**Session affected:** 7 (auth middleware incident).

---

*Reference this document before any deployment session. Update when new gotchas are discovered.*
