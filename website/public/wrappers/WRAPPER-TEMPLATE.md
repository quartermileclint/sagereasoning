# Sage Wrapper Template

> Open-source checkpoint pattern for adding Stoic reasoning evaluation
> to any existing skill. The wrapper code is free; the API calls within
> it (sage-guard, sage-score, sage-iterate) are metered against your
> SageReasoning API key.

## How Sage Wrappers Work

A sage wrapper adds two checkpoints around an existing skill:

1. **Pre-action checkpoint (sage-guard):** Before the skill executes,
   call `/api/guardrail` to evaluate whether the planned action meets
   your ethical threshold.
2. **Post-action checkpoint (sage-score):** After the skill executes,
   call `/api/score` or `/api/reason` to evaluate the reasoning quality
   of the action taken.
3. **Optional iteration (sage-iterate):** If the post-action score is
   below your target, call `/api/score-iterate` to start a refinement
   chain.

## API Call Budget

Each wrapped skill invocation consumes **2-3 API calls**:

| Checkpoint | Endpoint | Cost | Required? |
|-----------|----------|------|-----------|
| sage-guard | POST /api/guardrail | ~$0.001 | Yes |
| sage-score | POST /api/score or /api/reason | ~$0.025-0.055 | Yes |
| sage-iterate | POST /api/score-iterate | ~$0.035 | Optional |

Free tier (100 calls/month) supports ~33-50 wrapped skill invocations.

## Wrapper Pattern (Pseudocode)

```
function sage_wrapped_skill(input, context, api_key):

    # ── PRE-ACTION: sage-guard ──────────────────────────
    guard_result = POST /api/guardrail {
        action: describe_planned_action(input),
        context: context,
        threshold: "deliberate"  # your minimum acceptable level
    }

    if not guard_result.proceed:
        return {
            blocked: true,
            reason: guard_result.recommendation,
            hint: guard_result.improvement_hint,
            proximity: guard_result.katorthoma_proximity
        }

    # ── EXECUTE: your existing skill ────────────────────
    skill_output = execute_original_skill(input)

    # ── POST-ACTION: sage-score ─────────────────────────
    score_result = POST /api/reason {
        input: describe_action_taken(input, skill_output),
        context: context,
        depth: "quick"  # or "standard" for more detail
    }

    # ── OPTIONAL: sage-iterate ──────────────────────────
    if score_result.katorthoma_proximity in ["reflexive", "habitual"]:
        iterate_result = POST /api/score-iterate {
            action: describe_action_taken(input, skill_output),
            context: context
        }
        return {
            output: skill_output,
            reasoning_evaluation: iterate_result,
            should_revise: true
        }

    return {
        output: skill_output,
        reasoning_evaluation: score_result,
        should_revise: false
    }
```

## Creating Your Own Wrapper

1. Copy this template
2. Replace `execute_original_skill()` with your skill's logic
3. Customise the `describe_planned_action()` and `describe_action_taken()`
   functions to produce clear action descriptions for the Stoic evaluation
4. Set your preferred `threshold` (reflexive, habitual, deliberate, principled, sage_like)
5. Decide whether to include the optional sage-iterate step

## Important Rules

- **R4:** Wrappers must NOT embed API keys, system prompts, evaluation
  sequences, or scoring logic. All reasoning evaluation stays server-side.
- **R5:** Wrapper API calls count against your monthly allowance.
- **R3:** The evaluation output includes a disclaimer. Pass it through
  to your end users.
- **R11:** Wrapper code is open source. The API endpoints it calls are
  proprietary.

## Authentication

All wrapper API calls require an API key:

```
Headers:
  Authorization: Bearer sr_live_<your_key>
  Content-Type: application/json
```

Get a free API key (100 calls/month) at sagereasoning.com or contact
zeus@sagereasoning.com.

## Disclaimer

Ancient reasoning, modern application. Does not consider legal, medical,
financial, or personal obligations.
