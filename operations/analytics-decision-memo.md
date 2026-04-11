# Analytics Platform Decision — Plausible vs Fathom
**Date:** 11 April 2026  
**Status:** Pending founder decision  
**Author:** Sage-Tech agent  
**Follows:** P0 communication signals — this is an "Explore this" output. No installation has occurred.

---

## The Decision

SageReasoning needs a privacy-respecting analytics platform to understand how humans use the website. The two leading candidates are **Plausible Analytics** and **Fathom Analytics**. Both are good choices. The differences are real but not large. This memo presents the material differences so you can decide.

**Recommendation:** Plausible Analytics — with reasoning below. But you decide.

---

## What We Actually Need to Know

Before comparing tools, it's worth being explicit about what we need analytics to answer:

1. Which pages do humans actually use? (Are the tools people see on the website being used?)
2. Where do humans come from? (Direct, organic search, social, referrals)
3. Do UTM-tagged campaigns work? (Which marketing activities drive real visits)
4. What does the conversion funnel look like? (Homepage → tool use → sign-up)
5. Are there technical failures we're missing? (High bounce on a tool page may indicate a broken flow)

We do **not** need:
- Individual user tracking
- Session recordings
- Heatmaps (at this stage)
- Funnel visualisations beyond basic page flow
- Real-time dashboards (weekly is sufficient for a pre-launch product)

This matters because both tools do what we need, and neither overdoes it in ways that would violate R17.

---

## Comparison

| Factor | Plausible Analytics | Fathom Analytics |
|---|---|---|
| **Privacy** | Cookie-free, GDPR/CCPA compliant by design, no personal data collected | Cookie-free, GDPR/CCPA compliant by design, no personal data collected |
| **Data ownership** | Data processed in EU (GDPR-aligned) | Data processed by Fathom (Canadian-owned — PIPEDA) |
| **Pricing (at current scale)** | EU-hosted: from €9/month (10k pageviews). Standard: from $9/month | From $14/month (100k pageviews — lower tier not available) |
| **Open source** | Yes (AGPL-3.0 — can self-host) | No |
| **Self-hosting option** | Yes — run on your own server or Vercel | No |
| **UTM parameter support** | Yes — full UTM tracking, campaign/source/medium breakdown in dashboard | Yes — full UTM tracking |
| **Goals / conversions** | Yes — custom goal tracking (sign-up, tool use, etc.) | Yes — custom event tracking |
| **API access** | Yes — query your analytics programmatically | Yes |
| **Team access** | Yes (multiple users) | Yes |
| **Next.js integration** | Official `@plausible/next` package or simple script tag | Script tag or community Next.js package |
| **Dashboard shareable** | Yes — public/private link to share analytics | Yes |
| **SageReasoning alignment (R17)** | ✅ No cookies, no personal data, EU-hosted option. Fully compliant with R17 intent | ✅ No cookies, no personal data. Fully compliant with R17 intent |

---

## Key Differences That Matter

**1. Price at this stage**  
Plausible starts at $9/month (or €9/month for EU hosting). Fathom starts at $14/month. At pre-launch volume, this is not material — but Plausible's lower entry tier is appropriate given we have no paid users yet.

**2. Self-hosting**  
Plausible can be self-hosted (Vercel or a small VPS). This is relevant to R17: if the founder ever wants zero data leaving their control, Plausible makes that possible. Fathom is SaaS-only.

**3. Open source**  
Plausible's codebase is public (AGPL-3.0). Fathom is proprietary. For a company whose product is built on principled reasoning and transparency, using open-source infrastructure where possible is consistent with the values.

**4. Data jurisdiction**  
Both are compliant with privacy law. Plausible offers EU-hosting (data stays in EU). Fathom is Canadian-owned and operates under PIPEDA. Both are fine. EU-hosting may be relevant if European users are an expected audience.

**5. Maturity and ecosystem**  
Both are mature products with good reputations in the privacy-respecting analytics space. Plausible is slightly larger and has a more active public community. Fathom has strong customer service reputation. Neither is a risk.

---

## Recommendation: Plausible

**Why Plausible:**
- Lower entry cost at pre-launch scale
- Self-hosting option preserves the ability to go fully self-sovereign later
- Open source aligns with the transparency values SageReasoning stands for
- EU-hosting available for complete data residency

**One thing to consider:** If Fathom's UI is meaningfully more useful to you day-to-day, that's a valid reason to choose it. Look at both dashboards (both offer trials). The tool you'll actually check is better than the theoretically superior one.

**I'm confident** this is a Standard risk decision (additive, no existing functionality affected). You can try either and switch if it doesn't work. Analytics platforms don't create lock-in.

---

## UTM Parameter Conventions

These conventions apply regardless of which platform is chosen. UTMs should be added to all external links that direct traffic to sagereasoning.com from controlled sources (social posts, email campaigns, newsletter mentions, launch posts, etc.).

### Standard Format
```
https://sagereasoning.com?utm_source={source}&utm_medium={medium}&utm_campaign={campaign}&utm_content={content}
```

### Source — Where the traffic comes from

| Value | When to use |
|---|---|
| `twitter` | Links in Twitter/X posts or profile |
| `linkedin` | Links in LinkedIn posts or profile |
| `substack` | Links in newsletter or Substack posts |
| `email` | Direct email campaigns |
| `product-hunt` | Product Hunt launch |
| `hacker-news` | HN posts or comments |
| `github` | Links in GitHub repos, READMEs, or profile |
| `devrel` | Developer relations activities (conference links, meetup resources) |
| `partner` | Links from named partner sites (use separate UTM per partner if possible) |
| `direct` | Intentionally placed direct links (e.g. business card QR code) |

### Medium — Type of marketing channel

| Value | When to use |
|---|---|
| `social` | All organic social media posts |
| `email` | Email (both newsletters and direct outreach) |
| `cpc` | Paid advertising (if ever run) |
| `referral` | A third party linking to you |
| `content` | Blog posts, tutorials, written content |
| `devrel` | Developer relations events and talks |
| `launch` | Product launches (PH, HN, etc.) |
| `organic` | Do not use — this is set automatically by analytics platforms for search traffic |

### Campaign — What initiative this belongs to

Lowercase, hyphenated, date-optional for time-bound campaigns.

| Pattern | Example | When |
|---|---|---|
| `{initiative}` | `p0-launch` | Launch activities |
| `{audience}-{initiative}` | `agent-devs-waitlist` | Audience-specific campaigns |
| `{month}-{year}` | `april-2026` | Monthly newsletter |
| `{product}-{initiative}` | `stoic-brain-launch` | Product-specific campaigns |

### Content — Which specific piece of content

Use when multiple pieces of content point to the same destination in the same campaign — to identify which one drove traffic.

| Pattern | Example |
|---|---|
| `{post-title-slug}` | `why-stoic-agents` |
| `{asset-type}-{n}` | `social-card-1`, `social-card-2` |
| `{cta-text-slug}` | `try-free-btn` |

### Complete Examples

```
# Newsletter mention linking to the score tool
https://sagereasoning.com/score?utm_source=substack&utm_medium=email&utm_campaign=april-2026&utm_content=score-cta

# Product Hunt launch post
https://sagereasoning.com?utm_source=product-hunt&utm_medium=launch&utm_campaign=p0-launch

# GitHub README link to agent documentation
https://sagereasoning.com/api?utm_source=github&utm_medium=content&utm_campaign=agent-devs-waitlist&utm_content=readme-link

# Twitter post about the Stoic Brain dataset
https://sagereasoning.com/stoic-brain?utm_source=twitter&utm_medium=social&utm_campaign=agent-devs-waitlist&utm_content=stoic-brain-post-1
```

### UTM Hygiene Rules

1. **Always use lowercase.** `Twitter` and `twitter` are treated as different values by analytics platforms.
2. **No spaces.** Use hyphens. `april 2026` will break; `april-2026` works.
3. **Don't UTM tag internal links.** Links between your own pages don't need UTMs and can distort your source attribution.
4. **Don't UTM tag organic social posts if they're genuinely organic** — the platform attribution will handle it. UTMs are for posts where you want to distinguish between different pieces of content or campaigns.
5. **UTM content is optional.** Add it when you're posting multiple things to the same destination in the same campaign and want to know which worked. Skip it for simple, single-destination links.

---

## Next Steps (founder decision required)

**Decision 1:** Plausible or Fathom?  
→ Try both demo/trial dashboards if you want to compare UI. Your call.

**Decision 2:** Install now or after P2 safeguards are in place?  
→ Analytics is Standard risk. It can be installed now. It does not interact with the LLM pipeline, database, or auth system. But if you'd prefer to batch infrastructure decisions with P2, that's also fine.

**Decision 3:** Self-host Plausible (if chosen) or use their cloud?  
→ Cloud is simpler and €9/month is trivial. Self-hosting is available if data sovereignty becomes a priority later.

**Once decided:** Installation requires adding one script tag to `website/src/app/layout.tsx` and configuring the domain in the platform's dashboard. That's it. I can do this in 10 minutes — just say the word.

---

*This memo does not constitute a deployment. Nothing has been installed. Awaiting founder decision.*
