---
name: bosia-debug-discipline
description: Debug by root-cause, not by patching symptoms. After two wrong guesses, stop editing — read the framework source that owns the symptom, write a minimal reproduction, state the hypothesis before the next change.
triggers:
  - error
  - crash
  - doesn't work
  - not working
  - broken
  - debug
  - TypeError
  - ReferenceError
  - 500
  - 404
  - fix
od:
  mode: discipline
  category: process
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

# bosia-debug-discipline

## What it does

Forces root-cause debugging when a fix isn't landing on the first try. Most "recurring" bugs in this codebase were not framework issues — they were the agent patching the wrong layer twice in a row instead of opening the framework source that owned the symptom.

## When to apply

- Any time you've written a "fix" and it didn't resolve the reported symptom.
- The user says "still broken", "same error", "didn't fix it", or pastes the same stack trace.
- You're about to make the **third** attempt at the same symptom.

## Rules

### R1 — Two-guess limit

After **two** edits aimed at the same symptom that don't land, **stop editing**. Do not write a third speculative fix. The cost of the third wrong guess (regressions, churn, lost user trust) is higher than the cost of pausing to read.

### R2 — Read the framework source that owns the symptom

When the message says `TypeError: crypto.randomUUID is not a function` and you've already changed your code twice, the next step is **not** another guess — it's opening the file that throws. Use `fs_read` on the framework / registry path the symptom names (stack trace, error origin). Read the function that produces the message. Then form a hypothesis.

Common owner-locations to check:

- Routing / 404 / matched route — `bosia/registry/.../routes` and `+page.server.ts` exports.
- Auth / cookie / session error — `hooks.server.ts`, `bosia-cookies`, `bosia-bun-runtime`.
- DB / query / schema mismatch — `*.repository.ts` + `*.table.ts`, then the generated migration.
- Layout `data.x is undefined` — the layout chain (`+layout.server.ts` at each depth). See [[bosia-page-shell]] R5.5.

### R3 — Minimal reproduction before edit

Strip the failure to the smallest case that still fails:

- One page, one component, one route handler.
- Replace external data with a literal.
- If the failure goes away in the minimal repro, the bug is in what you removed — re-add pieces until it fails again.

A minimal repro that still fails tells you exactly where to fix; a minimal repro that doesn't tells you the symptom isn't in the code you suspected.

### R4 — State the hypothesis before the next edit

Write down (in the chat, before any tool call):

1. What you think is wrong.
2. Why — citing a specific line you read.
3. What the next edit should change.
4. What outcome would falsify the hypothesis.

If you can't state these four, you don't have a hypothesis yet — keep reading.

### R5 — Don't bury the symptom

Anti-pattern: wrapping the failing call in `try { ... } catch { /* ignore */ }` so the error stops appearing. The bug is still there, now harder to find. If a `try/catch` is the right call, it must do something useful in the `catch` (fallback value, retry, user-visible message) — never swallow.

Same rule for: disabling tests instead of fixing them, removing the assertion instead of fixing the data, deleting the offending file instead of reading why it exists.

## Workflow

1. **Reproduce.** Run the failing path. Capture the exact error message + stack.
2. **First fix attempt.** One specific change with a stated hypothesis.
3. **Re-run.** Did the exact symptom change? (Different error counts.)
4. **Still failing?** Second attempt — but only if the hypothesis is **different** from #2, not "same idea, different syntax".
5. **Still failing → STOP.** Open the framework source. Read it. Apply R3 + R4.
6. **Third attempt is informed**, not speculative.

## Bosia conventions

- [[bosia-engineering-discipline]] — minimal & surgical changes; this skill is the debugging-time companion.
- [[bosia-clean-architecture]] — when the symptom crosses layers, check the layer boundary first (route → service → repository).

## Checklist gate

P0:

- [ ] After two failed attempts, the framework source for the symptom has been read with `fs_read`.
- [ ] A hypothesis is written down before the third edit.
- [ ] No `try/catch { /* ignore */ }` introduced to hide the symptom.

P1:

- [ ] If the bug is upstream (registry / bosia framework), the fix lands there — not patched repeatedly in the user app.
