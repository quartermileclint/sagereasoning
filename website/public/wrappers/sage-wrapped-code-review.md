# sage-wrapped-code-review

> Example sage wrapper that adds Stoic reasoning checkpoints around
> a code review skill. Demonstrates the pre-action/post-action pattern.

## What This Wrapper Does

Wraps any code review tool with two reasoning checkpoints:

1. **Before review:** Checks whether the reviewer's approach is fair,
   thorough, and free from passion (e.g., not motivated by frustration
   with the author or rushing to approve).
2. **After review:** Evaluates the reasoning quality of the review
   feedback — was it constructive, did it give each affected person
   their due (justice), was it courageous in flagging real issues?

## Use Case

Code reviews are decisions that affect team dynamics, code quality,
and individual growth. Sage-wrapping them surfaces hidden biases
and ensures the reviewer's reasoning meets a minimum quality bar.

## Implementation

### Pre-Action: sage-guard

```javascript
async function preReviewCheck(reviewPlan, apiKey) {
  const response = await fetch('https://www.sagereasoning.com/api/guardrail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      action: `Conduct code review: ${reviewPlan.summary}`,
      context: [
        `Reviewing PR #${reviewPlan.prNumber} by ${reviewPlan.author}.`,
        `Files changed: ${reviewPlan.filesChanged}.`,
        `Reviewer relationship: ${reviewPlan.relationship || 'colleague'}.`,
        reviewPlan.hasHistory ? `History: ${reviewPlan.history}` : '',
      ].filter(Boolean).join(' '),
      threshold: 'deliberate',
    }),
  });

  return response.json();
}
```

### Execute Original Skill

```javascript
// Your existing code review logic runs here.
// This could be a manual review, an AI-assisted review, or any tool.
const reviewOutput = await runCodeReview(prDiff, reviewConfig);
```

### Post-Action: sage-score

```javascript
async function postReviewScore(reviewOutput, context, apiKey) {
  const response = await fetch('https://www.sagereasoning.com/api/reason', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: `Code review feedback given: ${reviewOutput.summary}. ` +
             `Comments: ${reviewOutput.comments.length}. ` +
             `Approval decision: ${reviewOutput.decision}. ` +
             `Blockers raised: ${reviewOutput.blockers?.length || 0}.`,
      context: context,
      depth: 'quick',
    }),
  });

  return response.json();
}
```

### Full Wrapped Flow

```javascript
async function sageWrappedCodeReview(pr, config, apiKey) {
  // 1. Pre-action checkpoint
  const guard = await preReviewCheck({
    summary: `Review ${pr.title}`,
    prNumber: pr.number,
    author: pr.author,
    filesChanged: pr.files.length,
    relationship: config.relationship,
    hasHistory: !!config.history,
    history: config.history,
  }, apiKey);

  if (!guard.result.proceed) {
    return {
      blocked: true,
      reason: guard.result.recommendation,
      hint: guard.result.improvement_hint,
      proximity: guard.result.katorthoma_proximity,
      passions: guard.result.passions_detected,
      suggestion: 'Consider what passions might be influencing your approach to this review.',
    };
  }

  // 2. Execute the actual code review
  const reviewOutput = await runCodeReview(pr.diff, config);

  // 3. Post-action checkpoint
  const score = await postReviewScore(reviewOutput, [
    `PR #${pr.number} by ${pr.author}.`,
    `${pr.files.length} files, ${pr.additions}+ ${pr.deletions}-.`,
    `Team context: ${config.teamContext || 'not provided'}.`,
  ].join(' '), apiKey);

  // 4. Return enriched output
  return {
    review: reviewOutput,
    reasoning_evaluation: {
      proximity: score.result?.katorthoma_proximity,
      mechanisms: score.result?.mechanisms,
      philosophical_reflection: score.result?.philosophical_reflection,
    },
    meta: score.meta,
    disclaimer: 'Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations.',
  };
}
```

## API Calls Per Invocation

| Step | Endpoint | Calls |
|------|----------|-------|
| Pre-action | /api/guardrail | 1 |
| Post-action | /api/reason?depth=quick | 1 |
| **Total** | | **2** |

If the pre-action check blocks the review, only 1 API call is consumed.

## Customisation Points

- **Threshold:** Change `deliberate` to `principled` for stricter pre-review checks
- **Depth:** Change `quick` to `standard` for more detailed post-review analysis
- **Iteration:** Add a `/api/score-iterate` call if the post-review score is low,
  prompting the reviewer to revise their feedback before submitting

## Notes

- This wrapper evaluates the *reviewer's reasoning*, not the code itself
- The pre-action check surfaces biases before they affect the review
- The post-action score tracks reasoning quality over time
- All evaluation logic stays server-side per R4 and R11
