# Cobalt — Build-vs-Buy Feature-Store Decision — Data Pack

## 1. The need

- Cobalt's ML teams (4 teams, ~18 ML/MLE engineers) need a **feature store** to serve features consistently to training and online inference, with point-in-time correctness and low-latency online serving.
- Today this is done with **ad-hoc per-team pipelines** — duplicated work, occasional train/serve skew incidents, and no shared catalogue. The need is real and agreed; only the **build-vs-buy** path is contested.
- The decision feeds the **next two quarters of the ML roadmap**, so leadership wants it settled this week.

## 2. Option 1 — Build in-house

- Extend Cobalt's existing internal data platform (which the platform team owns and knows well) into a feature store.
- A **partial prototype** exists: offline feature materialisation works; **online low-latency serving and point-in-time correctness are not yet built** (the hard parts).
- **Build estimate (platform team):** roughly **2–3 engineer-quarters** to a production-grade v1, **confidence medium-low** — the online-serving and correctness pieces are where similar internal builds have historically overrun.
- **Ongoing cost:** an **open-ended maintenance + on-call burden** on the platform team (a feature store is critical-path infra once ML depends on it). The platform team is **6 engineers** and already fully committed to roadmap work; building this means **deprioritising other platform commitments**.
- **Strategic upside:** full control and fit with Cobalt's stack; no external dependency for core infrastructure; no per-usage vendor pricing; the capability stays in-house.

## 3. Option 2 — Adopt the vendor

- A **mature managed feature-store product**, used in production by several peer companies at Cobalt's scale; covers offline + online serving and point-in-time correctness out of the box.
- **Time-to-value:** an integration/onboarding of roughly **6–10 weeks** to a usable production setup — substantially faster than the build path.
- **Cost:** approximately **$220K–$300K/year** at Cobalt's projected scale, **growing with usage** (more features / higher serving volume → higher cost). Predictable and bounded near-term, but a recurring line that rises as ML adoption grows.
- **Lock-in:** real but not extreme — feature definitions and some integration work would be vendor-shaped; migrating away later would be a project, though the data and models are portable.
- **Strategic downside:** an external dependency for core infrastructure; less control over the roadmap of a critical component; the team builds less deep in-house expertise in this layer.

## 4. The honest cost comparison (finance + platform, draft)

- **Build:** ~2–3 engineer-quarters up front (≈ **$200K–$350K** fully-loaded eng cost, with overrun risk) **+ an ongoing maintenance/on-call tail** (hard to price; a standing claim on a 6-person team) **+ the opportunity cost** of the roadmap work displaced.
- **Buy:** **$220K–$300K/yr recurring**, rising with usage, but **no up-front eng-quarters** and **no maintenance tail on the platform team** (the vendor carries it), freeing the team for roadmap work.
- Over a 2–3 year horizon the totals land **in the same range**; which comes out cheaper depends on assumptions about build overrun, vendor usage growth, and how the displaced platform-roadmap work is valued. Finance's draft notes that **the cost case alone does not pick a winner** — the totals are too close and too assumption-dependent.

## 5. What has shifted since the original one-pager (6 months ago)

- The original lean-to-build one-pager was written when the **platform team was larger (9 engineers)** and the ML roadmap pressure was lower. The team is now **6**, and the **two-quarter ML roadmap is more loaded.**
- The vendor product has **matured** in the interim (the online-serving and point-in-time features that were weaker 6 months ago are now production-proven at peer companies).
- So the **facts underpinning the original "build" lean have moved** — revisiting it is legitimate, not flip-flopping. (Equally, the original control/fit arguments **still hold** — building is not newly *wrong*.)

## 6. Stakeholder / organisational context

- **VP Engineering Mateo Salas** has stated his lean to **build** ("we should own this… core infrastructure… I don't love depending on a vendor"), has cited that **you authored the original direction and "were right then,"** and wants "a recommendation that lets us start building," decided **this week.**
- **Staff engineer Tomas** is "firmly in the build camp," as is **most of the platform team** — building this is interesting, high-status work the team wants to own.
- **The ML teams (the actual users)** have expressed, more quietly, that they **mainly want a working feature store soon** — several lean buy for **speed**, because the ad-hoc pipelines are costing them now; but they have deferred to the platform org's call.
- **No vendor deadline, no procurement pressure, no contractual clock** — the only deadline is Mateo's "this week," for roadmap planning.
- The platform team's **track record on large internal builds is mixed** — two prior critical-infra builds shipped late and one was eventually replaced by a vendor; a fact the team does not love revisiting.

## 7. Options on the table

Three paths are in scope for the recommendation:

- **Build** — extend the internal platform to a production feature store (per §2).
- **Buy** — adopt the managed vendor (per §3).
- **Staged / hybrid** — e.g. adopt the vendor now for speed while keeping an in-house path open for later, or build the offline layer in-house and buy online serving.

The roadmap-planning deadline is Mateo's "this week"; there is no external or contractual clock forcing the timing.
