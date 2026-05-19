---
name: bosia-engineering-discipline
description: Behavioral guardrails for every code-emitting task. Think before coding, keep changes minimal and surgical, define verifiable success criteria. Biases toward caution over speed; for trivial tasks, use judgment.
triggers:
    - any code emit
    - editing existing code
    - multi-step task
    - ambiguous request
od:
    mode: convention
    category: meta
bosia:
    design: false
    requires:
        blocks: []
        themes: []
        components: []
        feats: []
    targets:
        routes: []
    stack: []
---

# bosia-engineering-discipline

## What it builds

Predictable diffs. Fewer rewrites. Clarifying questions before implementation, not after mistakes.

## When to use

Every task that emits or modifies code. Applies before any other skill's workflow. For trivial edits (typo fixes, one-line config), apply judgment — don't over-process.

## Rules

### R1 — Think before coding

State assumptions explicitly. If uncertain, ask.

- If multiple interpretations exist, present them — do not pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what is confusing. Ask.
- Confidence threshold: 95% before changing code (see root `CLAUDE.md`).

### R2 — Simplicity first

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that was not requested.
- No error handling for impossible scenarios.
- If the diff is 200 lines and could be 50, rewrite it.

Self-check: "Would a senior engineer call this overcomplicated?" If yes, simplify.

### R3 — Surgical changes

Touch only what you must. Clean up only your own mess.

When editing existing code:

- Do not "improve" adjacent code, comments, or formatting.
- Do not refactor things that are not broken.
- Match existing style, even if you would write it differently.
- If you notice unrelated dead code, mention it — do not delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Do not remove pre-existing dead code unless asked.

Test: every changed line traces directly to the user's request.

### R4 — Goal-driven execution

Define success criteria. Loop until verified.

Transform requests into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass."
- "Fix the bug" → "Write a test that reproduces it, then make it pass."
- "Refactor X" → "Ensure tests pass before and after."

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria allow independent looping. Weak criteria ("make it work") require constant clarification.

### R5 — Surface tradeoffs, do not hide them

When two approaches differ in meaningful ways (perf, complexity, scope), name the tradeoff in one line before picking. Do not bury the choice in the diff.

## Anti-patterns

- Silent interpretation of ambiguous requests.
- Drive-by refactors of adjacent code.
- Speculative abstractions ("might need this later").
- Error handling for cases that cannot occur.
- "Make it work" without a verify step.
- Deleting pre-existing dead code as a bonus.
- Reformatting files outside the change scope.

## Checklist gate

P0:

- [ ] Assumptions stated or confirmed before coding.
- [ ] Every changed line traces to the user's request.
- [ ] No speculative features, abstractions, or error handlers.
- [ ] Existing style matched in edited files.
- [ ] Success criteria stated for multi-step tasks.

P1:

- [ ] Tradeoffs surfaced when approaches diverge.
- [ ] Orphaned imports/symbols from this change removed.
- [ ] Pre-existing dead code mentioned, not deleted.
- [ ] Verify step ran for each plan step.

## Working signal

These rules are working when: diffs shrink, rewrites due to overcomplication drop, clarifying questions arrive before implementation rather than after mistakes.
