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
| sage-guard | POST /api/guardrail | ~$0.0025 | Yes |
| sage-score | POST /api/score or /api/reason | ~$0.18 | Yes |
| sage-iterate | POST /api/score-iterate | ~$0.18 | Optional |

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

## OpenBrain Integration Pattern

If you're using an OpenBrain-style architecture (persistent memory + AI sorter +
agents), sage wrappers integrate at three points in the pipeline:

### 1. AI Sorter (Step 4) — sage-classify

Replace your raw LLM classification with reasoned classification:

```
function openbrain_sort(input, categories, api_key):

    result = POST /api/skill/sage-classify {
        input: input,
        categories: categories,       # your OpenBrain table definitions
        confidence_threshold: 0.7      # below this → stays in inbox
    }

    if result.action == "hold_for_review":
        route_to_inbox(input, result.reasoning_receipt)
    elif result.action == "flag_urgent":
        route_to_table(result.category, input)
        alert_owner("Passion-driven input detected", result)
    else:
        route_to_table(result.category, input)

    # Store the reasoning receipt in your immutable log
    store_receipt(result.reasoning_receipt)
```

### 2. Proactive Agent Loop (Step 9) — sage-prioritise

When your agent revisits data and decides what to work on:

```
function agent_priority_loop(tasks, objective, api_key):

    result = POST /api/skill/sage-prioritise {
        items: tasks,            # array of {id, description, source, urgency_signal}
        objective: objective,
        horizon: "today"
    }

    for item in result.ranked_items:
        if item.action == "do_now":
            execute_task(item.id)
        elif item.action == "reconsider":
            deeper = POST /api/reason { input: item.reasoning, depth: "standard" }
            review_with_owner(item.id, deeper)
```

### 3. Pre/Post Action Gates — sage-guard + sage-score

Use the standard wrapper pattern (above) around any agent action to ensure
reasoning quality before and after execution.

### Discovery

All sage skills are available as MCP-compatible tools:

```
GET /api/mcp/tools                    # all tools
GET /api/mcp/tools?preset=openbrain   # curated OpenBrain toolset (6 skills)
GET /api/mcp/tools?full=true          # full MCP server capabilities
```

## Disclaimer

Ancient reasoning, modern application. Does not consider legal, medical,
financial, or personal obligations.
