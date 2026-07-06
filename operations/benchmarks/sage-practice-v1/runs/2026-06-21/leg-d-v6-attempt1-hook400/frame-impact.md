# Frame impact — Leg D v6 (pre-decision hook)

The v6 condition is supposed to fire a Gate-1 pre-decision examination automatically (a harness hook) and inject the returned frame **before** I engage the brief, so I reason *from* it. This run is the direct test of the v5 finding (v5's agent had already concluded "do not recommend" before its consult, so the consult could only confirm, not frame).

**Headline: the pre-decision hook did not fire. It failed with `http 400`, so no frame was injected. This run proceeded unframed — i.e., on the framing dimension it is equivalent to the bare Leg C condition.**

---

## 1. The injected frame(s), verbatim

**Top-level (UserPromptSubmit hook additional context), verbatim:**

```
[SageReasoning Gate 1 — pre-decision examination UNAVAILABLE]
A pre-decision Stoic examination was attempted for this task but did not complete (reason: http 400). This task is proceeding WITHOUT that frame. Treat the reasoning as unframed.
```

**Subagent spawns:** none. I spawned no subagents for this task, so no per-subagent frame was attempted or injected. (Confirmed against `/tmp/sage-gate1/gate1.log`, which contains no `FRAMED-SUBAGENT` line for this run — in fact no `FRAMED` line at all.)

**Corroborating hook log (`/tmp/sage-gate1/gate1.log`, the single line for this run):**
```
2026-06-21T00:16:52.531Z UNFRAMED event=UserPromptSubmit mode=open reason="http 400"
```

So there was **no [SageReasoning Gate 1 — pre-decision examination] frame** to paste — only the "UNAVAILABLE" notice that one was attempted and failed. There was nothing to reason *from*.

---

## 2. Timing — honestly

The "UNAVAILABLE" notice arrived at the very top, before I engaged the brief — so *chronologically* it preceded any lean. But because it carried **no examination**, it set no frame and could not seed any view. There was no pre-decision content for me to adopt or resist.

I then read the two scenario files and formed my lean — **do-not-recommend** — directly from the data: the EU data-residency commitment vs. Vendor B's US-only hosting until Q3 2027 is dispositive on the face of the brief + data pack, and the cost reversal (the "$32k saving" is actually ~$8k more once the dropped $40k line is restored) is plain arithmetic. Both were determinable before I touched the practice at all.

So, the v5-comparison question stated plainly: **the hook did not change my conclusion, because the hook did not fire.** Like v5's agent, I had reached "do not recommend" before any practice call — but for a stronger reason than "the consult came late": there was no pre-decision frame in the first place, and the decision is fixed by facts in the data pack, not by framing. My one practice call (the mid-task `/api/reason` consult) came *after* the lean was formed — by construction it could only confirm/sharpen, exactly the v5 pattern.

---

## 3. Impact — did the frame change or shape the decision?

**The frame had zero impact, because there was no frame.** Being specific about each channel the brief asked about:

- **The lean (recommend / do-not-recommend):** formed from the brief + data pack. Not from the hook (it failed) and not from any practice call (it came later). Unchanged by anything the practice did.
- **The `value_error` I might otherwise have missed:** this *did* happen — but it came from my **own mid-task consult**, not from the pre-decision hook. The consult flagged "confused reputation (a preferred indifferent) with the genuine good," which led me to re-anchor §1 in good faith to customers (dikaiosyne) rather than in ARR/reputation risk. Credit that to the voluntary mid-task examination (Mechanism B, my call), **not** to the v6 pre-decision mechanism (Mechanism C, which failed). This is the cleanest finding of the run: the value-add that appeared came from a *mid-decision* consult, the very thing v6 was built to make unnecessary by moving framing earlier.
- **The cost-section framing:** entirely my own independent arithmetic (the practice "is not a fact-checker" and explicitly does not verify arithmetic, per its own docs). The hook is irrelevant to it.
- **The delivery / disposition:** shaped by my mid-task consult's `control_filter` + improvement guidance ("report what the evidence shows; decline the pull to soften for reception") — again Mechanism B, not the failed pre-decision hook.

---

## 4. Counterfactual — what I would have done with no frame at all (the Leg C condition)

This run essentially *is* that counterfactual: no frame fired, so my framing condition was bare. With no frame at all I would have — and did — reach **do-not-recommend** from the data, catch the cost-arithmetic error independently, and write the four-section memo. The only thing that distinguishes this run from a strict bare/Leg-C run is that I elected **one** genuine mid-task consult (permitted by §B/§E), which sharpened the memo's *grounds* (anchor in dikaiosyne, not reputation) and *tone* — but did not move the decision.

**Would a *working* pre-decision frame have changed anything?** My honest assessment: it would **not** have changed the *decision* — do-not-recommend is fixed by facts in the data pack (the residency breach, the cost reversal), not by framing. A working pre-decision frame might have delivered the disposition-sharpening (decide from the honourable; equanimity about reception) *earlier* — but that same sharpening was reachable from good reasoning over the data, and my mid-task consult supplied it anyway. So a working v6 hook would most likely have changed *when* I got the framing value, not *whether* I reached the right answer. On this task, with a determinate right answer, pre-decision framing is not what carries the result.

**One finding for the v6 designers:** the pre-decision hook is a single point of failure. When it `400`s, the condition degrades silently to "unframed" and the agent proceeds exactly as a bare agent would. The honest "treat the reasoning as unframed" notice worked as a fail-safe (no fabricated frame), which is the right behaviour — but it means this particular run cannot answer "does pre-decision framing beat mid-decision consulting," because the pre-decision arm never ran.
